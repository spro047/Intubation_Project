from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import settings

client: AsyncIOMotorClient = None


async def connect_db():
    global client
    client = AsyncIOMotorClient(settings.mongo_url)


async def close_db():
    global client
    if client:
        client.close()


def get_db() -> AsyncIOMotorDatabase:
    return client[settings.mongo_db]


async def ensure_indexes():
    db = get_db()
    await db.patients.create_index("patient_id", unique=True)
    await db.predictions.create_index([("patient_id", 1), ("created_at", -1)])
    await db.users.create_index("username", unique=True)
    await db.llm_reports.create_index([("prediction_id", 1)])
