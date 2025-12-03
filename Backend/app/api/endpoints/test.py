from fastapi import APIRouter, status, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services import user_service as UserService
from app.schemas.user import User as UserSchemas
router = APIRouter()


@router.get("/users_all", response_model = List[UserSchemas], status_code=status.HTTP_200_OK)
def get_all_users(db: Session = Depends(get_db)):
    list_users = UserService.get_all_user(db)
    if not list_users:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Khong co user nao trong database!")
    return list_users
