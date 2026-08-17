"""
SupplySense — User Settings Pydantic v2 Schemas
================================================
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class UserProfileSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: str = Field(..., description="User ID.")
    username: str = Field(..., description="Username.")
    email: str = Field(..., description="Corporate Email.")
    role: str = Field(..., description="Assigned RBAC Role.")
    name: Optional[str] = Field(default=None, description="Full Name.")
    phone: Optional[str] = Field(default=None, description="Phone number.")
    department: Optional[str] = Field(default="Supply Chain Management", description="Department.")


class UserPreferencesSchema(BaseModel):
    theme: str = Field(default="dark", description="UI theme: dark, light, system.")
    email_notifications: bool = Field(default=True, description="Email alert subscription.")
    sms_notifications: bool = Field(default=False, description="SMS emergency alert subscription.")
    default_warehouse_filter: Optional[str] = Field(default="ALL", description="Default warehouse depot scope.")
    currency: str = Field(default="USD", description="Base currency.")
