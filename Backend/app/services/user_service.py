# app/services/user_service.py
from sqlalchemy.orm import Session
from app.models import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash
import urllib.parse



def get_user(db: Session, user_id: str):
   return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str):
   return db.query(User).filter(User.username == username).first()


def create_user(db: Session, user: UserCreate):
   hashed_password = get_password_hash(user.password)
   avatar_style = "adventurer"
   seed = urllib.parse.quote(user.username)
   random_avatar_url = f"https://api.dicebear.com/9.x/{avatar_style}/svg?seed={seed}"

   db_user = User(
       username=user.username,
       password=hashed_password,
       display_name=user.display_name,
       avatar_url=random_avatar_url,
       # DOUBLE RATCHET: Lưu khóa định danh ECDH và Private Key đã mã hóa
       identity_key_pub=user.identity_key_pub,
       encrypted_private_key=user.encrypted_private_key
   )
   db.add(db_user)
   db.commit()
   db.refresh(db_user)
   return db_user

def get_user(db: Session, user_id: str):
   return db.query(User).filter(User.id == user_id).first()

def get_all_user(db: Session):
   return db.query(User).all()