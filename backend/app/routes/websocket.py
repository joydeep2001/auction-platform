
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.manager.connection_manager import ConnectionManager

router = APIRouter()

async def websocket_endpoint(websocket: WebSocket, auction_id: str):
    user_id = websocket.query_params.get("user_id", "anonymous")
    manager = ConnectionManager()
    await manager.connect(websocket, auction_id, user_id)
    try:
        while True:
            _ = await websocket.receive_text()
            # Handle incoming messages here if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, auction_id)

# Register the websocket route with the router
router.add_api_websocket_route("/ws/{auction_id}", websocket_endpoint)
