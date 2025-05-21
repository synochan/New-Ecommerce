from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.db import transaction

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    name = models.CharField(max_length=255, blank=True)
    role = models.CharField(
        max_length=10,
        choices=[('admin', 'Admin'), ('user', 'User')],
        default='user'
    )
    email_confirmed = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    # Fix reverse accessor conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name=_('groups'),
        blank=True,
        help_text=_(
            'The groups this user belongs to. A user will get all permissions '
            'granted to each of their groups.'
        ),
        related_name='custom_user_set',
        related_query_name='custom_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name=_('user permissions'),
        blank=True,
        help_text=_('Specific permissions for this user.'),
        related_name='custom_user_set',
        related_query_name='custom_user',
    )

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
            models.Index(fields=['role']),
            models.Index(fields=['email_confirmed']),
        ]

    @property
    def is_admin(self):
        return self.role == 'admin'

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        indexes = [
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    size = models.CharField(max_length=10, choices=[
        ('XS', 'Extra Small'),
        ('S', 'Small'),
        ('M', 'Medium'),
        ('L', 'Large'),
        ('XL', 'Extra Large'),
        ('XXL', 'Double Extra Large'),
    ], blank=True)
    image = models.ImageField(upload_to='products/')
    stock = models.IntegerField(default=0)
    available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['name']),
            models.Index(fields=['category', 'available']),
            models.Index(fields=['size']),
            models.Index(fields=['price']),
        ]

    def __str__(self):
        return self.name

    def update_stock(self, quantity, operation='decrease'):
        """
        Update product stock
        operation: 'decrease' or 'increase'
        """
        if operation == 'decrease':
            if self.stock < quantity:
                raise ValidationError(f'Not enough stock for product {self.name}')
            self.stock -= quantity
        else:
            self.stock += quantity
        self.save()

class Order(models.Model):
    PAYMENT_STATUS_PENDING = 'P'
    PAYMENT_STATUS_COMPLETED = 'C'
    PAYMENT_STATUS_FAILED = 'F'
    
    PAYMENT_STATUS_CHOICES = [
        (PAYMENT_STATUS_PENDING, 'Pending'),
        (PAYMENT_STATUS_COMPLETED, 'Completed'),
        (PAYMENT_STATUS_FAILED, 'Failed'),
    ]

    PAYMENT_METHOD_CARD = 'card'
    PAYMENT_METHOD_CHOICES = [
        (PAYMENT_METHOD_CARD, 'Credit/Debit Card'),
    ]

    user = models.ForeignKey(User, related_name='orders', on_delete=models.CASCADE)
    shipping_address = models.TextField(default='')
    payment_method = models.CharField(
        max_length=50,
        choices=PAYMENT_METHOD_CHOICES,
        default=PAYMENT_METHOD_CARD
    )
    payment_status = models.CharField(
        max_length=1, 
        choices=PAYMENT_STATUS_CHOICES,
        default=PAYMENT_STATUS_PENDING
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stripe_payment_intent = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['payment_status']),
        ]

    def __str__(self):
        return f"Order {self.id} by {self.user.email}"

    def update_total(self):
        """Update order total from items"""
        self.total_price = sum(
            item.quantity * item.price 
            for item in self.items.all()
        )
        self.save()

    @transaction.atomic
    def process_order(self, items_data):
        """Process order items and update stock"""
        for item_data in items_data:
            product = Product.objects.select_for_update().get(
                id=item_data['product_id']
            )
            
            # Validate stock
            if product.stock < item_data['quantity']:
                raise ValidationError(
                    f'Not enough stock for product {product.name}'
                )
            
            # Create order item
            OrderItem.objects.create(
                order=self,
                product=product,
                quantity=item_data['quantity'],
                price=product.price
            )
            
            # Update stock
            product.update_stock(item_data['quantity'])
        
        # Update total
        self.update_total()

    def refund(self):
        """Refund order and restore stock"""
        with transaction.atomic():
            for item in self.items.all():
                item.product.update_stock(item.quantity, operation='increase')
            self.payment_status = self.PAYMENT_STATUS_FAILED
            self.save()

class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, 
        related_name='items', 
        on_delete=models.CASCADE
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        indexes = [
            models.Index(fields=['order', 'product']),
        ]

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in Order {self.order.id}"

class ProductReview(models.Model):
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'user')
        indexes = [
            models.Index(fields=['product', 'user']),
            models.Index(fields=['product', 'rating']),
        ]

    def __str__(self):
        return f"{self.user.email}'s review of {self.product.name}"

class Wishlist(models.Model):
    user = models.ForeignKey(User, related_name='wishlist', on_delete=models.CASCADE)
    products = models.ManyToManyField(Product)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.user.email}'s wishlist"

class ProductView(models.Model):
    product = models.ForeignKey(Product, related_name='views', on_delete=models.CASCADE)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    ip_address = models.GenericIPAddressField()
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['product', 'viewed_at']),
            models.Index(fields=['user', 'product']),
        ]

    def __str__(self):
        return f"View of {self.product.name} at {self.viewed_at}"

class Analytics(models.Model):
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_orders = models.IntegerField(default=0)
    total_products = models.IntegerField(default=0)
    total_users = models.IntegerField(default=0)
    date = models.DateField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Analytics'
        indexes = [
            models.Index(fields=['date']),
        ]

    @classmethod
    def update_daily_analytics(cls):
        from django.utils import timezone
        from django.db.models import Sum, Count
        
        today = timezone.now().date()
        analytics, created = cls.objects.get_or_create(date=today)
        
        # Update total revenue and orders
        orders = Order.objects.filter(
            created_at__date=today,
            payment_status=Order.PAYMENT_STATUS_COMPLETED
        )
        analytics.total_orders = orders.count()
        analytics.total_revenue = orders.aggregate(
            total=Sum('total_price')
        )['total'] or 0
        
        # Update total products and users
        analytics.total_products = Product.objects.filter(
            created_at__date=today
        ).count()
        analytics.total_users = User.objects.filter(
            date_joined__date=today
        ).count()
        
        analytics.save()
        return analytics

    def __str__(self):
        return f"Analytics for {self.date}"
