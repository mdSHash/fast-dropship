from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import datetime

from ..core import get_db
from ..models import Transaction, User, TransactionType
from ..schemas import TransactionCreate, TransactionUpdate, TransactionResponse
from .auth import get_current_user, get_user_filter

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    type_filter: Optional[TransactionType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all transactions with optional type filter"""
    query = db.query(
        Transaction,
        User.username.label("created_by_username")
    ).outerjoin(User, Transaction.created_by == User.id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Transaction.created_by == user_filter)
    
    if type_filter:
        query = query.filter(Transaction.type == type_filter)
    
    results = query.order_by(Transaction.transaction_date.desc()).offset(skip).limit(limit).all()
    
    transactions = []
    for transaction, created_by_username in results:
        transaction_dict = {
            "id": transaction.id,
            "type": transaction.type,
            "category": transaction.category,
            "amount": transaction.amount,
            "description": transaction.description,
            "reference_id": transaction.reference_id,
            "created_at": transaction.created_at,
            "transaction_date": transaction.transaction_date,
            "created_by": transaction.created_by,
            "created_by_username": created_by_username
        }
        transactions.append(transaction_dict)
    
    return transactions


@router.get("/summary")
async def get_transaction_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get transaction summary (total income, expenses, profit)"""
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    
    income_query = db.query(func.sum(Transaction.amount)).filter(
        Transaction.type == TransactionType.INCOME
    )
    if user_filter is not None:
        income_query = income_query.filter(Transaction.created_by == user_filter)
    income = income_query.scalar() or 0.0
    
    expenses_query = db.query(func.sum(Transaction.amount)).filter(
        Transaction.type == TransactionType.EXPENSE
    )
    if user_filter is not None:
        expenses_query = expenses_query.filter(Transaction.created_by == user_filter)
    expenses = expenses_query.scalar() or 0.0
    
    profit = income - expenses
    
    return {
        "total_income": income,
        "total_expenses": expenses,
        "profit": profit,
        "capital": profit  # Assuming capital is the same as profit for now
    }


@router.get("/monthly")
async def get_monthly_transactions(
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get monthly transaction summary for charts"""
    if year is None:
        year = datetime.now().year
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    
    # Get monthly income
    income_query = db.query(
        extract('month', Transaction.transaction_date).label('month'),
        func.sum(Transaction.amount).label('amount')
    ).filter(
        Transaction.type == TransactionType.INCOME,
        extract('year', Transaction.transaction_date) == year
    )
    if user_filter is not None:
        income_query = income_query.filter(Transaction.created_by == user_filter)
    income_by_month = income_query.group_by(extract('month', Transaction.transaction_date)).all()
    
    # Get monthly expenses
    expenses_query = db.query(
        extract('month', Transaction.transaction_date).label('month'),
        func.sum(Transaction.amount).label('amount')
    ).filter(
        Transaction.type == TransactionType.EXPENSE,
        extract('year', Transaction.transaction_date) == year
    )
    if user_filter is not None:
        expenses_query = expenses_query.filter(Transaction.created_by == user_filter)
    expenses_by_month = expenses_query.group_by(extract('month', Transaction.transaction_date)).all()
    
    # Create monthly data structure
    monthly_data = []
    income_dict = {int(month): amount for month, amount in income_by_month}
    expenses_dict = {int(month): amount for month, amount in expenses_by_month}
    
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for i in range(1, 13):
        monthly_data.append({
            "month": month_names[i-1],
            "pv": float(income_dict.get(i, 0)),  # Revenue/Income
            "uv": float(expenses_dict.get(i, 0))  # Expenses
        })
    
    return monthly_data


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific transaction by ID"""
    query = db.query(Transaction).filter(Transaction.id == transaction_id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Transaction.created_by == user_filter)
    
    transaction = query.first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return transaction


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new transaction"""
    new_transaction = Transaction(**transaction_data.model_dump(), created_by=current_user.id)
    
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    
    return new_transaction


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a transaction"""
    query = db.query(Transaction).filter(Transaction.id == transaction_id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Transaction.created_by == user_filter)
    
    transaction = query.first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Update only provided fields
    update_data = transaction_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)
    
    db.commit()
    db.refresh(transaction)
    
    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a transaction"""
    query = db.query(Transaction).filter(Transaction.id == transaction_id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Transaction.created_by == user_filter)
    
    transaction = query.first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    db.delete(transaction)
    db.commit()
    
    return None

# Made with Bob
