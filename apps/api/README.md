# Inkspiree API

The FastAPI backend service powering the Inkspiree infinite canvas application. This service provides a robust, scalable API for managing boards, elements, and AI-powered features.

## ✨ Features

### Core API Services
- **RESTful Architecture**: Clean, predictable API endpoints following REST principles
- **Automatic Documentation**: Interactive OpenAPI/Swagger documentation at `/docs`
- **Type Safety**: Full Pydantic model validation for request/response data
- **Error Handling**: Comprehensive error responses with proper HTTP status codes
- **CORS Support**: Configured for cross-origin requests in development and production

### Data Management
- **Board Operations**: Create, read, update, delete boards with user ownership
- **Element Management**: Full CRUD operations for canvas elements
- **Flexible Schema**: JSON-based element content for extensibility
- **Database Relationships**: Proper foreign keys and cascading deletes
- **Transaction Safety**: Atomic operations with rollback support

### AI Integration
- **Content Generation**: Create canvas elements from natural language descriptions
- **Board Analysis**: Intelligent insights and suggestions for canvas content
- **LangChain Integration**: Leverages LangChain for robust AI workflows
- **OpenAI API**: Powered by GPT models for high-quality responses

### Performance & Reliability
- **Async Operations**: Non-blocking I/O for high concurrency
- **Connection Pooling**: Efficient database connection management
- **Request Validation**: Input sanitization and validation
- **Logging**: Comprehensive request/response logging for debugging

## 🏗️ Architecture

### Tech Stack
- **[FastAPI](https://fastapi.tiangolo.com/)**: Modern, fast web framework for building APIs
- **[Prisma](https://prisma.io/)**: Next-generation ORM with type safety
- **[PostgreSQL](https://www.postgresql.org/)**: Robust relational database
- **[LangChain](https://python.langchain.com/)**: Framework for LLM applications
- **[Pydantic](https://pydantic.dev/)**: Data validation using Python type annotations

### Project Structure
```
apps/api/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── setup.sh               # Automated setup script
├── db/
│   └── client.py          # Database connection and initialization
├── routes/
│   ├── __init__.py        # Router initialization
│   ├── boards.py          # Board CRUD endpoints
│   ├── elements.py        # Element CRUD endpoints
│   └── ai.py              # AI-powered endpoints
├── schemas/
│   └── models.py          # Pydantic models for validation
└── services/
    ├── board_service.py   # Board business logic
    ├── element_service.py # Element business logic
    └── ai_service.py      # AI integration logic
```

## 🚀 Getting Started

### Prerequisites
- Python 3.9 or higher
- PostgreSQL database (local or Docker)
- Virtual environment (recommended)
- Optional: OpenAI API key for AI features

### Quick Setup (Recommended)

Use the provided setup script for automated installation:

```bash
# Make script executable
chmod +x setup.sh

# Run automated setup
./setup.sh
```

This script will:
- Create and activate a Python virtual environment
- Install all required dependencies
- Create a sample `.env` file with database configuration
- Generate the Prisma client for database operations

### Manual Setup

If you prefer manual setup or the script doesn't work on your system:

1. **Create Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Environment Configuration**

Create a `.env` file in the `apps/api` directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/inkspiree
OPENAI_API_KEY=your_openai_api_key_here  # Optional for AI features
```

4. **Generate Prisma Client**
```bash
# Navigate to the database package
cd ../../packages/db

# Generate Prisma client (requires Node.js and npm)
npx prisma generate

# Return to API directory
cd ../../apps/api
```

### Database Setup

#### Option 1: Docker (Recommended)
```bash
# From project root
docker-compose up -d
```

#### Option 2: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database named `inkspiree`
3. Update the `DATABASE_URL` in your `.env` file

### Running the API

Start the development server:
```bash
# Ensure you're in the apps/api directory
cd /path/to/inkspiree/apps/api

# Activate virtual environment
source venv/bin/activate

# Start the server with hot reload
uvicorn main:app --reload --port 8001
```

The API will be available at:
- **API Base URL**: http://localhost:8001
- **Interactive Documentation**: http://localhost:8001/docs
- **ReDoc Documentation**: http://localhost:8001/redoc
- **Health Check**: http://localhost:8001/health

## 📚 API Documentation

### Board Management

#### Get All Boards
```http
GET /api/boards
```
Returns all boards for the authenticated user.

#### Create Board
```http
POST /api/boards
Content-Type: application/json

{
  "title": "My Creative Board",
  "description": "A board for brainstorming ideas"
}
```

#### Get Specific Board
```http
GET /api/boards/{board_id}
```

#### Update Board
```http
PUT /api/boards/{board_id}
Content-Type: application/json

{
  "title": "Updated Board Title",
  "description": "Updated description"
}
```

#### Delete Board
```http
DELETE /api/boards/{board_id}
```

### Element Management

#### Get Board Elements
```http
GET /api/elements/board/{board_id}
```
Returns all elements on a specific board.

#### Create Element
```http
POST /api/elements
Content-Type: application/json

{
  "type": "sticky-note",
  "content": {
    "text": "My sticky note",
    "color": "#fbbf24"
  },
  "position": { "x": 100, "y": 200 },
  "size": { "width": 200, "height": 150 },
  "style": {
    "fill": "#fbbf24",
    "stroke": "#f59e0b"
  },
  "boardId": "board-uuid",
  "zIndex": 0
}
```

#### Update Element
```http
PUT /api/elements/{element_id}
Content-Type: application/json

{
  "position": { "x": 150, "y": 250 },
  "content": {
    "text": "Updated text"
  }
}
```

#### Delete Element
```http
DELETE /api/elements/{element_id}
```

### AI Features

#### Generate Elements
```http
POST /api/ai/generate
Content-Type: application/json

{
  "text": "Create a sticky note with project goals and a rectangle shape",
  "boardId": "board-uuid"
}
```

#### Analyze Board
```http
POST /api/ai/analyze
Content-Type: application/json

{
  "boardId": "board-uuid"
}
```

## 🛠️ Development

### Data Models

#### Board
```python
{
  "id": "uuid",
  "title": "string",
  "description": "string | null",
  "userId": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### BoardElement
```python
{
  "id": "uuid",
  "type": "sticky-note | shape | text | connector | image",
  "content": {},  # Flexible JSON content
  "position": { "x": float, "y": float },
  "size": { "width": float, "height": float } | null,
  "style": {},  # Styling properties
  "zIndex": int,
  "boardId": "uuid",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Element Types

#### Sticky Note
```json
{
  "type": "sticky-note",
  "content": {
    "text": "Note content",
    "color": "#fbbf24"
  }
}
```

#### Shape
```json
{
  "type": "shape",
  "content": {
    "shapeType": "rectangle | ellipse | triangle | star | diamond | arrow",
    "color": "#3b82f6"
  }
}
```

#### Text
```json
{
  "type": "text",
  "content": {
    "text": "Text content",
    "fontSize": 18,
    "fontFamily": "Inter",
    "color": "#1f2937"
  }
}
```

### Error Handling

The API returns standard HTTP status codes with detailed error messages:

- `200 OK`: Successful operation
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

Example error response:
```json
{
  "detail": "Board with ID abc123 not found"
}
```

### Database Schema

The API uses Prisma ORM with the following schema:

```prisma
model Board {
  id          String        @id @default(uuid())
  title       String
  description String?
  userId      String
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  elements    BoardElement[]
}

model BoardElement {
  id        String   @id @default(uuid())
  type      String
  content   Json
  position  Json
  size      Json?
  style     Json?
  zIndex    Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  boardId   String
  board     Board    @relation(fields: [boardId], references: [id])
}
```

### Testing

Run tests using pytest:
```bash
# Install test dependencies
pip install pytest httpx

# Run tests
pytest
```

### Debugging

The API includes comprehensive logging. To enable debug mode:

```bash
# Set log level
export LOG_LEVEL=DEBUG

# Run with detailed logging
uvicorn main:app --reload --log-level debug
```

## 🚀 Production Deployment

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=your_production_api_key
LOG_LEVEL=INFO
CORS_ORIGINS=["https://yourdomain.com"]
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Performance Tuning
- Use connection pooling for database connections
- Enable response caching for read-heavy endpoints
- Configure appropriate worker processes for production
- Set up monitoring and logging aggregation

## 🤝 Contributing

1. Follow PEP 8 style guidelines
2. Add type hints to all functions
3. Write tests for new features
4. Update documentation for API changes
5. Use meaningful commit messages

## 📋 License

This project is part of the Inkspiree application and follows the same license terms.

Run tests with:

```bash
pytest
```

## License

MIT
