from fastapi import APIRouter
from .endpoints import auth, users, friends , conversations

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(friends.router, prefix="/friends", tags=["Friends"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["Conversations"])