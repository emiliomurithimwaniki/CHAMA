from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models.chat import ChatChannel, ChatMessage
from app.models.membership import Membership
from app.schemas import ChatMessageOut

router = APIRouter(prefix="/chamas/{chama_id}/chat", tags=["chat"])


def _membership(db: Session, chama_id: str, user_id: str) -> Membership:
    m = db.query(Membership).filter(Membership.chama_id == chama_id, Membership.user_id == user_id).first()
    if not m:
        raise HTTPException(status_code=403, detail="Not a member of this chama")
    return m


@router.get("/channels")
def list_channels(chama_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    _membership(db, chama_id, user.id)
    rows = db.query(ChatChannel).filter(ChatChannel.chama_id == chama_id).all()
    return [{"id": c.id, "name": c.name, "type": c.type} for c in rows]


@router.get("/channels/{channel_id}/messages", response_model=list[ChatMessageOut])
def list_messages(
    chama_id: str,
    channel_id: str,
    limit: int = 50,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    _membership(db, chama_id, user.id)

    q = (
        db.query(ChatMessage)
        .filter(ChatMessage.chama_id == chama_id, ChatMessage.channel_id == channel_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(min(limit, 200))
    )
    rows = list(reversed(q.all()))
    return [
        ChatMessageOut(
            id=m.id,
            chama_id=m.chama_id,
            channel_id=m.channel_id,
            sender_user_id=m.sender_user_id,
            body=m.body,
            message_type=m.message_type,
            attachment_url=m.attachment_url,
            created_at=m.created_at,
        )
        for m in rows
    ]
