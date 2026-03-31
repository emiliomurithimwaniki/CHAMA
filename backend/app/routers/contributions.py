from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models.contribution import Contribution
from app.models.membership import Membership
from app.models.user import User
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

    target_user = db.get(User, c.user_id)
    recorder = db.get(User, c.recorded_by_user_id) if c.recorded_by_user_id else None

    return ContributionOut(
        id=c.id,
        chama_id=c.chama_id,
        user_id=c.user_id,
        user_full_name=getattr(target_user, "full_name", None),
        amount=c.amount,
        contribution_date=c.contribution_date,
        period_key=c.period_key,
        payment_method=c.payment_method,
        payment_reference=c.payment_reference,
        recorded_by_user_id=c.recorded_by_user_id,
        recorded_by_full_name=getattr(recorder, "full_name", None),
        status=c.status,
        created_at=c.created_at,
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

    user_ids = set()
    for r in rows:
        if r.user_id:
            user_ids.add(r.user_id)
        if r.recorded_by_user_id:
            user_ids.add(r.recorded_by_user_id)

    users = db.query(User).filter(User.id.in_(list(user_ids))).all() if user_ids else []
    user_map = {u.id: u for u in users}

    out = []
    for r in rows:
        target_user = user_map.get(r.user_id)
        recorder = user_map.get(r.recorded_by_user_id) if r.recorded_by_user_id else None
        out.append(
            ContributionOut(
                id=r.id,
                chama_id=r.chama_id,
                user_id=r.user_id,
                user_full_name=getattr(target_user, "full_name", None),
                amount=r.amount,
                contribution_date=r.contribution_date,
                period_key=r.period_key,
                payment_method=r.payment_method,
                payment_reference=r.payment_reference,
                recorded_by_user_id=r.recorded_by_user_id,
                recorded_by_full_name=getattr(recorder, "full_name", None),
                status=r.status,
                created_at=r.created_at,
            )
        )
    return out
