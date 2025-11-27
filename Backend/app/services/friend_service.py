# app/services/friend_service.py
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from uuid import UUID
from app.models import Friend, User
from app.models.friend import FriendStatus

def send_friend_request(db: Session, requester_id: UUID, accepter_id: UUID):
    if requester_id == accepter_id: return None
    existing_request = db.query(Friend).filter(
        or_(
            and_(Friend.user_id_requester == requester_id, Friend.user_id_accepter == accepter_id),
            and_(Friend.user_id_requester == accepter_id, Friend.user_id_accepter == requester_id)
        )
    ).first()
    if existing_request: return None
    
    db_request = Friend(user_id_requester=requester_id, user_id_accepter=accepter_id)
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def respond_to_friend_request(db: Session, requester_id: UUID, accepter_id: UUID, status: FriendStatus):
    db_request = db.query(Friend).filter(
        Friend.user_id_requester == requester_id, 
        Friend.user_id_accepter == accepter_id
    ).first()
    if not db_request or db_request.status != FriendStatus.PENDING:
        return None
    db_request.status = status
    db.commit()
    db.refresh(db_request)
    return db_request

def get_friends(db: Session, user_id: UUID):
    return db.query(Friend).filter(
        or_(Friend.user_id_requester == user_id, Friend.user_id_accepter == user_id),
        Friend.status == FriendStatus.ACCEPTED
    ).all()

def get_pending_requests(db: Session, user_id: UUID):
    return db.query(Friend).filter(
        Friend.user_id_accepter == user_id,
        Friend.status == FriendStatus.PENDING
    ).all()