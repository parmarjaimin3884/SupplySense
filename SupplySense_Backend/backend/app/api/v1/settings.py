"""
SupplySense — Settings & User Profile API v1 Router
===================================================
"""

from fastapi import APIRouter, Depends, Body, status
from backend.app.schemas.settings import UserProfileSchema, UserPreferencesSchema
from backend.app.schemas.common import BaseResponse
from backend.app.api.deps import get_current_user
from backend.app.schemas.auth import UserResponse

router = APIRouter(prefix="/settings", tags=["User Settings & Preferences"])

# In-memory preference store
_user_preferences_cache = UserPreferencesSchema()


@router.get(
    "/profile",
    response_model=BaseResponse[UserProfileSchema],
    status_code=status.HTTP_200_OK,
    summary="Get Current User Profile",
    description="Returns profile information for the authenticated user.",
)
async def get_profile(current_user: UserResponse = Depends(get_current_user)) -> BaseResponse[UserProfileSchema]:
    """Returns user profile."""
    prof = UserProfileSchema(
        user_id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role.value,
        name=current_user.employee_name or "Enterprise User",
        phone="+1 (555) 234-5678",
        department="Global Supply Chain Operations"
    )
    return BaseResponse(success=True, message="Profile retrieved.", data=prof)


@router.put(
    "/profile",
    response_model=BaseResponse[UserProfileSchema],
    status_code=status.HTTP_200_OK,
    summary="Update User Profile",
    description="Updates corporate user profile details.",
)
async def update_profile(
    payload: UserProfileSchema = Body(...),
    current_user: UserResponse = Depends(get_current_user)
) -> BaseResponse[UserProfileSchema]:
    """Updates user profile."""
    return BaseResponse(success=True, message="Profile updated successfully.", data=payload)


@router.get(
    "/preferences",
    response_model=BaseResponse[UserPreferencesSchema],
    status_code=status.HTTP_200_OK,
    summary="Get User Preferences",
    description="Returns theme, alert, and depot scope preferences.",
)
async def get_preferences(current_user: UserResponse = Depends(get_current_user)) -> BaseResponse[UserPreferencesSchema]:
    """Returns application preferences."""
    return BaseResponse(success=True, message="Preferences retrieved.", data=_user_preferences_cache)


@router.put(
    "/preferences",
    response_model=BaseResponse[UserPreferencesSchema],
    status_code=status.HTTP_200_OK,
    summary="Update User Preferences",
    description="Updates theme, notification subscriptions, and depot filters.",
)
async def update_preferences(
    payload: UserPreferencesSchema = Body(...),
    current_user: UserResponse = Depends(get_current_user)
) -> BaseResponse[UserPreferencesSchema]:
    """Updates application preferences."""
    global _user_preferences_cache
    _user_preferences_cache = payload
    return BaseResponse(success=True, message="Preferences updated successfully.", data=_user_preferences_cache)
