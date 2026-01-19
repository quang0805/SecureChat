# app/api/endpoints/conversations.py
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, Participant, Message
from app.schemas import conversation as conversation_schema, message as message_schema
from app.services import conversation_service, message_service, user_service

router = APIRouter()

# --- 1. ĐỒNG BỘ TRẠNG THÁI BÁNH RĂNG (QUAN TRỌNG NHẤT) ---

@router.get("/{conversation_id}/ratchet-state", response_model=conversation_schema.RatchetStateResponse)
def get_ratchet_state(
   conversation_id: uuid.UUID,
   db: Session = Depends(get_db),
   current_user: User = Depends(get_current_user)
):
   """Lấy trạng thái bánh răng đã mã hóa để khôi phục phiên chat"""
   participant = db.query(Participant).filter(
       Participant.conversation_id == conversation_id,
       Participant.user_id == current_user.id
   ).first()
   
   if not participant:
       raise HTTPException(status_code=404, detail="Không tìm thấy thành viên trong hội thoại")
   
   return {"encrypted_ratchet_state": participant.encrypted_ratchet_state}

@router.patch("/{conversation_id}/ratchet-state")
def update_ratchet_state(
   conversation_id: uuid.UUID,
   state_in: conversation_schema.RatchetStateSync,
   db: Session = Depends(get_db),
   current_user: User = Depends(get_current_user)
):
   """Cập nhật trạng thái bánh răng sau mỗi tin nhắn (Gửi từ Frontend đã mã hóa)"""
   participant = db.query(Participant).filter(
       Participant.conversation_id == conversation_id,
       Participant.user_id == current_user.id
   ).first()
   
   if not participant:
       raise HTTPException(status_code=404, detail="Participant not found")
   
   participant.encrypted_ratchet_state = state_in.encrypted_ratchet_state
   db.commit()
   return {"status": "success"}

# --- 2. QUẢN LÝ HỘI THOẠI ---

@router.post("/", response_model=conversation_schema.Conversation, status_code=status.HTTP_201_CREATED)
async def create_new_conversation(
   conversation_in: conversation_schema.ConversationCreate,
   db: Session = Depends(get_db),
   current_user: User = Depends(get_current_user)
):
   # Hàm service này bây giờ sẽ broadcast qua WS kèm identity_key_pub của các thành viên
   conversation = await conversation_service.create_conversation(db, conversation_data=conversation_in, creator_id=current_user.id)
   return conversation

@router.get("/", response_model=List[conversation_schema.Conversation])
def get_my_conversations(
   db: Session = Depends(get_db),
   current_user: User = Depends(get_current_user)
):
   conversations = conversation_service.get_user_conversations(db, user_id=current_user.id)
   for conv in conversations:
       # Lấy thông tin user kèm identity_key_pub
       participants = db.query(User).join(Participant).filter(Participant.conversation_id == conv.id).all()
       conv.participants = participants
       
       last_msg = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.desc()).first()
       conv.last_message = last_msg
   return conversations

# --- 3. QUẢN LÝ TIN NHẮN ---

@router.post("/{conversation_id}/messages", response_model=message_schema.Message, status_code=status.HTTP_201_CREATED)
async def send_new_message(
   conversation_id: uuid.UUID,
   message_in: message_schema.MessageCreate,
   db: Session = Depends(get_db),
   current_user: User = Depends(get_current_user)
):
   conversation = conversation_service.get_conversation_by_id(db, conversation_id, user_id=current_user.id)
   if not conversation:
       raise HTTPException(status_code=404, detail="Conversation not found")

   # Lưu tin nhắn với dh_pub_key, msg_index, signature (header)
   message = await message_service.create_message(
       db, message_data=message_in, conversation_id=conversation_id, sender_id=current_user.id
   )
   message.sender = current_user
   return message


@router.get("/{conversation_id}/messages", response_model=List[message_schema.Message])
def get_conversation_messages(
   conversation_id: uuid.UUID,
   skip: int = 0,
   limit: int = 50,
   db: Session = Depends(get_db),
   current_user: User = Depends(get_current_user)
):
   """
   Lấy tin nhắn của một cuộc hội thoại.
   """
   messages = message_service.get_messages_by_conversation(
       db, conversation_id=conversation_id, user_id=current_user.id, skip=skip, limit=limit
   )
   # Populate sender information for each message
   for msg in messages:
       msg.sender = user_service.get_user(db, user_id=msg.sender_id)
   return messages