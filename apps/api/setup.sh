#!/bin/bash
# Setup script for Inkspiree API

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating sample .env file..."
    echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inkspiree" > .env
    echo "# Add your OpenAI API key for AI features" >> .env
    echo "# OPENAI_API_KEY=your_key_here" >> .env
    echo "Sample .env file created. Please update it with your actual database connection details."
fi

# Generate Prisma client
echo "Generating Prisma client..."
cd ../../packages/db
prisma generate --schema=schema.prisma

# Return to the API directory
cd ../../apps/api

echo "Setup completed! You can now run the API with:"
echo "uvicorn main:app --reload"
