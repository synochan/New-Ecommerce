from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

def send_confirmation_email(request, user):
    current_site = get_current_site(request)
    subject = 'Confirm your email address'
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    
    context = {
        'user': user,
        'domain': current_site.domain,
        'uid': uid,
        'token': token,
    }
    
    html_message = render_to_string('email/confirmation_email.html', context)
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )

def send_password_reset_email(request, user):
    current_site = get_current_site(request)
    subject = 'Reset your password'
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    
    context = {
        'user': user,
        'domain': current_site.domain,
        'uid': uid,
        'token': token,
    }
    
    html_message = render_to_string('email/password_reset_email.html', context)
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    ) 