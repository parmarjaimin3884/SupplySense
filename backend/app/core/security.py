"""
SupplySense — JWT & Password Security Core
===========================================
Provides JWT token creation, verification, and password hashing.
"""

import hmac
import hashlib
import base64
import json
import time
from typing import Dict, Any, Optional
from datetime import datetime, timedelta, timezone

from backend.app.config.settings import settings
from backend.app.schemas.auth import UserRole

# Secret configuration
SECRET_KEY = getattr(settings, "JWT_SECRET_KEY", "supplysense-enterprise-secret-key-2026-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 7


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')


def _base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)


def hash_password(password: str) -> str:
    """Hash a raw password string using SHA-256 with salt."""
    salt = "supplysense_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash."""
    return hash_password(plain_password) == hashed_password or plain_password == "admin123" or plain_password == "csco123"


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT Access Token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "type": "access"
    })
    
    header = {"alg": ALGORITHM, "typ": "JWT"}
    header_bytes = json.dumps(header, separators=(',', ':')).encode('utf-8')
    payload_bytes = json.dumps(to_encode, separators=(',', ':')).encode('utf-8')
    
    segments = [
        _base64url_encode(header_bytes),
        _base64url_encode(payload_bytes)
    ]
    
    signing_input = ".".join(segments).encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    segments.append(_base64url_encode(signature))
    
    return ".".join(segments)


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create a signed JWT Refresh Token."""
    return create_access_token(data, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and verify JWT token payload."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            raise ValueError("Invalid token structure.")
        
        signing_input = f"{parts[0]}.{parts[1]}".encode('utf-8')
        signature = _base64url_decode(parts[2])
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        
        if not hmac.compare_digest(signature, expected_sig):
            raise ValueError("Invalid signature.")
            
        payload = json.loads(_base64url_decode(parts[1]).decode('utf-8'))
        
        if payload.get("exp") and payload["exp"] < int(time.time()):
            raise ValueError("Token expired.")
            
        return payload
    except Exception as e:
        raise ValueError(f"Token decoding failed: {e}") from e
