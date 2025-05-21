import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_path = str(Path(__file__).parent.parent / 'backend')
if backend_path not in sys.path:
    sys.path.append(backend_path)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Import Django WSGI application
from backend.wsgi import application

# Export the WSGI application as handler
def handler(request):
    return application(request) 