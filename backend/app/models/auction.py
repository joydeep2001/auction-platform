
from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class Item(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    image_url: str
    starting_price: float

class AuctionStatus(str):
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    COMPLETED = "completed"

class Auction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    item_id: str
    title: str
    description: str
    image_url: str
    starting_price: float
    start_time: datetime
    end_time: datetime
    current_highest_bid: Optional[float] = None
    current_highest_bidder_id: Optional[str] = None
    current_highest_bidder_name: Optional[str] = None
    status: str
    total_bids: int = 0
    

class AuctionCreate(BaseModel):
    title: str
    description: str
    image_url: str
    starting_price: float
    start_time: datetime
    end_time: datetime
