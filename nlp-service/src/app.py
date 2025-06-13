from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import logging
import uvicorn
from contextlib import asynccontextmanager

from config import Config
from nlp_parser import NLPParser

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic models
class TaskParseRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Natural language text to parse")

class ParsedTask(BaseModel):
    taskName: str
    assignee: str  
    dueDate: str
    dueTime: str
    priority: str

class TaskParseResponse(BaseModel):
    tasks: List[ParsedTask]

class HealthResponse(BaseModel):
    status: str
    openai_connection: bool
    fallback_available: bool
    timestamp: str

class ErrorResponse(BaseModel):
    error: str
    message: str

# Global NLP parser instance
nlp_parser = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global nlp_parser
    
    # Startup
    logger.info("Starting NLP Service...")
    try:
        Config.validate_config()
        nlp_parser = NLPParser()
        logger.info("NLP Service started successfully")
    except Exception as e:
        logger.error(f"Failed to start NLP Service: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down NLP Service...")

# Create FastAPI app
app = FastAPI(
    title="Natural Language Task Parser",
    description="Parse natural language text into structured task data using OpenAI GPT",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Natural Language Task Parser API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    try:
        health_data = await nlp_parser.health_check()
        return HealthResponse(**health_data)
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unhealthy"
        )

@app.post("/parse", response_model=TaskParseResponse, tags=["Parsing"])
async def parse_tasks(request: TaskParseRequest):
    """
    Parse natural language text into structured task data
    
    Example input:
    ```
    {
        "text": "Finish landing page Aman by 11pm 20th June, Call client Rajeev tomorrow 5pm"
    }
    ```
    
    Example output:
    ```
    {
        "tasks": [
            {
                "taskName": "Finish landing page",
                "assignee": "Aman",
                "dueDate": "2025-06-20", 
                "dueTime": "23:00",
                "priority": "P3"
            },
            {
                "taskName": "Call client",
                "assignee": "Rajeev",
                "dueDate": "2025-06-14",
                "dueTime": "17:00", 
                "priority": "P3"
            }
        ]
    }
    ```
    """
    try:
        logger.info(f"Received parse request: {request.text[:100]}...")
        
        # Parse the natural language text
        result = await nlp_parser.parse_natural_language(request.text)
        
        # Convert to response model
        tasks = [ParsedTask(**task) for task in result["tasks"]]
        response = TaskParseResponse(tasks=tasks)
        
        logger.info(f"Parse request completed successfully. Returned {len(tasks)} tasks")
        return response
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Parse request failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse natural language input"
        )

@app.get("/test", tags=["Testing"])
async def test_parsing():
    """Test endpoint with sample data"""
    sample_text = "Finish landing page Aman by 11pm 20th June, Call client Rajeev tomorrow 5pm P1"
    
    try:
        result = await nlp_parser.parse_natural_language(sample_text)
        return {
            "input": sample_text,
            "output": result,
            "status": "success"
        }
    except Exception as e:
        return {
            "input": sample_text,
            "error": str(e),
            "status": "error"
        }

if __name__ == "__main__":
    logger.info(f"Starting NLP Service on {Config.HOST}:{Config.PORT}")
    uvicorn.run(
        "app:app",
        host=Config.HOST,
        port=Config.PORT,
        reload=Config.ENVIRONMENT == "development",
        log_level="info"
    )