from .settings import *
import os

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

ALLOWED_HOSTS = ['*']  # Not recommended for real production, but common in student projects

# CORS settings - Allow all origins for easier development
CORS_ALLOW_ALL_ORIGINS = True

# Database settings
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Simple email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Stripe settings
STRIPE_PUBLIC_KEY = os.getenv('STRIPE_PUBLIC_KEY', 'your-test-public-key')
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', 'your-test-secret-key') 