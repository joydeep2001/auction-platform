import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
import uuid
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_database():
    print("Seeding database...")
    
    # Clear existing data
    await db.users.delete_many({})
    await db.auctions.delete_many({})
    await db.bids.delete_many({})
    await db.audit_logs.delete_many({})
    
    # Create admin user
    admin_id = str(uuid.uuid4())
    admin_user = {
        "id": admin_id,
        "name": "Admin User",
        "email": "admin@auction.com",
        "password_hash": pwd_context.hash("admin123"),
        "is_admin": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_user)
    print(f"Created admin user: admin@auction.com / admin123")
    
    # Create regular users
    user1_id = str(uuid.uuid4())
    user1 = {
        "id": user1_id,
        "name": "John Doe",
        "email": "john@example.com",
        "password_hash": pwd_context.hash("password123"),
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user1)
    print(f"Created user: john@example.com / password123")
    
    user2_id = str(uuid.uuid4())
    user2 = {
        "id": user2_id,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "password_hash": pwd_context.hash("password123"),
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user2)
    print(f"Created user: jane@example.com / password123")
    
    # Sample auction data
    auctions_data = [
        {
            "title": "Vintage Rolex Submariner Watch",
            "description": "A rare 1960s Rolex Submariner in excellent condition. This iconic timepiece features automatic movement, date function, and original bracelet. A true collector's item with documented history.",
            "image_url": "https://images.unsplash.com/photo-1629582183727-86788aeaef34?crop=entropy&cs=srgb&fm=jpg&q=85",
            "starting_price": 5000.00,
            "start_time": datetime.now(timezone.utc) - timedelta(hours=2),
            "end_time": datetime.now(timezone.utc) + timedelta(hours=6),
        },
        {
            "title": "Classic 1967 Ford Mustang",
            "description": "Fully restored classic Ford Mustang with original V8 engine. Features include power steering, disc brakes, and custom leather interior. Documented restoration with all original parts.",
            "image_url": "https://images.unsplash.com/photo-1660726343043-9733d701a71f?crop=entropy&cs=srgb&fm=jpg&q=85",
            "starting_price": 35000.00,
            "start_time": datetime.now(timezone.utc) - timedelta(hours=1),
            "end_time": datetime.now(timezone.utc) + timedelta(hours=12),
        },
        {
            "title": "Limited Edition Designer Handbag",
            "description": "Rare limited edition designer handbag from the exclusive 2023 collection. Crafted from premium leather with gold-plated hardware. Comes with original packaging and authenticity certificate.",
            "image_url": "https://images.unsplash.com/photo-1712622083122-944eea9d23e1?crop=entropy&cs=srgb&fm=jpg&q=85",
            "starting_price": 2500.00,
            "start_time": datetime.now(timezone.utc) - timedelta(minutes=30),
            "end_time": datetime.now(timezone.utc) + timedelta(hours=4),
        },
        {
            "title": "Rare Collectible Vinyl Records Set",
            "description": "Complete collection of first-pressing vinyl records from legendary artists. Includes Beatles, Pink Floyd, Led Zeppelin, and more. All in mint condition with original sleeves.",
            "image_url": "https://images.unsplash.com/photo-1740616968774-926b4e6cdef2?crop=entropy&cs=srgb&fm=jpg&q=85",
            "starting_price": 1500.00,
            "start_time": datetime.now(timezone.utc) + timedelta(hours=2),
            "end_time": datetime.now(timezone.utc) + timedelta(hours=24),
        },
        {
            "title": "Antique Persian Rug - 19th Century",
            "description": "Museum-quality antique Persian rug from the late 1800s. Hand-knotted with natural dyes, featuring intricate geometric patterns. Expertly restored and authenticated by specialists.",
            "image_url": "https://images.unsplash.com/photo-1600166898405-da9535204843?crop=entropy&cs=srgb&fm=jpg&q=85",
            "starting_price": 8000.00,
            "start_time": datetime.now(timezone.utc) + timedelta(hours=6),
            "end_time": datetime.now(timezone.utc) + timedelta(hours=48),
        },
        {
            "title": "Professional DSLR Camera Kit",
            "description": "Complete professional photography kit including Canon EOS R5 body, three premium lenses (24-70mm, 70-200mm, 16-35mm), battery grips, filters, and Pelican case. Like new condition.",
            "image_url": "https://images.unsplash.com/photo-1606478224398-f67c4c8fbf0f?crop=entropy&cs=srgb&fm=jpg&q=85",
            "starting_price": 4500.00,
            "start_time": datetime.now(timezone.utc) - timedelta(days=1),
            "end_time": datetime.now(timezone.utc) - timedelta(hours=2),
        },
    ]
    
    # Create auctions
    created_auctions = []
    for auction_data in auctions_data:
        auction_id = str(uuid.uuid4())
        
        # Determine status
        now = datetime.now(timezone.utc)
        if now < auction_data['start_time']:
            status = 'upcoming'
        elif now > auction_data['end_time']:
            status = 'completed'
        else:
            status = 'ongoing'
        
        auction = {
            "id": auction_id,
            "item_id": auction_id,
            "title": auction_data['title'],
            "description": auction_data['description'],
            "image_url": auction_data['image_url'],
            "starting_price": auction_data['starting_price'],
            "start_time": auction_data['start_time'].isoformat(),
            "end_time": auction_data['end_time'].isoformat(),
            "current_highest_bid": None,
            "current_highest_bidder_id": None,
            "current_highest_bidder_name": None,
            "status": status,
            "total_bids": 0
        }
        
        await db.auctions.insert_one(auction)
        created_auctions.append((auction_id, status, auction_data['title']))
        print(f"Created {status} auction: {auction_data['title']}")
    
    # Add some sample bids to ongoing auctions
    for auction_id, status, title in created_auctions:
        if status == 'ongoing':
            # Get auction
            auction = await db.auctions.find_one({"id": auction_id})
            
            # Add 2-3 sample bids
            num_bids = 3
            current_bid = auction['starting_price']
            
            for i in range(num_bids):
                bid_id = str(uuid.uuid4())
                bidder = user1 if i % 2 == 0 else user2
                current_bid += 50 + (i * 25)
                
                bid = {
                    "id": bid_id,
                    "auction_id": auction_id,
                    "user_id": bidder['id'],
                    "user_name": bidder['name'],
                    "bid_amount": current_bid,
                    "created_at": (datetime.now(timezone.utc) - timedelta(minutes=30-i*10)).isoformat()
                }
                await db.bids.insert_one(bid)
                
                # Update auction
                await db.auctions.update_one(
                    {"id": auction_id},
                    {
                        "$set": {
                            "current_highest_bid": current_bid,
                            "current_highest_bidder_id": bidder['id'],
                            "current_highest_bidder_name": bidder['name'],
                            "total_bids": i + 1
                        }
                    }
                )
            
            print(f"  Added {num_bids} sample bids to: {title}")
    
    print("\n=== Database seeded successfully! ===")
    print("\nTest Accounts:")
    print("  Admin: admin@auction.com / admin123")
    print("  User 1: john@example.com / password123")
    print("  User 2: jane@example.com / password123")
    print("\nAuctions created:")
    for _, status, title in created_auctions:
        print(f"  [{status.upper()}] {title}")

if __name__ == "__main__":
    asyncio.run(seed_database())
