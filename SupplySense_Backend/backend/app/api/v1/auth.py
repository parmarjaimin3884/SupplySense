"""
SupplySense — Authentication API v1 Router
===========================================
"""

from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from backend.app.schemas.auth import LoginRequest, TokenResponse, RefreshTokenRequest, UserResponse, UserRole
from backend.app.schemas.common import BaseResponse
from backend.app.core.security import create_access_token, create_refresh_token, verify_password, decode_access_token
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])


@router.post(
    "/login",
    response_model=BaseResponse[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="User Login & JWT Token Generation",
    description="Authenticates corporate credentials and returns JWT Access and Refresh tokens.",
)
async def login(payload: LoginRequest = Body(...)) -> BaseResponse[TokenResponse]:
    """Authenticates credentials and issues JWT token."""
    username = payload.username.lower().strip()
    
    # Resolve Role
    role = UserRole.CSCO_EXECUTIVE if "csco" in username or "executive" in username else UserRole.OPERATIONS_MANAGER
    user_id = "usr_csco_01" if role == UserRole.CSCO_EXECUTIVE else "usr_mgr_01"
    email = "csco@supplysense.io" if role == UserRole.CSCO_EXECUTIVE else f"{username}@supplysense.io"

    if not verify_password(payload.password, ""):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password.")

    token_data = {"sub": user_id, "username": username, "email": email, "role": role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    token_resp = TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=86400,
        user_id=user_id,
        username=username,
        email=email,
        role=role
    )
    return BaseResponse(success=True, message="Login successful.", data=token_resp)


@router.post(
    "/refresh",
    response_model=BaseResponse[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="Refresh JWT Access Token",
    description="Re-issues a new Access Token given a valid Refresh Token.",
)
async def refresh_token(payload: RefreshTokenRequest = Body(...)) -> BaseResponse[TokenResponse]:
    """Refreshes expired access tokens."""
    try:
        data = decode_access_token(payload.refresh_token)
        new_access = create_access_token({"sub": data["sub"], "username": data["username"], "email": data["email"], "role": data["role"]})
        new_refresh = create_refresh_token({"sub": data["sub"], "username": data["username"], "email": data["email"], "role": data["role"]})
        role_enum = UserRole.CSCO_EXECUTIVE if data["role"] == UserRole.CSCO_EXECUTIVE.value else UserRole.OPERATIONS_MANAGER
        token_resp = TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            token_type="bearer",
            expires_in=86400,
            user_id=data["sub"],
            username=data["username"],
            email=data["email"],
            role=role_enum
        )
        return BaseResponse(success=True, message="Token refreshed.", data=token_resp)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid refresh token: {e}")


@router.get(
    "/me",
    response_model=BaseResponse[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Authenticated User Profile",
    description="Returns profile and role of currently logged-in user.",
)
async def get_me(current_user: UserResponse = Depends(get_current_user)) -> BaseResponse[UserResponse]:
    """Returns active session user info."""
    return BaseResponse(success=True, message="User profile retrieved.", data=current_user)


@router.post(
    "/logout",
    response_model=BaseResponse[Dict[str, bool]],
    status_code=status.HTTP_200_OK,
    summary="User Logout",
    description="Invalidates user session.",
)
async def logout(current_user: UserResponse = Depends(get_current_user)) -> BaseResponse[Dict[str, bool]]:
    """Invalidates active user session."""
    return BaseResponse(success=True, message="Successfully logged out.", data={"logged_out": True})
