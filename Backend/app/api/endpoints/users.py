from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas import user as user_schema
from app.services import user_service
from app.models import User
from app.core.websockets import manager

router = APIRouter()

@router.get("/me", response_model=user_schema.User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/online")
def get_user_online(user: User = Depends(get_current_user)):
    users_online = []
    for userId, sockets in manager.active_connections.items():
        if(len(sockets) > 0):
            users_online.append(userId)
    
    return users_online

@router.patch("/me", response_model=user_schema.User)
def update_displayname(
        display_name: str,
        db:Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    current_user.display_name = display_name
    db.commit()
    db.refresh(current_user)
    return current_user
 

@router.get("/search")
def search_users(q: str, db: Session = Depends(get_db)):
    return db.query(User).filter(User.username.ilike(f"%{q}%")).limit(5).all()


class AvatarUpdate(BaseModel):
    avatar_url: str

@router.patch("/me/avatar", response_model=user_schema.User)
def update_avatar(
    data: AvatarUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.avatar_url = data.avatar_url
    db.commit()
    db.refresh(current_user)
    return current_user