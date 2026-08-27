"""One-time migration: username -> email for existing users."""
import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.deploy.database import connect_db, close_db, get_db
from backend.deploy.auth import hash_password

EMAIL_MAP = {
    "admin": "admin@airwaymd.com",
    "doctor1": "doctor1@airwaymd.com",
}

async def migrate():
    await connect_db()
    db = get_db()

    # Drop old username index if it exists
    try:
        await db.users.drop_index("username_1")
        print("Dropped old username index")
    except Exception:
        print("No username index to drop")

    # Migrate existing users
    cursor = db.users.find({})
    count = 0
    async for doc in cursor:
        if "email" not in doc or doc.get("email") is None:
            old_username = doc.get("username", "")
            new_email = EMAIL_MAP.get(old_username, f"{old_username}@airwaymd.com")
            await db.users.update_one(
                {"_id": doc["_id"]},
                {"$set": {"email": new_email}, "$unset": {"username": ""}}
            )
            print(f"Migrated: {old_username} -> {new_email}")
            count += 1

    print(f"Migrated {count} users")

    # Now create the email unique index
    await db.users.create_index("email", unique=True)
    print("Created email unique index")

    await close_db()

if __name__ == "__main__":
    asyncio.run(migrate())
