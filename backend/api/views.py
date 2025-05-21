from django.shortcuts import render
from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action, api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from django.conf import settings
from django.db.models import Q, Prefetch, Sum, Count
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.utils import timezone
from datetime import timedelta
import stripe
from .models import (
    User, Category, Product, Order, OrderItem,
    ProductReview, Wishlist, ProductView,
    Analytics
)
from .serializers import (
    UserSerializer, CategorySerializer, ProductSerializer,
    OrderSerializer, OrderItemSerializer, ProductReviewSerializer,
    WishlistSerializer, AnalyticsSerializer,
    DashboardAnalyticsSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.db import transaction
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_text

stripe.api_key = settings.STRIPE_SECRET_KEY

User = get_user_model()

class AuthRateThrottle(UserRateThrottle):
    rate = '3/minute'

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'created_at', 'name']
    pagination_class = PageNumberPagination

    def get_queryset(self):
        queryset = Product.objects.select_related('category').prefetch_related(
            Prefetch(
                'reviews',
                queryset=ProductReview.objects.select_related('user')
            )
        )
        
        # Category filter
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Size filter
        size = self.request.query_params.get('size', None)
        if size:
            queryset = queryset.filter(size=size)
        
        # Price range filter
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        
        if min_price is not None:
            try:
                min_price = float(min_price)
                queryset = queryset.filter(price__gte=min_price)
            except ValueError:
                pass
                
        if max_price is not None:
            try:
                max_price = float(max_price)
                queryset = queryset.filter(price__lte=max_price)
            except ValueError:
                pass
        
        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @method_decorator(cache_page(60 * 5))  # Cache for 5 minutes
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @method_decorator(cache_page(60 * 5))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def review(self, request, slug=None):
        product = self.get_object()
        user = request.user
        
        # Check if user has already reviewed
        if ProductReview.objects.filter(product=product, user=user).exists():
            return Response(
                {'error': 'You have already reviewed this product'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ProductReviewSerializer(data=request.data)
        if serializer.is_valid():
            review = serializer.save(product=product, user=user)
            # Invalidate product cache
            cache_key = f'product_{product.slug}'
            cache.delete(cache_key)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def track_view(self, request, slug=None):
        product = self.get_object()
        user = request.user if request.user.is_authenticated else None
        
        ProductView.objects.create(
            product=product,
            user=user,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        return Response(status=status.HTTP_201_CREATED)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            Prefetch(
                'items',
                queryset=OrderItem.objects.select_related('product')
            )
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            # Create order
            order = Order.objects.create(
                user=request.user,
                shipping_address=request.data.get('shipping_address', ''),
                payment_method=request.data.get('payment_method', Order.PAYMENT_METHOD_CARD)
            )

            # Process items
            items_data = request.data.get('items', [])
            order.process_order(items_data)

            # Create Stripe payment intent
            intent = stripe.PaymentIntent.create(
                amount=int(order.total_price * 100),  # Convert to cents
                currency='usd',
                metadata={
                    'order_id': order.id,
                    'user_id': request.user.id
                }
            )
            
            order.stripe_payment_intent = intent.id
            order.save()

            return Response({
                'order': OrderSerializer(order).data,
                'client_secret': intent.client_secret
            }, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except stripe.error.StripeError as e:
            if 'order' in locals():
                order.refund()
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            if 'order' in locals():
                order.refund()
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def register_user(request):
    data = request.data
    try:
        # Validate password
        if len(data.get('password', '')) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create(
            email=data['email'],
            username=data['email'],
            password=make_password(data['password']),
            first_name=data.get('name', ''),
        )
        
        # Send confirmation email
        send_confirmation_email(request, user)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
            'message': 'Please check your email to confirm your account.'
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def confirm_email(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.email_confirmed = True
        user.save()
        return Response({'message': 'Email confirmed successfully.'})
    else:
        return Response(
            {'error': 'Invalid confirmation link.'},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def login_user(request):
    user = User.objects.filter(email=request.data.get('email')).first()
    if user and user.check_password(request.data.get('password', '')):
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
        })
    return Response(
        {'error': 'Invalid credentials'}, 
        status=status.HTTP_401_UNAUTHORIZED
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_token(request):
    return Response(UserSerializer(request.user).data)

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).prefetch_related(
            'products'
        )

    @action(detail=False, methods=['post'])
    def toggle_product(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
            product = Product.objects.get(id=product_id)

            if product in wishlist.products.all():
                wishlist.products.remove(product)
                return Response({'status': 'removed'})
            else:
                wishlist.products.add(product)
                return Response({'status': 'added'})
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]
    
    def list(self, request):
        """Get today's analytics"""
        analytics = Analytics.update_daily_analytics()
        serializer = AnalyticsSerializer(analytics)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get comprehensive dashboard analytics"""
        # Get date range
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        # Get completed orders in date range
        orders = Order.objects.filter(
            payment_status=Order.PAYMENT_STATUS_COMPLETED,
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        # Calculate total revenue and orders
        total_revenue = orders.aggregate(total=Sum('total_price'))['total'] or 0
        total_orders = orders.count()
        
        # Get total products and users
        total_products = Product.objects.count()
        total_users = User.objects.count()
        
        # Get recent orders
        recent_orders = orders.order_by('-created_at')[:5]
        
        # Get top selling products
        top_products = Product.objects.annotate(
            total_sold=Sum('orderitem__quantity')
        ).order_by('-total_sold')[:5]
        
        # Get sales by category
        sales_by_category = OrderItem.objects.filter(
            order__in=orders
        ).values(
            'product__category__name'
        ).annotate(
            total=Sum('price')
        ).order_by('-total')
        
        # Get daily revenue for the past 30 days
        daily_revenue = []
        current_date = start_date
        while current_date <= end_date:
            day_revenue = orders.filter(
                created_at__date=current_date
            ).aggregate(
                total=Sum('total_price')
            )['total'] or 0
            
            daily_revenue.append({
                'date': current_date.date(),
                'revenue': day_revenue
            })
            current_date += timedelta(days=1)
        
        data = {
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'total_products': total_products,
            'total_users': total_users,
            'recent_orders': recent_orders,
            'top_products': top_products,
            'sales_by_category': dict(sales_by_category),
            'daily_revenue': daily_revenue
        }
        
        serializer = DashboardAnalyticsSerializer(data)
        return Response(serializer.data)

class ProductReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ProductReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return ProductReview.objects.select_related('user', 'product')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return Response({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError as e:
        return Response({'error': 'Invalid signature'}, status=400)
    
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        order_id = payment_intent.metadata.get('order_id')
        
        try:
            order = Order.objects.get(id=order_id)
            order.payment_status = Order.PAYMENT_STATUS_COMPLETED
            order.save()
        except Order.DoesNotExist:
            return Response(
                {'error': f'Order {order_id} not found'},
                status=404
            )
    
    return Response({'status': 'success'})

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return User.objects.all()
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_orders(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        page = self.paginate_queryset(orders)
        if page is not None:
            serializer = OrderSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
