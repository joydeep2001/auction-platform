from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as redis
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv(Path(__file__).resolve().parents[1] / '.env')

# MongoDB connection
mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.getenv('DB_NAME', 'auction_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Redis connection for pub/sub
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', '6379')),
    decode_responses=True
)