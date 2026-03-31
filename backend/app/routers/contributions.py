from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models.contribution import Contribution
from app.models.membership import Membership
from app.schemas import ContributionCreateIn, ContributionOut

router = APIRouter(prefix="/chamas/{chama_id}/contributions", tags=["contributions"])


def _must_be_member(db: Session, chama_id: str, user_id: str) -> Membership:
    m = db.query(Membership).filter(Membership.chama_id == chama_id, Membership.user_id == user_id).first()
    if not m:
        raise HTTPException(status_code=403, detail="Not a member of this chama")
    return m


@router.post("", response_model=ContributionOut)
def create_contribution(
    chama_id: str,
    payload: ContributionCreateIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    actor_membership = _must_be_member(db, chama_id, user.id)

    target_user_id = payload.user_id or user.id
    if target_user_id != user.id and actor_membership.role not in {"treasurer", "chairperson"}:
        raise HTTPException(status_code=403, detail="Only treasurer/chairperson can record for others")

    _must_be_member(db, chama_id, target_user_id)

    c = Contribution(
        chama_id=chama_id,
        user_id=target_user_id,
        amount=payload.amount,
        contribution_date=payload.contribution_date or date.today(),
        period_key=payload.period_key,
        payment_method=payload.payment_method,
        payment_reference=payload.payment_reference,
        recorded_by_user_id=user.id,
        status="confirmed",
    )
    db.add(c)
    db.commit()
    db.refresh(c)

    return ContributionOut(
        id=c.id,
        chama_id=c.chama_id,
        user_id=c.user_id,
        amount=c.amount,
        contribution_date=c.contribution_date,
        period_key=c.period_key,
        status=c.status,
    )


@router.get("", response_model=list[ContributionOut])
def list_contributions(
    chama_id: str,
    member_id: str | None = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    membership = _must_be_member(db, chama_id, user.id)

    q = db.query(Contribution).filter(Contribution.chama_id == chama_id)

    if member_id:
        if member_id != user.id and membership.role not in {"treasurer", "chairperson"}:
            raise HTTPException(status_code=403, detail="Not allowed")
        q = q.filter(Contribution.user_id == member_id)
    else:
        if membership.role not in {"treasurer", "chairperson"}:
            q = q.filter(Contribution.user_id == user.id)

    rows = q.order_by(Contribution.contribution_date.desc()).limit(200).all()
    return [
        ContributionOut(
            id=r.id,
            chama_id=r.chama_id,
            user_id=r.user_id,
            amount=r.amount,
            contribution_date=r.contribution_date,
            period_key=r.period_key,
            status=r.status,
        )
        for r in rows
    ]
