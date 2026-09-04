"""
SupplySense — Centralized Dependency Injection Layer
=====================================================

Provides FastAPI dependency providers for:
- get_db()
- get_supervisor()
- get_llm()
- get_qdrant()
- get_current_user()
- require_role()
"""

from typing import AsyncGenerator, Callable, Optional, Any
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.database.database import get_db_session
from backend.app.core.security import decode_access_token
from backend.app.schemas.auth import UserResponse, UserRole

security_scheme = HTTPBearer(auto_error=False)

# Singleton instances
_supervisor_instance: Optional[Any] = None


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency provider for Async DB Session."""
    async for session in get_db_session():
        yield session


def get_supervisor():
    """Dependency provider for SupplySenseSupervisor orchestrator instance."""
    global _supervisor_instance
    if _supervisor_instance is None:
        from backend.app.ai.supervisor import SupplySenseSupervisor
        _supervisor_instance = SupplySenseSupervisor()
    return _supervisor_instance


def get_llm(**kwargs):
    """Dependency provider for active LLM instance."""
    from backend.app.ai.llm import get_llm as _factory_get_llm
    return _factory_get_llm(**kwargs)


def get_qdrant():
    """Dependency provider for vector store instance."""
    from backend.app.ai.vectorstore import get_vectorstore as _factory_get_vs
    return _factory_get_vs()


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
) -> UserResponse:
    """
    Validates JWT Bearer token or header fallback.
    Returns current authenticated UserResponse.
    """
    if credentials and credentials.credentials:
        try:
            payload = decode_access_token(credentials.credentials)
            role_str = str(payload.get("role", "Operations Manager"))
            return UserResponse(
                id=str(payload.get("sub", "usr_1001")),
                username=payload.get("username", "manager_john"),
                email=payload.get("email", "user@supplysense.io"),
                role=role_str,
                employee_name=payload.get("username", "Enterprise User"),
                warehouse_name="Surat Central Warehouse"
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid or expired authentication token: {e}",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def require_role(required_role: str) -> Callable:
    """
    Role-Based Access Control (RBAC) dependency factory.
    Example usage: `@require_role("CSCO_EXECUTIVE")`
    """
    async def role_checker(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
        user_role_str = str(getattr(current_user.role, "value", current_user.role) or "").upper()
        target_role = str(required_role).upper()

        # Admin and CSCO_EXECUTIVE are authorized across enterprise management & executive routes
        if user_role_str in ["ADMIN", "CSCO_EXECUTIVE", target_role] or target_role in ["ANY", "USER"]:
            return current_user

        if user_role_str != target_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires '{required_role}' role privileges.",
            )
        return current_user

    return role_checker
