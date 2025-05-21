from http.server import BaseHTTPRequestHandler
import sys
import os
from pathlib import Path
from io import BytesIO

# Add the backend directory to Python path
backend_path = str(Path(__file__).resolve().parent.parent)
if backend_path not in sys.path:
    sys.path.append(backend_path)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Import Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

class handler(BaseHTTPRequestHandler):
    def handle_request(self):
        # Convert HTTP headers to WSGI format
        environ = {
            'wsgi.version': (1, 0),
            'wsgi.url_scheme': 'https',
            'wsgi.input': BytesIO(self.rfile.read(int(self.headers.get('content-length', 0)))),
            'wsgi.errors': sys.stderr,
            'wsgi.multithread': True,
            'wsgi.multiprocess': False,
            'wsgi.run_once': False,
            'REQUEST_METHOD': self.command,
            'PATH_INFO': self.path,
            'QUERY_STRING': '',
            'SERVER_NAME': self.server.server_name,
            'SERVER_PORT': str(self.server.server_port),
            'SERVER_PROTOCOL': self.protocol_version,
        }

        # Add HTTP headers to WSGI environment
        for key, value in self.headers.items():
            key = 'HTTP_' + key.replace('-', '_').upper()
            environ[key] = value

        # Response data
        response_data = {}
        def start_response(status, headers):
            status_code = int(status.split(' ')[0])
            self.send_response(status_code)
            for header, value in headers:
                self.send_header(header, value)
            self.end_headers()

        # Get response from Django application
        response_body = b''.join(application(environ, start_response))
        self.wfile.write(response_body)

    def do_GET(self):
        self.handle_request()

    def do_POST(self):
        self.handle_request()

    def do_PUT(self):
        self.handle_request()

    def do_DELETE(self):
        self.handle_request() 