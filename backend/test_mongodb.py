import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test_mongo():
    try:
        client = AsyncIOMotorClient('mongodb://localhost:27017')
        await client.server_info()
        print("MongoDB connection OK")
        return True
    except Exception as e:
        print(f"MongoDB error: {e}")
        return False

if __name__ == "__main__":
    asyncio.run(test_mongo())
