"""
SupplySense — Authentication Pydantic v2 Schemas
=================================================
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

try:
    from pydantic import EmailStr
except ImportError:
    EmailStr = str


class UserRole(str, Enum):
    OPERATIONS_MANAGER = "OPERATIONS_MANAGER"
    CSCO_EXECUTIVE = "CSCO_EXECUTIVE"


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, description="Username or corporate email.")
    password: str = Field(..., min_length=4, description="User password.")


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT Bearer Access Token.")
    refresh_token: str = Field(..., description="JWT Refresh Token.")
    token_type: str = Field(default="bearer", description="Token type.")
    expires_in: int = Field(..., description="Access token TTL in seconds.")
    user_id: str = Field(..., description="Authenticated user ID.")
    username: str = Field(..., description="Username.")
    email: str = Field(..., description="User email.")
    role: UserRole = Field(..., description="Assigned RBAC role.")


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Valid refresh token.")


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Unique User ID.")
    username: str = Field(..., description="Username.")
    email: str = Field(..., description="Corporate Email.")
    role: UserRole = Field(..., description="RBAC Role.")
    employee_name: Optional[str] = Field(default=None, description="Employee full name.")
    warehouse_name: Optional[str] = Field(default=None, description="Assigned warehouse depot.")
