from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, date

from ..core import get_db
from ..models import BudgetTransaction, MonthlyFinancials, User
from ..models.budget_transaction import BudgetTransactionType, BudgetAccount
from ..schemas import (
    BudgetTransactionCreate,
    BudgetTransactionUpdate,
    BudgetTransactionResponse,
    BudgetBalances,
    BudgetTransactionSummary
)
from .auth import get_current_user
from .financials import get_or_create_current_month

router = APIRouter(prefix="/budget", tags=["Budget Management"])


@router.get("/balances", response_model=BudgetBalances)
async def get_budget_balances(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current balances for both accounts"""
    financials = get_or_create_current_month(db)
    
    return BudgetBalances(
        monthly_profit=financials.monthly_profit,  # type: ignore
        monthly_revenue=financials.monthly_revenue,  # type: ignore
        overall_capital=financials.overall_capital,  # type: ignore
        last_updated=financials.updated_at or financials.created_at  # type: ignore
    )


@router.get("/transactions", response_model=List[BudgetTransactionResponse])
async def get_budget_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    transaction_type: Optional[BudgetTransactionType] = None,
    account: Optional[BudgetAccount] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get budget transactions with optional filters"""
    query = db.query(BudgetTransaction)
    
    if transaction_type:
        query = query.filter(BudgetTransaction.type == transaction_type)
    
    if account:
        query = query.filter(BudgetTransaction.account == account)
    
    if start_date:
        query = query.filter(BudgetTransaction.transaction_date >= start_date)
    
    if end_date:
        query = query.filter(BudgetTransaction.transaction_date <= end_date)
    
    transactions = query.order_by(
        BudgetTransaction.transaction_date.desc()
    ).offset(skip).limit(limit).all()
    
    return transactions


@router.get("/transactions/{transaction_id}", response_model=BudgetTransactionResponse)
async def get_budget_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific budget transaction"""
    transaction = db.query(BudgetTransaction).filter(
        BudgetTransaction.id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return transaction


@router.post("/add", response_model=BudgetTransactionResponse, status_code=status.HTTP_201_CREATED)
async def add_funds(
    transaction_data: BudgetTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add funds to an account"""
    if transaction_data.type != BudgetTransactionType.ADDITION:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use this endpoint only for additions. Use /withdraw for withdrawals."
        )
    
    if transaction_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be positive"
        )
    
    # Get current month's financials
    financials = get_or_create_current_month(db)
    
    # Update the appropriate account
    if transaction_data.account == BudgetAccount.MONTHLY_PROFIT:
        financials.monthly_profit += transaction_data.amount  # type: ignore
    elif transaction_data.account == BudgetAccount.OVERALL_CAPITAL:
        financials.overall_capital += transaction_data.amount  # type: ignore
    
    # Create transaction record
    new_transaction = BudgetTransaction(
        **transaction_data.model_dump(),
        created_by=current_user.email  # type: ignore
    )
    
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    db.refresh(financials)
    
    return new_transaction


@router.post("/withdraw", response_model=BudgetTransactionResponse, status_code=status.HTTP_201_CREATED)
async def withdraw_funds(
    transaction_data: BudgetTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Withdraw funds from an account"""
    if transaction_data.type != BudgetTransactionType.WITHDRAWAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use this endpoint only for withdrawals. Use /add for additions."
        )
    
    if transaction_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be positive"
        )
    
    # Get current month's financials
    financials = get_or_create_current_month(db)
    
    # Check if sufficient balance
    if transaction_data.account == BudgetAccount.MONTHLY_PROFIT:
        if financials.monthly_profit < transaction_data.amount:  # type: ignore
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance in Monthly Profit. Available: ${financials.monthly_profit:.2f}"
            )
        financials.monthly_profit -= transaction_data.amount  # type: ignore
    elif transaction_data.account == BudgetAccount.OVERALL_CAPITAL:
        if financials.overall_capital < transaction_data.amount:  # type: ignore
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance in Overall Capital. Available: ${financials.overall_capital:.2f}"
            )
        financials.overall_capital -= transaction_data.amount  # type: ignore
    
    # Create transaction record
    new_transaction = BudgetTransaction(
        **transaction_data.model_dump(),
        created_by=current_user.email  # type: ignore
    )
    
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    db.refresh(financials)
    
    return new_transaction


@router.get("/summary", response_model=BudgetTransactionSummary)
async def get_transaction_summary(
    account: Optional[BudgetAccount] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get summary of budget transactions"""
    query = db.query(BudgetTransaction)
    
    if account:
        query = query.filter(BudgetTransaction.account == account)
    
    if start_date:
        query = query.filter(BudgetTransaction.transaction_date >= start_date)
    
    if end_date:
        query = query.filter(BudgetTransaction.transaction_date <= end_date)
    
    transactions = query.all()
    
    total_additions = sum(
        t.amount for t in transactions
        if t.type == BudgetTransactionType.ADDITION  # type: ignore
    )
    
    total_withdrawals = sum(
        t.amount for t in transactions
        if t.type == BudgetTransactionType.WITHDRAWAL  # type: ignore
    )
    
    return BudgetTransactionSummary(
        total_additions=total_additions,  # type: ignore
        total_withdrawals=total_withdrawals,  # type: ignore
        net_change=total_additions - total_withdrawals,  # type: ignore
        transaction_count=len(transactions)
    )


@router.put("/transactions/{transaction_id}", response_model=BudgetTransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction_data: BudgetTransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a budget transaction (only description and notes)"""
    transaction = db.query(BudgetTransaction).filter(
        BudgetTransaction.id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Only allow updating description and notes
    update_data = transaction_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transaction, field, value)
    
    db.commit()
    db.refresh(transaction)
    
    return transaction


@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a budget transaction (admin only)
    WARNING: This will NOT reverse the financial impact
    """
    transaction = db.query(BudgetTransaction).filter(
        BudgetTransaction.id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    db.delete(transaction)
    db.commit()
    
    return None

# Made with Bob