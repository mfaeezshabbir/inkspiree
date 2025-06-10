# This file sets up the Prisma client for the database connection
# It's used by all API endpoints that need database access

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from prisma import Prisma

# Database connection setup
prisma = Prisma()

async def init_db():
    """Initialize the database connection."""
    # Check if DATABASE_URL is set
    if not os.environ.get("DATABASE_URL"):
        print("WARNING: DATABASE_URL environment variable not found. Using default URL.")
        os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5433/inkspire"
        
    await prisma.connect()
