import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User
from app.models.friend import FriendStatus
from app.schemas import friend as friend_schema
from app.services import friend_service, user_service

router = APIRouter()

@router.post("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def send_friend_request(user_id: uuid.UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    target_user = user_service.get_user(db, user_id=user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    request = friend_service.send_friend_request(db, requester_id=current_user.id, accepter_id=user_id)
    if not request:
        raise HTTPException(status_code=400, detail="Request already exists or invalid")
    return

@router.put("/{requester_id}/respond", status_code=status.HTTP_204_NO_CONTENT)
def respond_to_friend_request(requester_id: uuid.UUID, response: friend_schema.FriendRequestResponse, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if response.status not in [FriendStatus.ACCEPTED, FriendStatus.DECLINED]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    updated_request = friend_service.respond_to_friend_request(
        db, requester_id=requester_id, accepter_id=current_user.id, status=response.status
    )
    if not updated_request:
        raise HTTPException(status_code=404, detail="Friend request not found or already handled")
    return

@router.get("/pending", response_model=List[friend_schema.Friend])
def get_pending_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    requests = friend_service.get_pending_requests(db, user_id=current_user.id)
    # Cần map lại để trả về đúng schema
    return [{"user": user_service.get_user(db, r.user_id_requester), "status": r.status} for r in requests]

@router.get("/", response_model=List[friend_schema.User])
def get_friends(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    friend_relations = friend_service.get_friends(db, user_id=current_user.id)
    friend_ids = []
    for rel in friend_relations:
        if rel.user_id_requester == current_user.id:
            friend_ids.append(rel.user_id_accepter)
        else:
            friend_ids.append(rel.user_id_requester)
    
    friends = db.query(User).filter(User.id.in_(friend_ids)).all()
    return friends