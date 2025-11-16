from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MonthlyFinancialsBase(BaseModel):
    year: int
    month: int  # 1-12
    monthly_profit: float = 0.0
    monthly_revenue: float = 0.0
    overall_capital: float = 0.0


class MonthlyFinancialsCreate(MonthlyFinancialsBase):
    pass


class MonthlyFinancialsUpdate(BaseModel):
    monthly_profit: Optional[float] = None
    monthly_revenue: Optional[float] = None
    overall_capital: Optional[float] = None


class MonthlyFinancialsResponse(MonthlyFinancialsBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    reset_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class CurrentFinancials(BaseModel):
    """Current month's financial summary"""
    monthly_profit: float
    monthly_revenue: float
    overall_capital: float
    year: int
    month: int


class FinancialSummary(BaseModel):
    """Complete financial summary for dashboard"""
    current_month: CurrentFinancials
    previous_month: Optional[MonthlyFinancialsResponse] = None
    year_to_date_profit: float
    year_to_date_revenue: float

# Made with Bob