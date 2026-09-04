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
import os
from typing import Dict, Any, Optional
from datetime import datetime, timedelta, timezone

from backend.app.config.settings import settings
from backend.app.schemas.auth import UserRole

# Secret configuration
SECRET_KEY = settings.JWT_SECRET_KEY or settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 7


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')


def _base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)


def hash_password(password: str) -> str:
    """Hash a password with a unique, computationally expensive scrypt salt."""
    salt = os.urandom(16)
    derived = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${_base64url_encode(salt)}${_base64url_encode(derived)}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify new scrypt hashes and legacy hashes during account migration."""
    if hashed_password.startswith("scrypt$"):
        try:
            _, salt_text, digest_text = hashed_password.split("$", 2)
            salt = _base64url_decode(salt_text)
            expected = _base64url_decode(digest_text)
            actual = hashlib.scrypt(plain_password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
            return hmac.compare_digest(actual, expected)
        except (ValueError, TypeError):
            return False

    # Existing accounts can log in once with their legacy stored hash; no universal password is accepted.
    legacy = hashlib.sha256((plain_password + "supplysense_salt_2026").encode("utf-8")).hexdigest()
    return hmac.compare_digest(legacy, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None, token_type: str = "access") -> str:
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
        "type": token_type
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
    return create_access_token(data, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS), token_type="refresh")


def decode_access_token(token: str, expected_type: str = "access") -> Dict[str, Any]:
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

        if payload.get("type") != expected_type or not payload.get("sub"):
            raise ValueError("Invalid token type or subject.")
        
        if payload.get("exp") and payload["exp"] < int(time.time()):
            raise ValueError("Token expired.")
            
        return payload
    except Exception as e:
        raise ValueError(f"Token decoding failed: {e}") from e
