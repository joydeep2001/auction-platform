from fastapi import WebSocket
import json
from app.db import redis_client

# WebSocket connection manager with Redis pub/sub
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}
        self.pubsub = None
        
    async def connect(self, websocket: WebSocket, auction_id: str, user_id: str):
        await websocket.accept()
        if auction_id not in self.active_connections:
            self.active_connections[auction_id] = []
        self.active_connections[auction_id].append({"websocket": websocket, "user_id": user_id})
        
    def disconnect(self, websocket: WebSocket, auction_id: str):
        if auction_id in self.active_connections:
            self.active_connections[auction_id] = [
                conn for conn in self.active_connections[auction_id] 
                if conn["websocket"] != websocket
            ]
            if not self.active_connections[auction_id]:
                del self.active_connections[auction_id]
    
    async def broadcast_to_auction(self, auction_id: str, message: dict):
        # Publish to Redis for multi-instance support
        await redis_client.publish(f'auction:{auction_id}', json.dumps(message))
        
        # Also send to local connections
        if auction_id in self.active_connections:
            disconnected = []
            for conn in self.active_connections[auction_id]:
                try:
                    await conn["websocket"].send_json(message)
                except Exception:
                    disconnected.append(conn)
            
            for conn in disconnected:
                self.disconnect(conn["websocket"], auction_id)