#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py collectstatic --no-input
python manage.py migrate

# Start gunicorn
gunicorn backend.wsgi:application 