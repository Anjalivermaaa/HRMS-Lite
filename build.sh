#!/bin/bash
# Exit on error
set -e

echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt

echo "Changing to backend directory..."
cd backend

echo "Running Django migrations..."
python manage.py migrate

echo "Build completed successfully!"