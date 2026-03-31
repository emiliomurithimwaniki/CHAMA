import json
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.chat import ChatMessage
from app.models.membership import Membership


class ConnectionManager:
    def __init__(self):
        self.connections: dict[str, set[WebSocket]] = {}

    async def connect(self, chama_id: str, websocket: WebSocket):
        await websocket.accept()
        self.connections.setdefault(chama_id, set()).add(websocket)

    def disconnect(self, chama_id: str, websocket: WebSocket):
        if chama_id in self.connections:
            self.connections[chama_id].discard(websocket)
            if not self.connections[chama_id]:
                del self.connections[chama_id]

    async def broadcast(self, chama_id: str, message: dict[str, Any]):
        if chama_id not in self.connections:
            return
        data = json.dumps(message)
        dead: list[WebSocket] = []
        for ws in self.connections[chama_id]:
            try:
                await ws.send_text(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(chama_id, ws)


manager = ConnectionManager()


def _get_user_id_from_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload.get("sub")
    except JWTError:
        return None


async def chat_ws_endpoint(websocket: WebSocket, chama_id: str):
    token = websocket.query_params.get("token")
    user_id = _get_user_id_from_token(token or "")
    if not user_id:
        await websocket.close(code=1008)
        return

    db: Session = SessionLocal()
    try:
        membership = (
            db.query(Membership)
            .filter(Membership.chama_id == chama_id, Membership.user_id == user_id)
            .first()
        )
        if not membership:
            await websocket.close(code=1008)
            return

        await manager.connect(chama_id, websocket)

        await websocket.send_text(json.dumps({"type": "AUTH_OK", "userId": user_id}))

        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except Exception:
                await websocket.send_text(json.dumps({"type": "ERROR", "message": "Invalid JSON"}))
                continue

            if msg.get("type") == "SEND_MESSAGE":
                channel_id = msg.get("channelId")
                body = (msg.get("body") or "").strip()
                if not channel_id or not body:
                    await websocket.send_text(json.dumps({"type": "ERROR", "message": "Missing channelId/body"}))
                    continue

                m = ChatMessage(
                    chama_id=chama_id,
                    channel_id=channel_id,
                    sender_user_id=user_id,
                    body=body,
                    message_type=msg.get("messageType") or "text",
                    attachment_url=msg.get("attachmentUrl"),
                )
                db.add(m)
                db.commit()
                db.refresh(m)

                out = {
                    "type": "NEW_MESSAGE",
                    "message": {
                        "id": m.id,
                        "chama_id": m.chama_id,
                        "channel_id": m.channel_id,
                        "sender_user_id": m.sender_user_id,
                        "body": m.body,
                        "message_type": m.message_type,
                        "attachment_url": m.attachment_url,
                        "created_at": m.created_at.isoformat(),
                    },
                }
                await manager.broadcast(chama_id, out)
            else:
                await websocket.send_text(json.dumps({"type": "ERROR", "message": "Unknown event"}))

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(chama_id, websocket)
        db.close()
