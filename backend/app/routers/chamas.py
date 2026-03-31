from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models.chama import Chama
from app.models.membership import Membership
from app.models.chat import ChatChannel
from app.models.user import User
from app.schemas import AddMemberIn, ChamaCreateIn, ChamaOut, ChamaUpdateIn, MembershipOut

router = APIRouter(prefix="/chamas", tags=["chamas"])


ADMIN_ROLES = {"chairperson", "treasurer", "secretary"}
VALID_ROLES = {"member", "chairperson", "treasurer", "secretary"}


def _require_admin(db: Session, chama_id: str, user_id: str) -> Membership:
    actor = db.query(Membership).filter(Membership.chama_id == chama_id, Membership.user_id == user_id).first()
    if not actor or actor.join_status != "approved" or actor.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Only admins can perform this action")
    return actor


def _admin_count(db: Session, chama_id: str) -> int:
    return (
        db.query(Membership)
        .filter(Membership.chama_id == chama_id, Membership.join_status == "approved", Membership.role.in_(ADMIN_ROLES))
        .count()
    )


@router.post("", response_model=ChamaOut)
def create_chama(payload: ChamaCreateIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    chama = Chama(name=payload.name, currency=payload.currency, created_by_user_id=user.id)
    db.add(chama)
    db.flush()

    membership = Membership(chama_id=chama.id, user_id=user.id, role="chairperson", join_status="approved")
    db.add(membership)

    channel = ChatChannel(chama_id=chama.id, type="group", name="General")
    db.add(channel)

    db.commit()
    db.refresh(chama)
    return ChamaOut(id=chama.id, name=chama.name, currency=chama.currency)


@router.get("", response_model=list[ChamaOut])
def list_my_chamas(db: Session = Depends(get_db), user=Depends(get_current_user)):
    memberships = db.query(Membership).filter(Membership.user_id == user.id).all()
    if not memberships:
        return []

    chamas = db.query(Chama).filter(Chama.id.in_([m.chama_id for m in memberships])).all()
    return [ChamaOut(id=c.id, name=c.name, currency=c.currency) for c in chamas]


@router.patch("/{chama_id}", response_model=ChamaOut)
def update_chama(chama_id: str, payload: ChamaUpdateIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    _require_admin(db, chama_id, user.id)
    chama = db.get(Chama, chama_id)
    if not chama:
        raise HTTPException(status_code=404, detail="Chama not found")

    if payload.name is not None:
        chama.name = payload.name
    if payload.currency is not None:
        chama.currency = payload.currency

    db.commit()
    db.refresh(chama)
    return ChamaOut(id=chama.id, name=chama.name, currency=chama.currency)


@router.get("/{chama_id}/members", response_model=list[MembershipOut])
def list_members(chama_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    actor = db.query(Membership).filter(Membership.chama_id == chama_id, Membership.user_id == user.id).first()
    if not actor or actor.join_status != "approved":
        raise HTTPException(status_code=403, detail="Not a member")
    rows = db.query(Membership).filter(Membership.chama_id == chama_id).all()
    user_ids = [m.user_id for m in rows]
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    user_map = {u.id: u for u in users}

    out = []
    for m in rows:
        u = user_map.get(m.user_id)
        out.append(
            MembershipOut(
                user_id=m.user_id,
                full_name=getattr(u, "full_name", None),
                phone_number=getattr(u, "phone_number", None),
                role=m.role,
                join_status=m.join_status,
            )
        )
    return out


@router.post("/{chama_id}/members", response_model=MembershipOut)
def add_member(chama_id: str, payload: AddMemberIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    _require_admin(db, chama_id, user.id)

    if payload.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    target = db.query(User).filter(User.phone_number == payload.phone_number).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(Membership).filter(Membership.chama_id == chama_id, Membership.user_id == target.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")

    m = Membership(chama_id=chama_id, user_id=target.id, role=payload.role, join_status="approved")
    db.add(m)
    db.commit()
    return MembershipOut(
        user_id=m.user_id,
        full_name=target.full_name,
        phone_number=target.phone_number,
        role=m.role,
        join_status=m.join_status,
    )


@router.delete("/{chama_id}/members/{user_id}")
def remove_member(chama_id: str, user_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    _require_admin(db, chama_id, user.id)

    m = db.query(Membership).filter(Membership.chama_id == chama_id, Membership.user_id == user_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Membership not found")

    if m.join_status == "approved" and m.role in ADMIN_ROLES:
        if _admin_count(db, chama_id) <= 1:
            raise HTTPException(status_code=400, detail="A group cannot exist without an admin")

    db.delete(m)
    db.commit()
    return {"ok": True}


@router.post("/{chama_id}/members/{user_id}/role")
def set_member_role(chama_id: str, user_id: str, role: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    _require_admin(db, chama_id, user.id)

    m = db.query(Membership).filter(Membership.chama_id == chama_id, Membership.user_id == user_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Membership not found")

    if m.join_status != "approved":
        raise HTTPException(status_code=400, detail="Cannot change role for unapproved member")

    if role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    current_is_admin = m.role in ADMIN_ROLES
    next_is_admin = role in ADMIN_ROLES

    if current_is_admin and not next_is_admin:
        if _admin_count(db, chama_id) <= 1:
            raise HTTPException(status_code=400, detail="A group cannot exist without an admin")

    m.role = role
    db.commit()
    return {"ok": True}
