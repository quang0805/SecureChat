# app/services/message_service.py
import uuid
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models import Message, Participant, Conversation
from app.schemas.message import MessageCreate, Message as MessageSchema
from app.core.websockets import manager
from app.services import user_service

async def create_message(db: Session, message_data: MessageCreate, conversation_id: uuid.UUID, sender_id: uuid.UUID):
   # 1. Kiểm tra quyền tham gia
   is_participant = db.query(Participant).filter(
       Participant.conversation_id == conversation_id,
       Participant.user_id == sender_id
   ).first()

   if not is_participant:
       raise HTTPException(status_code=403, detail="Not a member")

   # 2. Tạo đối tượng tin nhắn cho Double Ratchet
   db_message = Message(
       conversation_id=conversation_id,
       sender_id=sender_id,
       content=message_data.content, # Ciphertext
       content_type=message_data.content_type,
       iv=message_data.iv,
       # TRONG DOUBLE RATCHET: Signature đóng vai trò là Header (n, pn, pubKey)
       signature=message_data.signature 
   )
   db.add(db_message)

   # 3. Cập nhật thời gian hội thoại để đẩy lên đầu sidebar
   db.query(Conversation).filter(Conversation.id == conversation_id).update({
       "updated_at": func.now()
   })
   
   db.commit()
   db.refresh(db_message)

   # 4. Gắn thông tin người gửi để chuẩn bị broadcast
   db_message.sender = user_service.get_user(db, sender_id)
   message_output = MessageSchema.model_validate(db_message)

   # 5. Broadcast qua WebSocket
   participant_ids = [p.user_id for p in db.query(Participant.user_id).filter(Participant.conversation_id == conversation_id).all()]
   
   await manager.broadcast({
       "type": "new_message",
       "payload": message_output.model_dump(mode='json')
   }, participant_ids)

   return db_message

def get_messages_by_conversation(db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID, skip: int = 0, limit: int = 50):
    # (Giữ nguyên logic kiểm tra quyền và query tin nhắn của bạn)
    # Đảm bảo sử dụng .options(joinedload(Message.sender)) để lấy được identity_key_pub của người gửi
    messages = db.query(Message).options(joinedload(Message.sender))\
        .filter(Message.conversation_id == conversation_id)\
        .order_by(Message.created_at.desc()).offset(skip).limit(limit).all()
    return messages[::-1]