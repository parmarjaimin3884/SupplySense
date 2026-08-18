"""
SupplySense — Common Pydantic v2 Base Schemas
==============================================

Standardized API response wrappers, pagination models, and error schemas.
"""

from datetime import datetime, timezone
from typing import Generic, TypeVar, List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict

T = TypeVar("T")


class BaseResponse(BaseModel, Generic[T]):
    """Standard API Response Wrapper."""
    model_config = ConfigDict(from_attributes=True)

    success: bool = Field(default=True, description="Indicates if the API request succeeded.")
    message: str = Field(default="Request processed successfully.", description="Human-readable response summary.")
    data: Optional[T] = Field(default=None, description="Response payload data.")
    request_id: str = Field(default="", description="Unique correlation request ID.")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC timestamp.")


class PaginationMeta(BaseModel):
    """Pagination metadata model."""
    page: int = Field(default=1, ge=1, description="Current page number.")
    limit: int = Field(default=10, ge=1, le=500, description="Items per page.")
    total_items: int = Field(default=0, ge=0, description="Total matching items across all pages.")
    total_pages: int = Field(default=1, ge=0, description="Total calculated pages.")


class PaginationResponse(BaseModel, Generic[T]):
    """Standardized Paginated API Response Envelope."""
    model_config = ConfigDict(from_attributes=True)

    success: bool = Field(default=True, description="Indicates if the request succeeded.")
    message: str = Field(default="Paginated list retrieved.", description="Summary message.")
    data: List[T] = Field(default_factory=list, description="Paginated items list.")
    meta: PaginationMeta = Field(description="Pagination metadata.")
    request_id: str = Field(default="", description="Unique correlation request ID.")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC timestamp.")


class ErrorDetail(BaseModel):
    """Machine-readable error detail payload."""
    code: str = Field(description="Error classification code.")
    message: str = Field(description="Human-readable safe error message.")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Additional context metadata.")


class ErrorResponse(BaseModel):
    """Standardized Error Response Envelope."""
    success: bool = Field(default=False, description="Always False for error responses.")
    error: ErrorDetail = Field(description="Detailed error context.")
    request_id: str = Field(default="", description="Unique correlation request ID.")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC timestamp.")
