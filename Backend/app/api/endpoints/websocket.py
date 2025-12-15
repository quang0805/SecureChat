# app/api/endpoints/websocket.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.core.websockets import manager
from app.core.security import get_current_user_from_token
from app.models.user import User

router = APIRouter()

@router.websocket("/ws/{token}")
async def websocket_endpoint(
    websocket: WebSocket,
    user: User = Depends(get_current_user_from_token)
):
    if not user:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user.id)
    try:    
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user.id)
    except Exception as e:
        print(f"Error in websocket for user {user.id}: {e}")
        manager.disconnect(websocket, user.id)