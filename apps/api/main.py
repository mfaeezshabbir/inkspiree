from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

# Change relative imports to absolute imports
from db.client import prisma, init_db
from routes import boards, elements, ai_router

app = FastAPI(title="Inkspiree API", description="API for Inkspiree infinite canvas application")

# Configure CORS with more specific settings for the local environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,  # Set to True for specific origins
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Content-Length", "Content-Type"],
    max_age=600  # 10 minutes cache for preflight requests
)

# Include routers
app.include_router(boards.router)
app.include_router(elements.router)
app.include_router(ai_router)

@app.get("/")
def read_root():
    return {"message": "Inkspiree API is running!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.on_event("startup")
async def startup():
    """Initialize database connection on startup"""
    await init_db()

@app.on_event("shutdown")
async def shutdown():
    """Disconnect from database on shutdown"""
    if prisma.is_connected():
        await prisma.disconnect()
