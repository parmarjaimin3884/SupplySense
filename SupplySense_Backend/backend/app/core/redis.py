"""
SupplySense — Cloud Redis Connection Manager
=============================================
Manages connection pool to Upstash Cloud Redis for 0ms API response caching.
"""

import os
import json
import logging
from typing import Optional, Any

logger = logging.getLogger("supplysense.redis")
logging.basicConfig(level=logging.INFO)

aioredis = None
try:
    import redis.asyncio as aioredis
except Exception:
    try:
        import aioredis  # type: ignore
    except Exception:
        aioredis = None

_redis_client: Optional[Any] = None


async def get_redis_client() -> Optional[Any]:
    """Returns async Redis client connected to Cloud Redis."""
    global _redis_client
    redis_url = os.getenv("REDIS_URL")
    if not redis_url or aioredis is None:
        return None

    if _redis_client is None:
        try:
            _redis_client = aioredis.from_url(
                redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=5.0,
            )
            await _redis_client.ping()
            logger.info("Connected to Upstash Cloud Redis successfully.")
        except Exception as e:
            logger.warning(f"Failed to connect to Cloud Redis: {e}")
            _redis_client = None

    return _redis_client


async def get_cache(key: str) -> Optional[Any]:
    """Gets cached JSON value from Redis."""
    if aioredis is None:
        return None
    client = await get_redis_client()
    if not client:
        return None
    try:
        data = await client.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        logger.error(f"Redis get_cache error for key '{key}': {e}")
    return None


async def set_cache(key: str, value: Any, ttl_seconds: int = 300) -> bool:
    """Sets JSON value in Redis cache with Time-To-Live (TTL)."""
    if aioredis is None:
        return False
    client = await get_redis_client()
    if not client:
        return False
    try:
        json_data = json.dumps(value)
        await client.set(key, json_data, ex=ttl_seconds)
        return True
    except Exception as e:
        logger.error(f"Redis set_cache error for key '{key}': {e}")
        return False


async def delete_cache_pattern(pattern: str) -> bool:
    """Invalidates cached keys matching pattern."""
    if aioredis is None:
        return False
    client = await get_redis_client()
    if not client:
        return False
    try:
        keys = await client.keys(pattern)
        if keys:
            await client.delete(*keys)
        return True
    except Exception as e:
        logger.error(f"Redis delete_cache_pattern error: {e}")
        return False
