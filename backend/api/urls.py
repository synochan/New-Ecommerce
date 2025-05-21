from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'reviews', views.ProductReviewViewSet, basename='review')
router.register(r'analytics', views.AnalyticsViewSet, basename='analytics')
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/verify/', views.verify_token, name='verify'),
    path('auth/confirm-email/<str:uidb64>/<str:token>/', views.confirm_email, name='confirm-email'),
    path('stripe/webhook/', views.stripe_webhook, name='stripe-webhook'),
] 