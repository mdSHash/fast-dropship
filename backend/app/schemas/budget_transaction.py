from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from ..models.budget_transaction import BudgetTransactionType, BudgetAccount


class BudgetTransactionBase(BaseModel):
    type: BudgetTransactionType  # addition or withdrawal
    account: BudgetAccount  # monthly_profit or overall_capital
    amount: float
    description: Optional[str] = None
    notes: Optional[str] = None
    reference_id: Optional[str] = None


class BudgetTransactionCreate(BudgetTransactionBase):
    pass


class BudgetTransactionUpdate(BaseModel):
    description: Optional[str] = None
    notes: Optional[str] = None


class BudgetTransactionResponse(BudgetTransactionBase):
    id: int
    created_by: Optional[str] = None
    created_at: datetime
    transaction_date: datetime
    
    class Config:
        from_attributes = True


class BudgetBalances(BaseModel):
    """Current balances for both accounts"""
    monthly_profit: float
    overall_capital: float
    last_updated: datetime


class BudgetTransactionSummary(BaseModel):
    """Summary of budget transactions"""
    total_additions: float
    total_withdrawals: float
    net_change: float
    transaction_count: int

# Made with Bob