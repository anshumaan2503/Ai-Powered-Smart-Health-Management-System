import os
from hospital import create_app

app = create_app(os.getenv("FLASK_CONFIG") or "production")