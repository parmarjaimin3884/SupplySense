import os
import logging
from typing import Any, Dict, Optional, Callable
from functools import wraps
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

# Database connection URL - expects asyncpg for async PostgreSQL
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://postgres:postgres@localhost:5432/supplysense"
)

try:
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    async_session = None

def format_response(success: bool, message: str, data: Optional[Any] = None) -> Dict[str, Any]:
    """
    Standardize the response format for all AI tools.
    """
    return {
        "success": success,
        "message": message,
        "data": data
    }

def tool_error_handler(func: Callable) -> Callable:
    """
    Decorator to wrap tool functions with robust error handling and DB session injection.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        session = kwargs.get('session')
        close_session = False
        
        if not session and async_session:
            session = async_session()
            kwargs['session'] = session
            close_session = True
            
        try:
            return await func(*args, **kwargs)
        except SQLAlchemyError as db_err:
            logger.error(f"Database error in {func.__name__}: {str(db_err)}")
            return format_response(False, f"Database error occurred: {str(db_err)}", None)
        except ValueError as val_err:
            logger.error(f"Validation error in {func.__name__}: {str(val_err)}")
            return format_response(False, f"Validation error: {str(val_err)}", None)
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
            return format_response(False, f"An unexpected error occurred: {str(e)}", None)
        finally:
            if close_session and session:
                await session.close()
    return wrapper
