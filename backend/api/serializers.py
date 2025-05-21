from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    User, Category, Product, Order, OrderItem,
    ProductReview, Wishlist, ProductView, Analytics
)
from django.db.models import Avg

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'is_admin']
        read_only_fields = ['role', 'is_admin']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description')

class ProductReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ProductReview
        fields = ('id', 'user', 'rating', 'comment', 'created_at')

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = (
            'id', 'category', 'name', 'slug', 'description',
            'price', 'image', 'stock', 'available',
            'average_rating', 'review_count'
        )
    
    def get_average_rating(self, obj):
        return obj.reviews.aggregate(Avg('rating'))['rating__avg']
    
    def get_review_count(self, obj):
        return obj.reviews.count()

class WishlistSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ('id', 'products', 'created_at')

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'quantity', 'price')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = (
            'id', 'user', 'items', 'shipping_address',
            'payment_method', 'payment_status',
            'total_price', 'created_at'
        )
        read_only_fields = ('payment_status', 'created_at')

class AnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Analytics
        fields = ['total_revenue', 'total_orders', 'total_products', 'total_users', 'date']

class DashboardAnalyticsSerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_orders = serializers.IntegerField()
    total_products = serializers.IntegerField()
    total_users = serializers.IntegerField()
    recent_orders = OrderSerializer(many=True)
    top_products = ProductSerializer(many=True)
    sales_by_category = serializers.DictField()
    daily_revenue = serializers.ListField() 