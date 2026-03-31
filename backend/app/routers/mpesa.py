import json
from fastapi import APIRouter, Request

router = APIRouter(prefix="/webhooks/mpesa", tags=["mpesa"])


@router.post("/c2b/confirmation")
async def c2b_confirmation(request: Request):
    payload = await request.json()
    return {"ResultCode": 0, "ResultDesc": "Accepted", "echo": payload}


@router.post("/stk/callback")
async def stk_callback(request: Request):
    payload = await request.json()
    return {"ok": True, "echo": payload}


@router.post("/debug/raw")
async def debug_raw(request: Request):
    body = await request.body()
    try:
        parsed = json.loads(body.decode("utf-8"))
    except Exception:
        parsed = {"raw": body.decode("utf-8", errors="ignore")}
    return {"ok": True, "data": parsed}
