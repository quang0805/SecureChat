from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas import user as user_schema
from app.services import user_service
from app.models import User
from app.core.websockets import manager

router = APIRouter()

# @router.post("/", response_model=user_schema.User, status_code=status.HTTP_201_CREATED)
# def create_new_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
#     db_user = user_service.get_user_by_username(db, username=user.username)
#     if db_user:
#         raise HTTPException(status_code=400, detail="Username already registered")
#     return user_service.create_user(db=db, user=user)

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