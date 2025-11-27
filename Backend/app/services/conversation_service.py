# app/services/conversation_service.py
import uuid
from typing import List
from sqlalchemy.orm import Session, aliased
from fastapi import HTTPException, status
from app.models import Conversation, Participant, User
from app.schemas.conversation import ConversationCreate
from app.models.conversation import ConversationType


def create_conversation(db: Session, conversation_data: ConversationCreate, creator_id: uuid.UUID):
    # Kiểm tra xem các participant có tồn tại không
    participant_ids = list(set(conversation_data.participant_ids + [creator_id])) # Đảm bảo creator cũng là 1 participant
    participants_exist = db.query(User).filter(User.id.in_(participant_ids)).count()
    if participants_exist != len(participant_ids):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or more users not found")

    # Đối với conversation PRIVATE, chỉ cho phép 2 người
    if conversation_data.type == ConversationType.PRIVATE:
        if len(participant_ids) != 2:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Private conversation must have exactly 2 participants")
        
        participant_alias = aliased(Participant)

        # Kiểm tra xem conversation private giữa 2 người này đã tồn tại chưa
        user1_id, user2_id = participant_ids
        existing_conversation = (
            db.query(Conversation)
            .join(Participant, Conversation.id == Participant.conversation_id)
            .join(participant_alias, Conversation.id == participant_alias.conversation_id)
            .filter(Conversation.type == ConversationType.PRIVATE)
            .filter(Participant.user_id == user1_id)
            .filter(participant_alias.user_id == user2_id)
            .first()
        )
        if existing_conversation:
            return existing_conversation

    db_conversation = Conversation(
        type=conversation_data.type,
        name=conversation_data.name,
        creator_id=creator_id
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)

    # Thêm các thành viên vào bảng Participant
    for user_id in participant_ids:
        db_participant = Participant(
            user_id=user_id,
            conversation_id=db_conversation.id
        )
        db.add(db_participant)
    
    db.commit()
    return db_conversation

def get_user_conversations(db: Session, user_id: uuid.UUID):
    conversations = db.query(Conversation).join(Participant).filter(Participant.user_id == user_id).all()
    return conversations

def get_conversation_by_id(db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID):
    # Kiểm tra xem user có phải là thành viên của conversation không
    conversation = db.query(Conversation).join(Participant).filter(
        Conversation.id == conversation_id,
        Participant.user_id == user_id
    ).first()
    return conversation