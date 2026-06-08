"""
Seed the database with an admin user for testing.
Run: python scripts/seed_db.py
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import asyncio
from src.deploy.database import connect_db, close_db, get_db
from src.deploy.auth import hash_password


async def seed():
    await connect_db()
    db = get_db()

    existing = await db.users.find_one({"username": "admin"})
    if not existing:
        await db.users.insert_one({
            "username": "admin",
            "hashed_password": hash_password("admin123"),
            "role": "admin",
        })
        print("Created admin user (admin / admin123)")
    else:
        print("Admin user already exists")

    existing = await db.users.find_one({"username": "doctor1"})
    if not existing:
        await db.users.insert_one({
            "username": "doctor1",
            "hashed_password": hash_password("doctor123"),
            "role": "doctor",
        })
        print("Created doctor user (doctor1 / doctor123)")
    else:
        print("Doctor user already exists")

    await close_db()


if __name__ == "__main__":
    asyncio.run(seed())
