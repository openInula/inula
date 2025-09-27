"""
FastAPI application main module.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import functions, health
from app.core import ConfigManager, FunctionRAGSystem
from app.models import ErrorResponse
from app.utils.logger import get_logger, setup_logging

logger = get_logger(__name__)

# Global instances
config_manager = ConfigManager()
rag_system = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan."""
    global rag_system
    
    # Startup
    logger.info("Starting Function RAG System...")
    
    # Setup logging
    log_config = config_manager.log_config
    setup_logging(level=log_config["level"], format_type=log_config["format"])
    
    # Validate configuration
    if not config_manager.validate_config():
        raise RuntimeError("Invalid configuration")
    
    # Initialize RAG system
    rag_config = config_manager.get_rag_config()
    rag_system = FunctionRAGSystem(rag_config)
    
    try:
        await rag_system.initialize()
        logger.info("Function RAG System started successfully")
    except Exception as e:
        logger.error(f"Failed to initialize RAG system: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Function RAG System...")
    if rag_system:
        await rag_system.close()
    logger.info("Function RAG System shut down complete")


# Create FastAPI app
api_config = config_manager.api_config
app = FastAPI(
    title=api_config["title"],
    version=api_config["version"],
    description=api_config["description"],
    lifespan=lifespan,
)

# Add CORS middleware
cors_config = config_manager.cors_config
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_config["allow_origins"],
    allow_credentials=True,
    allow_methods=cors_config["allow_methods"],
    allow_headers=cors_config["allow_headers"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}")
    
    error_response = ErrorResponse(
        error={
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An internal server error occurred",
            "details": str(exc) if config_manager.settings.debug else None,
        }
    )
    
    return JSONResponse(
        status_code=500,
        content=error_response.model_dump()
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """HTTP exception handler."""
    error_response = ErrorResponse(
        error={
            "code": f"HTTP_{exc.status_code}",
            "message": exc.detail,
            "status_code": exc.status_code,
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump()
    )


# Include routers
app.include_router(health.router)
app.include_router(functions.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Function RAG System API",
        "version": api_config["version"],
        "docs_url": "/docs",
        "redoc_url": "/redoc",
    }


@app.get("/info")
async def info():
    """Get API information."""
    return {
        "title": api_config["title"],
        "version": api_config["version"],
        "description": api_config["description"],
        "config": {
            "embedding_provider": config_manager.settings.embedding_provider,
            "embedding_model": config_manager.settings.embedding_model,
            "vector_db_url": config_manager.settings.vector_db_url,
            "collection_name": config_manager.settings.collection_name,
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    server_config = config_manager.server_config
    
    uvicorn.run(
        "app.api.main:app",
        host=server_config["host"],
        port=server_config["port"],
        workers=server_config["workers"] if server_config["workers"] > 1 else None,
        reload=config_manager.settings.debug,
        log_config=None,  # We handle logging ourselves
    )