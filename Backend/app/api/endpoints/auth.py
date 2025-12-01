from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core import security
from app.core.config import settings
from app.core.database import get_db
from app.services import user_service
from app.schemas.token import Token
from app.schemas import user as user_schema

router = APIRouter()

@router.post("/login", response_model=Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = user_service.get_user_by_username(db, username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/signup", response_model = user_schema.User, status_code = status.HTTP_201_CREATED)
def signup(user: user_schema.UserCreate,db: Session = Depends(get_db)):
    db_user = user_service.get_user_by_username(db, username= user.username)
    if db_user:
        raise HTTPException(status_code = 400, detail="Username already registered")
    
    return user_service.create_user(db =db , user=user)
