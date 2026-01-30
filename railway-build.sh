#!/bin/bash
# Railway deployment script

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations if needed
python -c "from hospital import db; db.create_all()"

echo "Backend setup complete!"
