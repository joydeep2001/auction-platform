# Auction endpoints
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends

from app.db import db
from app.core.utils import get_auction_status, get_current_user
from app.manager.connection_manager import ConnectionManager
from app.models.auction import Auction, AuctionCreate, AuctionStatus
from app.models.audit import AuditLog
from app.models.bid import Bid, BidCreate
from app.models.user import User


api_router = APIRouter(
    prefix="/auctions",
    tags=["auctions"]
)


@api_router.get("/", response_model=List[Auction])
async def get_auctions(status: Optional[str] = None):
    query = {}
    auctions = await db.auctions.find(query, {"_id": 0}).to_list(1000)
    
    # Update status based on current time
    for auction in auctions:
        if isinstance(auction.get('start_time'), str):
            auction['start_time'] = datetime.fromisoformat(auction['start_time'])
        if isinstance(auction.get('end_time'), str):
            auction['end_time'] = datetime.fromisoformat(auction['end_time'])
        
        auction['status'] = get_auction_status(auction['start_time'], auction['end_time'])
    
    # Filter by status if provided
    if status:
        auctions = [a for a in auctions if a['status'] == status]
    
    return auctions

@api_router.get("/{auction_id}", response_model=Auction)
async def get_auction(auction_id: str):
    auction = await db.auctions.find_one({"id": auction_id}, {"_id": 0})
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    if isinstance(auction.get('start_time'), str):
        auction['start_time'] = datetime.fromisoformat(auction['start_time'])
    if isinstance(auction.get('end_time'), str):
        auction['end_time'] = datetime.fromisoformat(auction['end_time'])
    
    auction['status'] = get_auction_status(auction['start_time'], auction['end_time'])
    
    return Auction(**auction)

@api_router.post("/", response_model=Auction)
async def create_auction(auction_data: AuctionCreate, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create auctions")
    
    import uuid
    auction_id = str(uuid.uuid4())
    
    auction = Auction(
        id=auction_id,
        item_id=auction_id,
        title=auction_data.title,
        description=auction_data.description,
        image_url=auction_data.image_url,
        starting_price=auction_data.starting_price,
        start_time=auction_data.start_time,
        end_time=auction_data.end_time,
        current_highest_bid=None,
        current_highest_bidder_id=None,
        status=get_auction_status(auction_data.start_time, auction_data.end_time),
        total_bids=0
    )
    
    auction_dict = auction.model_dump()
    auction_dict['start_time'] = auction_dict['start_time'].isoformat()
    auction_dict['end_time'] = auction_dict['end_time'].isoformat()
    
    await db.auctions.insert_one(auction_dict)
    return auction

@api_router.post("/{auction_id}/bid")
async def place_bid(auction_id: str, bid_data: BidCreate, current_user: User = Depends(get_current_user)):
    # Get auction
    auction = await db.auctions.find_one({"id": auction_id}, {"_id": 0})
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    if isinstance(auction.get('start_time'), str):
        auction['start_time'] = datetime.fromisoformat(auction['start_time'])
    if isinstance(auction.get('end_time'), str):
        auction['end_time'] = datetime.fromisoformat(auction['end_time'])
    
    # Check auction status
    auction_status = get_auction_status(auction['start_time'], auction['end_time'])
    if auction_status != AuctionStatus.ONGOING:
        raise HTTPException(status_code=400, detail="Auction is not active")
    
    # Validate bid amount
    min_bid = auction.get('current_highest_bid')
    if not isinstance(min_bid, (int, float)):
        min_bid = auction.get('starting_price', 0)
    
    if bid_data.bid_amount <= min_bid:
        raise HTTPException(
            status_code=400, 
            detail=f"Bid must be higher than current highest bid (${min_bid})"
        )
    
    # Create bid
    import uuid
    bid_id = str(uuid.uuid4())
    bid = Bid(
        id=bid_id,
        auction_id=auction_id,
        user_id=current_user.id,
        user_name=current_user.name,
        bid_amount=bid_data.bid_amount,
        created_at=datetime.now(timezone.utc)
    )
    
    bid_dict = bid.model_dump()
    bid_dict['created_at'] = bid_dict['created_at'].isoformat()
    await db.bids.insert_one(bid_dict)
    
    # Update auction
    await db.auctions.update_one(
        {"id": auction_id},
        {
            "$set": {
                "current_highest_bid": bid_data.bid_amount,
                "current_highest_bidder_id": current_user.id,
                "current_highest_bidder_name": current_user.name
            },
            "$inc": {"total_bids": 1}
        }
    )
    
    # Create audit log
    log_id = str(uuid.uuid4())
    audit_log = AuditLog(
        id=log_id,
        auction_id=auction_id,
        user_id=current_user.id,
        message=f"{current_user.name} placed a bid of ${bid_data.bid_amount}"
    )
    log_dict = audit_log.model_dump()
    log_dict['timestamp'] = log_dict['timestamp'].isoformat()
    await db.audit_logs.insert_one(log_dict)
    manager = ConnectionManager()
    # Broadcast bid update via WebSocket
    await manager.broadcast_to_auction(auction_id, {
        "type": "new_bid",
        "bid": {
            "id": bid_id,
            "user_name": current_user.name,
            "bid_amount": bid_data.bid_amount,
            "created_at": bid.created_at.isoformat()
        },
        "auction": {
            "current_highest_bid": bid_data.bid_amount,
            "current_highest_bidder_name": current_user.name,
            "total_bids": auction.get('total_bids', 0) + 1
        }
    })
    
    return {
        "message": "Bid placed successfully", 
        "bid": {
            "id": bid_id,
            "auction_id": auction_id,
            "user_id": current_user.id,
            "user_name": current_user.name,
            "bid_amount": bid_data.bid_amount,
            "created_at": bid.created_at.isoformat()
        }
    }

@api_router.get("/{auction_id}/bids", response_model=List[Bid])
async def get_auction_bids(auction_id: str):
    bids = await db.bids.find({"auction_id": auction_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for bid in bids:
        if isinstance(bid.get('created_at'), str):
            bid['created_at'] = datetime.fromisoformat(bid['created_at'])
    
    return bids
