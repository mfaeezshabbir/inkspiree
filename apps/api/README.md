# Inkspire API

This is the FastAPI backend service for the Inkspire infinite canvas application.

## Features

- RESTful API for managing boards and elements
- AI-powered content generation and analysis
- Integration with Prisma ORM for database operations

## Tech Stack

- [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework for building APIs with Python
- [Prisma](https://prisma.io/) - Next-generation ORM for database operations
- [PostgreSQL](https://www.postgresql.org/) - Open source relational database
- [LangChain](https://python.langchain.com/) - Framework for building LLM-powered applications

## Getting Started

### Prerequisites

- Python 3.9+
- PostgreSQL database
- Virtual environment (recommended)

### Setup

#### Option 1: Using the setup script (recommended)

Run the provided setup script:

```bash
# Make the script executable if needed
chmod +x setup.sh

# Run the setup script
./setup.sh
```

This script will:
- Create and activate a virtual environment
- Install dependencies
- Create a sample .env file if needed
- Generate the Prisma client

#### Option 2: Manual setup

1. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables:

Create a `.env` file in the api directory:

```
DATABASE_URL=postgresql://username:password@localhost:5432/inkspire
OPENAI_API_KEY=your_openai_api_key  # Optional for AI features
```

4. Generate Prisma client:

```bash
# Navigate to the package directory containing schema.prisma
cd ../../packages/db

# Install Prisma CLI if you don't have it
npm install -g prisma

# Generate Prisma client
prisma generate --schema=schema.prisma

# Go back to the API directory
cd ../../apps/api
```

> **Important:** You must generate the Prisma client before running the API, or you'll get a "Client hasn't been generated yet" error.

### Running the API

Start the development server from the apps/api directory:

```bash
# Make sure you're in the /apps/api directory, not in /packages/db
cd /home/mfaeezshabbur/pp/inkspire/apps/api

# Run the server
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

### API Documentation

Once the server is running, you can access:

- Interactive API documentation: http://localhost:8000/docs
- Alternative documentation: http://localhost:8000/redoc

## API Routes

- `GET /api/boards`: List all boards
- `POST /api/boards`: Create a new board
- `GET /api/boards/{board_id}`: Get a specific board
- `PUT /api/boards/{board_id}`: Update a board
- `DELETE /api/boards/{board_id}`: Delete a board
- `GET /api/elements/board/{board_id}`: Get elements for a board
- `POST /api/elements`: Create a new element
- `PUT /api/elements/{element_id}`: Update an element
- `DELETE /api/elements/{element_id}`: Delete an element
- `POST /api/ai/generate`: Generate elements from text
- `POST /api/ai/analyze`: Analyze a board

## Development

### Project Structure

- `main.py`: Main application entry point
- `db/`: Database configuration and client
- `routes/`: API endpoint definitions
- `schemas/`: Pydantic models for request/response validation
- `services/`: Business logic for the application

### Testing

Run tests with:

```bash
pytest
```

## License

MIT
