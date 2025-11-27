# app/schemas/friend.py
import uuid
from pydantic import BaseModel, ConfigDict
from app.models.friend import FriendStatus
from .user import User

class FriendRequestCreate(BaseModel):
    accepter_id: uuid.UUID

class FriendRequestResponse(BaseModel):
    status: FriendStatus # Chỉ chấp nhận 'accepted' hoặc 'declined'

class Friend(BaseModel):
    user: User
    status: FriendStatus
    model_config = ConfigDict(from_attributes=True)