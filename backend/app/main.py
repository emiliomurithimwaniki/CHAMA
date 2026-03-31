from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, chamas, contributions, loans, mpesa, chat
from app.routers.payments import router as payments_router
from app.ws.chat_ws import chat_ws_endpoint

app = FastAPI(title=settings.app_name)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()] if settings.cors_origins else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth, prefix=settings.api_v1_prefix)
app.include_router(chamas.router, prefix=settings.api_v1_prefix)
app.include_router(contributions.router, prefix=settings.api_v1_prefix)
app.include_router(loans.router, prefix=settings.api_v1_prefix)
app.include_router(chat.router, prefix=settings.api_v1_prefix)
app.include_router(mpesa.router, prefix=settings.api_v1_prefix)
app.include_router(payments_router, prefix=settings.api_v1_prefix)


@app.get("/")
def root():
    return {"ok": True, "name": settings.app_name}


@app.websocket("/ws/chat/{chama_id}")
async def ws_chat(websocket, chama_id: str):
    await chat_ws_endpoint(websocket, chama_id)
