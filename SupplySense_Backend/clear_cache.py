import asyncio
from backend.app.core.redis import delete_cache_pattern

async def main():
    deleted = await delete_cache_pattern("supplysense:shipments:*")
    print(f"Cleared shipments cache: {deleted}")

asyncio.run(main())
