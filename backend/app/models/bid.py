from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone

class Bid(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    auction_id: str
    user_id: str
    user_name: str
    bid_amount: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BidCreate(BaseModel):
    bid_amount: float
