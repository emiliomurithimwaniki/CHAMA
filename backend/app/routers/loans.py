from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models.loan import Loan
from app.models.loan_approval import LoanApproval
from app.models.membership import Membership
from app.models.user import User
from app.schemas import LoanApprovalIn, LoanCreateIn, LoanOut

router = APIRouter(prefix="/chamas/{chama_id}/loans", tags=["loans"])


def _membership(db: Session, chama_id: str, user_id: str) -> Membership:
    m = db.query(Membership).filter(Membership.chama_id == chama_id, Membership.user_id == user_id).first()
    if not m:
        raise HTTPException(status_code=403, detail="Not a member of this chama")
    return m


def _ensure_status(loan: Loan, allowed: set[str]):
    if loan.status not in allowed:
        raise HTTPException(status_code=409, detail=f"Loan not in correct state: {loan.status}")


@router.post("", response_model=LoanOut)
def apply_for_loan(
    chama_id: str,
    payload: LoanCreateIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    _membership(db, chama_id, user.id)

    loan = Loan(
        chama_id=chama_id,
        borrower_user_id=user.id,
        principal_amount=payload.principal_amount,
        interest_type=payload.interest_type,
        interest_rate=payload.interest_rate,
        term_months=payload.term_months,
        status="submitted",
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)

    borrower = db.get(User, loan.borrower_user_id)

    return LoanOut(
        id=loan.id,
        chama_id=loan.chama_id,
        borrower_user_id=loan.borrower_user_id,
        borrower_full_name=getattr(borrower, "full_name", None),
        principal_amount=loan.principal_amount,
        interest_type=loan.interest_type,
        interest_rate=loan.interest_rate,
        term_months=loan.term_months,
        status=loan.status,
        total_payable=loan.total_payable,
        created_at=loan.created_at,
        updated_at=loan.updated_at,
    )


@router.get("", response_model=list[LoanOut])
def list_loans(chama_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    membership = _membership(db, chama_id, user.id)

    q = db.query(Loan).filter(Loan.chama_id == chama_id)
    if membership.role == "member":
        q = q.filter(Loan.borrower_user_id == user.id)

    loans = q.order_by(Loan.created_at.desc()).limit(200).all()

    user_ids = {l.borrower_user_id for l in loans if l.borrower_user_id}
    users = db.query(User).filter(User.id.in_(list(user_ids))).all() if user_ids else []
    user_map = {u.id: u for u in users}

    return [
        LoanOut(
            id=l.id,
            chama_id=l.chama_id,
            borrower_user_id=l.borrower_user_id,
            borrower_full_name=getattr(user_map.get(l.borrower_user_id), "full_name", None),
            principal_amount=l.principal_amount,
            interest_type=l.interest_type,
            interest_rate=l.interest_rate,
            term_months=l.term_months,
            status=l.status,
            total_payable=l.total_payable,
            created_at=l.created_at,
            updated_at=l.updated_at,
        )
        for l in loans
    ]


@router.post("/{loan_id}/approve/treasurer")
def treasurer_approve(
    chama_id: str,
    loan_id: str,
    payload: LoanApprovalIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    membership = _membership(db, chama_id, user.id)
    if membership.role != "treasurer":
        raise HTTPException(status_code=403, detail="Only treasurer can approve at this step")

    loan = db.get(Loan, loan_id)
    if not loan or loan.chama_id != chama_id:
        raise HTTPException(status_code=404, detail="Loan not found")

    _ensure_status(loan, {"submitted"})

    approval = LoanApproval(
        chama_id=chama_id,
        loan_id=loan_id,
        step="treasurer",
        status="approved",
        acted_by_user_id=user.id,
        reason=payload.reason,
    )
    db.add(approval)
    loan.status = "treasurer_approved"
    db.commit()
    return {"ok": True}


@router.post("/{loan_id}/approve/chairperson")
def chairperson_approve(
    chama_id: str,
    loan_id: str,
    payload: LoanApprovalIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    membership = _membership(db, chama_id, user.id)
    if membership.role != "chairperson":
        raise HTTPException(status_code=403, detail="Only chairperson can approve at this step")

    loan = db.get(Loan, loan_id)
    if not loan or loan.chama_id != chama_id:
        raise HTTPException(status_code=404, detail="Loan not found")

    _ensure_status(loan, {"treasurer_approved"})

    approval = LoanApproval(
        chama_id=chama_id,
        loan_id=loan_id,
        step="chairperson",
        status="approved",
        acted_by_user_id=user.id,
        reason=payload.reason,
    )
    db.add(approval)
    loan.status = "active"
    db.commit()
    return {"ok": True}


@router.post("/{loan_id}/reject/treasurer")
def treasurer_reject(
    chama_id: str,
    loan_id: str,
    payload: LoanApprovalIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    membership = _membership(db, chama_id, user.id)
    if membership.role != "treasurer":
        raise HTTPException(status_code=403, detail="Only treasurer can reject at this step")

    loan = db.get(Loan, loan_id)
    if not loan or loan.chama_id != chama_id:
        raise HTTPException(status_code=404, detail="Loan not found")

    _ensure_status(loan, {"submitted"})

    approval = LoanApproval(
        chama_id=chama_id,
        loan_id=loan_id,
        step="treasurer",
        status="rejected",
        acted_by_user_id=user.id,
        reason=payload.reason,
    )
    db.add(approval)
    loan.status = "treasurer_rejected"
    db.commit()
    return {"ok": True}


@router.post("/{loan_id}/reject/chairperson")
def chairperson_reject(
    chama_id: str,
    loan_id: str,
    payload: LoanApprovalIn,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    membership = _membership(db, chama_id, user.id)
    if membership.role != "chairperson":
        raise HTTPException(status_code=403, detail="Only chairperson can reject at this step")

    loan = db.get(Loan, loan_id)
    if not loan or loan.chama_id != chama_id:
        raise HTTPException(status_code=404, detail="Loan not found")

    _ensure_status(loan, {"treasurer_approved"})

    approval = LoanApproval(
        chama_id=chama_id,
        loan_id=loan_id,
        step="chairperson",
        status="rejected",
        acted_by_user_id=user.id,
        reason=payload.reason,
    )
    db.add(approval)
    loan.status = "chairperson_rejected"
    db.commit()
    return {"ok": True}
