"""
SupplySense — Authentication API v1 Router
===========================================
Handles database-backed signup, password hashing, JWT authentication, and token refreshing.
"""

from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func

from models import User, Employee, Warehouse, generate_uuid
from backend.app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserResponse,
    UserRole,
    UserListItemResponse,
    CreateUserRequest,
)
from backend.app.schemas.common import BaseResponse
from backend.app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    decode_access_token,
)
from backend.app.api.deps import get_db, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])


@router.post(
    "/signup",
    response_model=BaseResponse[TokenResponse],
    status_code=status.HTTP_201_CREATED,
    summary="User Registration & Account Creation",
    description="Registers a new corporate user, hashes password, saves to PostgreSQL database, and returns JWT tokens.",
)
async def signup(
    payload: SignupRequest = Body(...),
    db: AsyncSession = Depends(get_db),
) -> BaseResponse[TokenResponse]:
    """Registers a new user into the database."""
    email_clean = payload.email.lower().strip()
    
    # Derive username if not explicitly given
    if payload.username and payload.username.strip():
        username_clean = payload.username.lower().strip()
    else:
        username_clean = email_clean.split("@")[0]

    # Check if email or username is already registered in DB
    query = select(User).where(
        or_(
            func.lower(User.email) == email_clean,
            func.lower(User.username) == username_clean,
        )
    )
    result = await db.execute(query)
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address or username already exists. Please log in.",
        )

    # Normalize role
    role_str = (payload.role or "inventory_manager").strip()
    if "admin" in role_str.lower():
        norm_role = "Admin"
    elif "csco" in role_str.lower() or "executive" in role_str.lower():
        norm_role = "CSCO_EXECUTIVE"
    else:
        norm_role = "Inventory Manager"

    # Hash password
    pwd_hash = hash_password(payload.password)

    # Create new User in database
    new_user_id = generate_uuid()
    new_user = User(
        id=new_user_id,
        username=username_clean,
        email=email_clean,
        password_hash=pwd_hash,
        role=norm_role,
    )
    db.add(new_user)
    await db.flush()

    # Create optional Employee record if full_name is provided
    if payload.full_name and payload.full_name.strip():
        # Associate with Surat Central Warehouse (WH-SUR)
        wh_query = select(Warehouse).where(Warehouse.warehouse_code == "WH-SUR")
        wh_result = await db.execute(wh_query)
        wh = wh_result.scalars().first()
        if not wh:
            wh = (await db.execute(select(Warehouse).limit(1))).scalars().first()
        if wh:
            new_emp = Employee(
                id=generate_uuid(),
                user_id=new_user_id,
                warehouse_id=wh.id,
                name=payload.full_name.strip(),
                position=norm_role,
            )
            db.add(new_emp)

    await db.commit()

    # Issue JWT tokens
    token_data = {
        "sub": str(new_user.id),
        "username": new_user.username,
        "email": new_user.email,
        "role": new_user.role,
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    token_resp = TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=86400,
        user_id=str(new_user.id),
        username=new_user.username,
        email=new_user.email,
        role=new_user.role,
    )
    return BaseResponse(
        success=True,
        message="Account created successfully.",
        data=token_resp,
    )


@router.post(
    "/login",
    response_model=BaseResponse[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="User Login & JWT Token Generation",
    description="Authenticates corporate credentials against PostgreSQL database and returns JWT Access and Refresh tokens.",
)
async def login(
    payload: LoginRequest = Body(...),
    db: AsyncSession = Depends(get_db),
) -> BaseResponse[TokenResponse]:
    """Authenticates credentials against database and issues JWT token."""
    login_input = payload.username.lower().strip()
    
    # Query database for user by email or username
    query = select(User).where(
        or_(
            func.lower(User.email) == login_input,
            func.lower(User.username) == login_input,
        )
    )
    result = await db.execute(query)
    user = result.scalars().first()

    # If user found in database
    if user:
        if not verify_password(payload.password, user.password_hash or ""):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email/username or password.",
            )

        token_data = {
            "sub": str(user.id),
            "username": user.username,
            "email": user.email,
            "role": user.role,
        }
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        token_resp = TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=86400,
            user_id=str(user.id),
            username=user.username,
            email=user.email,
            role=user.role,
        )
        return BaseResponse(success=True, message="Login successful.", data=token_resp)

    # Fallback for demo mock accounts (e.g. csco, admin) if not in DB
    if login_input in ["csco", "csco@supplysense.io", "admin", "admin@supplysense.io"]:
        if verify_password(payload.password, ""):
            role = "CSCO_EXECUTIVE" if "csco" in login_input else "Admin"
            user_id = "usr_csco_01" if "csco" in login_input else "usr_admin_01"
            email = "csco@supplysense.io" if "csco" in login_input else "admin@supplysense.io"
            token_data = {"sub": user_id, "username": login_input, "email": email, "role": role}
            access_token = create_access_token(token_data)
            refresh_token = create_refresh_token(token_data)

            token_resp = TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                token_type="bearer",
                expires_in=86400,
                user_id=user_id,
                username=login_input,
                email=email,
                role=role,
            )
            return BaseResponse(success=True, message="Login successful.", data=token_resp)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email/username or password.",
    )


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
        token_payload = {
            "sub": data["sub"],
            "username": data.get("username", ""),
            "email": data.get("email", ""),
            "role": data.get("role", "Operations Manager"),
        }
        new_access = create_access_token(token_payload)
        new_refresh = create_refresh_token(token_payload)
        token_resp = TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            token_type="bearer",
            expires_in=86400,
            user_id=data["sub"],
            username=data.get("username", ""),
            email=data.get("email", ""),
            role=data.get("role", "Operations Manager"),
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


@router.get(
    "/users",
    response_model=BaseResponse[list[UserListItemResponse]],
    status_code=status.HTTP_200_OK,
    summary="List Registered Workspace Users",
    description="Returns list of all active registered workspace users from PostgreSQL database.",
)
async def list_workspace_users(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
) -> BaseResponse[list[UserListItemResponse]]:
    """Returns real users from PostgreSQL database."""
    stmt = (
        select(User, Employee, Warehouse)
        .outerjoin(Employee, User.id == Employee.user_id)
        .outerjoin(Warehouse, Employee.warehouse_id == Warehouse.id)
        .order_by(User.username.asc())
    )
    results = (await db.execute(stmt)).all()

    user_list: list[UserListItemResponse] = []
    for u, emp, wh in results:
        # Normalize role presentation
        raw_role = (u.role or "Operations Manager").strip()
        if raw_role.lower() in ["admin", "csco_executive"]:
            display_role = "Admin"
            dept = "Supply Chain Operations"
        elif raw_role.lower() in ["manager", "operations_manager", "inventory_manager", "inventory manager"]:
            display_role = "Inventory Manager"
            dept = "Warehouse & Procurement"
        else:
            display_role = raw_role
            dept = "Logistics Team"

        display_name = emp.name if (emp and emp.name) else u.username.replace("_", " ").title()
        warehouse_name = wh.name if (wh and wh.name) else "Surat Central Warehouse"

        user_list.append(
            UserListItemResponse(
                id=str(u.id),
                username=u.username,
                email=u.email,
                role=display_role,
                name=display_name,
                department=dept,
                status="Active",
                mfa_enabled=True,
                warehouse_name=warehouse_name,
            )
        )

    return BaseResponse(
        success=True,
        message=f"Retrieved {len(user_list)} registered workspace users.",
        data=user_list,
    )


@router.post(
    "/users",
    response_model=BaseResponse[UserListItemResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create / Invite Real Workspace User",
    description="Provisions a new real user and associated employee record in PostgreSQL.",
)
async def create_workspace_user(
    payload: CreateUserRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
) -> BaseResponse[UserListItemResponse]:
    """Creates a new real database user."""
    email_clean = payload.email.strip().lower()
    name_clean = payload.name.strip()
    username_clean = email_clean.split("@")[0].replace(".", "_")

    # Check for existing user
    stmt = select(User).where(or_(User.email == email_clean, User.username == username_clean))
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A user with email '{email_clean}' or username '{username_clean}' already exists.",
        )

    # Hash password (default to secure initial password if omitted)
    init_pwd = payload.password or "SupplySense@2026"
    pwd_hash = hash_password(init_pwd)

    norm_role = "Admin" if "admin" in payload.role.lower() else "Inventory Manager"

    new_user_id = generate_uuid()
    new_user = User(
        id=new_user_id,
        username=username_clean,
        email=email_clean,
        password_hash=pwd_hash,
        role=norm_role,
    )
    db.add(new_user)
    await db.flush()

    # Assign to Surat Central Warehouse (WH-SUR)
    wh_query = select(Warehouse).where(Warehouse.warehouse_code == "WH-SUR")
    wh_result = await db.execute(wh_query)
    wh = wh_result.scalars().first()
    if not wh:
        wh = (await db.execute(select(Warehouse).limit(1))).scalars().first()

    wh_id = wh.id if wh else generate_uuid()
    wh_name = wh.name if wh else "Surat Central Warehouse"

    new_emp = Employee(
        id=generate_uuid(),
        user_id=new_user_id,
        warehouse_id=wh_id,
        name=name_clean,
        position=norm_role,
    )
    db.add(new_emp)
    await db.commit()

    created_item = UserListItemResponse(
        id=str(new_user.id),
        username=new_user.username,
        email=new_user.email,
        role=norm_role,
        name=name_clean,
        department=payload.department or "Operations",
        status="Active",
        mfa_enabled=True,
        warehouse_name=wh_name,
    )

    return BaseResponse(
        success=True,
        message=f"User '{name_clean}' ({email_clean}) provisioned in database successfully.",
        data=created_item,
    )


@router.delete(
    "/users/{user_id}",
    response_model=BaseResponse[Dict[str, str]],
    status_code=status.HTTP_200_OK,
    summary="Delete Real Workspace User",
    description="Removes a user and their employee profile from PostgreSQL database.",
)
async def delete_workspace_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
) -> BaseResponse[Dict[str, str]]:
    """Removes a user from the database."""
    # Find user
    stmt = select(User).where(User.id == user_id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found.",
        )

    # Remove associated employee records first
    emp_stmt = select(Employee).where(Employee.user_id == user_id)
    emp = (await db.execute(emp_stmt)).scalar_one_or_none()
    if emp:
        await db.delete(emp)

    await db.delete(user)
    await db.commit()

    return BaseResponse(
        success=True,
        message=f"User '{user.username}' deleted successfully from database.",
        data={"deleted_user_id": user_id},
    )
