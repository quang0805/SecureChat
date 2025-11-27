from fastapi import APIRouter
from .endpoints import auth, users, friends , conversations, websocket

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(friends.router, prefix="/friends", tags=["Friends"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["Conversations"])


ws_router = APIRouter()
ws_router.include_router(websocket.router, tags=["WebSocket"])
