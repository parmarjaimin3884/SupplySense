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
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    STAFF = "STAFF"


class SignupRequest(BaseModel):
    email: str = Field(..., min_length=5, description="Work or corporate email address.")
    password: str = Field(..., min_length=6, description="User password.")
    username: Optional[str] = Field(default=None, min_length=2, description="Optional username; defaults to email prefix.")
    full_name: Optional[str] = Field(default=None, description="User full name.")
    company_name: Optional[str] = Field(default=None, description="Company/organization name.")
    role: Optional[str] = Field(default="OPERATIONS_MANAGER", description="Selected role (e.g., admin, inventory_manager, CSCO_EXECUTIVE).")


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=2, description="Username or corporate email.")
    password: str = Field(..., min_length=1, description="User password.")


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT Bearer Access Token.")
    refresh_token: str = Field(..., description="JWT Refresh Token.")
    token_type: str = Field(default="bearer", description="Token type.")
    expires_in: int = Field(..., description="Access token TTL in seconds.")
    user_id: str = Field(..., description="Authenticated user ID.")
    username: str = Field(..., description="Username.")
    email: str = Field(..., description="User email.")
    role: str = Field(..., description="Assigned RBAC role.")


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Valid refresh token.")


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Unique User ID.")
    username: str = Field(..., description="Username.")
    email: str = Field(..., description="Corporate Email.")
    role: str = Field(..., description="RBAC Role.")
    employee_name: Optional[str] = Field(default=None, description="Employee full name.")
    warehouse_name: Optional[str] = Field(default=None, description="Assigned warehouse depot.")


class UserListItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Unique User ID.")
    username: str = Field(..., description="Username.")
    email: str = Field(..., description="Corporate Email.")
    role: str = Field(..., description="Assigned RBAC role.")
    name: str = Field(..., description="Display name / employee name.")
    department: str = Field(default="Operations", description="Department / functional team.")
    status: str = Field(default="Active", description="User status: Active, Invited, Suspended.")
    mfa_enabled: bool = Field(default=True, description="MFA / SAML SSO enforcement status.")
    warehouse_name: Optional[str] = Field(default=None, description="Assigned warehouse facility.")


class CreateUserRequest(BaseModel):
    email: str = Field(..., min_length=5, description="Corporate email.")
    name: str = Field(..., min_length=2, description="Full name.")
    role: str = Field(default="Inventory Manager", description="Assigned role: Admin or Inventory Manager.")
    department: Optional[str] = Field(default="Operations", description="Department.")
    password: Optional[str] = Field(default=None, min_length=6, description="Optional custom initial password.")

