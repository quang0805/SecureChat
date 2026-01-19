# app/services/ratchet_service.py (Tạo mới hoặc cho vào conversation_service)
from sqlalchemy.orm import Session
from app.models import Participant

def update_ratchet_state(db: Session, convo_id: str, user_id: str, encrypted_state: str):
    participant = db.query(Participant).filter(
        Participant.conversation_id == convo_id,
        Participant.user_id == user_id
    ).first()
    if participant:
        participant.encrypted_ratchet_state = encrypted_state
        db.commit()
    return participant

def get_ratchet_state(db: Session, convo_id: str, user_id: str):
    return db.query(Participant.encrypted_ratchet_state).filter(
        Participant.conversation_id == convo_id,
        Participant.user_id == user_id
    ).first()