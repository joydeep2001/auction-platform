from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone


class AuditLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    auction_id: str
    user_id: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))