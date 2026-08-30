"""
SupplySense — One-Time PostgreSQL Database User Seeder
======================================================
Inserts initial Admin & Manager accounts directly into PostgreSQL User table with salted bcrypt password hashes.
"""

import sys
import asyncio
import dotenv

sys.path.append(r"c:\SupplySense\SupplySense_Backend")
dotenv.load_dotenv(r"c:\SupplySense\SupplySense_Backend\.env")

from sqlalchemy import select, or_, func
from backend.app.database.database import async_session_factory
from models import User, generate_uuid
from backend.app.core.security import hash_password

async def seed_users():
    async with async_session_factory() as db:
        users_to_seed = [
            {"username": "jai123", "email": "jai123@gmail.com", "role": "Admin", "pwd": "admin123"},
            {"username": "admin", "email": "admin@supplysense.io", "role": "Admin", "pwd": "admin123"},
            {"username": "manager", "email": "manager@supplysense.io", "role": "Manager", "pwd": "manager123"},
        ]

        for u_data in users_to_seed:
            stmt = select(User).where(
                or_(
                    func.lower(User.username) == u_data["username"].lower(),
                    func.lower(User.email) == u_data["email"].lower(),
                )
            )
            res = await db.execute(stmt)
            existing = res.scalars().first()
            if not existing:
                new_user = User(
                    id=generate_uuid(),
                    username=u_data["username"],
                    email=u_data["email"],
                    password_hash=hash_password(u_data["pwd"]),
                    role=u_data["role"],
                )
                db.add(new_user)
                print(f"Seeded User: {u_data['username']} ({u_data['role']}) into PostgreSQL database.")
            else:
                print(f"User '{u_data['username']}' already exists in PostgreSQL database.")

        await db.commit()

if __name__ == "__main__":
    asyncio.run(seed_users())
