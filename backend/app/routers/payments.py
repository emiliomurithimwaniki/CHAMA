import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models.membership import Membership
from app.models.payment import PaymentTransaction

router = APIRouter(prefix="/chamas/{chama_id}/payments", tags=["payments"])


def _membership(db: Session, chama_id: str, user_id: str) -> Membership:
    m = db.query(Membership).filter(Membership.chama_id == chama_id, Membership.user_id == user_id).first()
    if not m:
        raise HTTPException(status_code=403, detail="Not a member of this chama")
    return m


@router.get("/transactions")
def list_transactions(
    chama_id: str,
    match_status: str | None = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    membership = _membership(db, chama_id, user.id)
    if membership.role not in {"treasurer", "chairperson"}:
        raise HTTPException(status_code=403, detail="Not allowed")

    q = db.query(PaymentTransaction).filter(PaymentTransaction.chama_id == chama_id)
    if match_status:
        q = q.filter(PaymentTransaction.match_status == match_status)

    rows = q.order_by(PaymentTransaction.paid_at.desc()).limit(200).all()
    return [
        {
            "id": r.id,
            "provider": r.provider,
            "provider_txn_id": r.provider_txn_id,
            "payer_phone": r.payer_phone,
            "amount": r.amount,
            "paid_at": r.paid_at.isoformat(),
            "match_status": r.match_status,
            "matched_entity_type": r.matched_entity_type,
            "matched_entity_id": r.matched_entity_id,
            "raw_payload": json.loads(r.raw_payload) if r.raw_payload else None,
        }
        for r in rows
    ]
