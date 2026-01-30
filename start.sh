#!/bin/bash
# Railway startup script

# Ensure Python packages are in PATH
export PATH="$PATH:/opt/venv/bin:/root/.local/bin"

# Start gunicorn
exec gunicorn --bind 0.0.0.0:$PORT wsgi:app --workers 2 --timeout 120
