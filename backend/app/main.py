from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core import Base, engine, settings
from .api import api_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fast-Dropship API",
    description="Business Management Dashboard API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Fast-Dropship API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Made with Bob
