from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import datetime, date

from ..core import get_db
from ..models import MonthlyFinancials, User, Order, OrderStatus, UserRole
from ..schemas import (
    MonthlyFinancialsCreate,
    MonthlyFinancialsUpdate,
    MonthlyFinancialsResponse,
    CurrentFinancials,
    FinancialSummary
)
from .auth import get_current_user, get_user_filter

router = APIRouter(prefix="/financials", tags=["Monthly Financials"])


def get_or_create_current_month(db: Session) -> MonthlyFinancials:
    """Get or create the current month's financial record"""
    now = datetime.now()
    current_year = now.year
    current_month = now.month
    
    financials = db.query(MonthlyFinancials).filter(
        MonthlyFinancials.year == current_year,
        MonthlyFinancials.month == current_month
    ).first()
    
    if not financials:
        # Get previous month's capital
        if current_month == 1:
            prev_year = current_year - 1
            prev_month = 12
        else:
            prev_year = current_year
            prev_month = current_month - 1
        
        prev_financials = db.query(MonthlyFinancials).filter(
            MonthlyFinancials.year == prev_year,
            MonthlyFinancials.month == prev_month
        ).first()
        
        starting_capital = prev_financials.overall_capital if prev_financials else 0.0
        
        financials = MonthlyFinancials(
            year=current_year,
            month=current_month,
            monthly_profit=0.0,
            monthly_revenue=0.0,
            overall_capital=starting_capital
        )
        db.add(financials)
        db.commit()
        db.refresh(financials)
    
    return financials


@router.get("/current", response_model=CurrentFinancials)
async def get_current_financials(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current month's financial data"""
    # For admin, return system-wide financials
    if str(current_user.role) == str(UserRole.ADMIN):
        financials = get_or_create_current_month(db)
        
        return CurrentFinancials(
            monthly_profit=financials.monthly_profit,  # type: ignore
            monthly_revenue=financials.monthly_revenue,  # type: ignore
            overall_capital=financials.overall_capital,  # type: ignore
            year=financials.year,  # type: ignore
            month=financials.month  # type: ignore
        )
    
    # For regular users, calculate from their orders
    now = datetime.now()
    current_year = now.year
    current_month = now.month
    
    # Calculate user's monthly profit from completed orders
    user_orders = db.query(Order).filter(
        Order.created_by == current_user.id,
        Order.status == OrderStatus.COMPLETED,
        extract('year', Order.updated_at) == current_year,
        extract('month', Order.updated_at) == current_month
    ).all()
    
    monthly_profit = sum(float(order.profit) for order in user_orders if order.profit is not None)  # type: ignore
    monthly_revenue = sum(float(order.price) for order in user_orders if order.price is not None)  # type: ignore
    
    # Calculate overall capital from all completed orders
    all_completed = db.query(Order).filter(
        Order.created_by == current_user.id,
        Order.status == OrderStatus.COMPLETED
    ).all()
    
    overall_capital = sum(float(order.profit) for order in all_completed if order.profit is not None)  # type: ignore
    
    return CurrentFinancials(
        monthly_profit=monthly_profit,
        monthly_revenue=monthly_revenue,
        overall_capital=overall_capital,
        year=current_year,
        month=current_month
    )


@router.get("/summary", response_model=FinancialSummary)
async def get_financial_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get complete financial summary including YTD data"""
    # For admin, return system-wide financials
    if str(current_user.role) == str(UserRole.ADMIN):
        current = get_or_create_current_month(db)
        
        # Get previous month
        if current.month == 1:  # type: ignore
            prev_year = current.year - 1
            prev_month = 12
        else:
            prev_year = current.year
            prev_month = current.month - 1
        
        previous = db.query(MonthlyFinancials).filter(
            MonthlyFinancials.year == prev_year,
            MonthlyFinancials.month == prev_month
        ).first()
        
        # Calculate year-to-date
        ytd_records = db.query(MonthlyFinancials).filter(
            MonthlyFinancials.year == current.year,
            MonthlyFinancials.month <= current.month
        ).all()
        
        ytd_profit = sum(record.monthly_profit for record in ytd_records)
        ytd_revenue = sum(record.monthly_revenue for record in ytd_records)
        
        return FinancialSummary(
            current_month=CurrentFinancials(
                monthly_profit=current.monthly_profit,  # type: ignore
                monthly_revenue=current.monthly_revenue,  # type: ignore
                overall_capital=current.overall_capital,  # type: ignore
                year=current.year,  # type: ignore
                month=current.month  # type: ignore
            ),
            previous_month=previous,
            year_to_date_profit=ytd_profit,  # type: ignore
            year_to_date_revenue=ytd_revenue  # type: ignore
        )
    
    # For regular users, calculate from their orders
    now = datetime.now()
    current_year = now.year
    current_month = now.month
    
    # Current month
    current_orders = db.query(Order).filter(
        Order.created_by == current_user.id,
        Order.status == OrderStatus.COMPLETED,
        extract('year', Order.updated_at) == current_year,
        extract('month', Order.updated_at) == current_month
    ).all()
    
    monthly_profit = sum(float(order.profit) for order in current_orders if order.profit is not None)  # type: ignore
    monthly_revenue = sum(float(order.price) for order in current_orders if order.price is not None)  # type: ignore
    
    # Previous month
    if current_month == 1:
        prev_year = current_year - 1
        prev_month = 12
    else:
        prev_year = current_year
        prev_month = current_month - 1
    
    prev_orders = db.query(Order).filter(
        Order.created_by == current_user.id,
        Order.status == OrderStatus.COMPLETED,
        extract('year', Order.updated_at) == prev_year,
        extract('month', Order.updated_at) == prev_month
    ).all()
    
    prev_profit = sum(float(order.profit) for order in prev_orders if order.profit is not None)  # type: ignore
    prev_revenue = sum(float(order.price) for order in prev_orders if order.price is not None)  # type: ignore
    
    # Year-to-date
    ytd_orders = db.query(Order).filter(
        Order.created_by == current_user.id,
        Order.status == OrderStatus.COMPLETED,
        extract('year', Order.updated_at) == current_year
    ).all()
    
    ytd_profit = sum(float(order.profit) for order in ytd_orders if order.profit is not None)  # type: ignore
    ytd_revenue = sum(float(order.price) for order in ytd_orders if order.price is not None)  # type: ignore
    
    # Overall capital
    all_completed = db.query(Order).filter(
        Order.created_by == current_user.id,
        Order.status == OrderStatus.COMPLETED
    ).all()
    
    overall_capital = sum(float(order.profit) for order in all_completed if order.profit is not None)  # type: ignore
    
    return FinancialSummary(
        current_month=CurrentFinancials(
            monthly_profit=monthly_profit,
            monthly_revenue=monthly_revenue,
            overall_capital=overall_capital,
            year=current_year,
            month=current_month
        ),
        previous_month=None,  # Not tracking historical monthly records for users
        year_to_date_profit=ytd_profit,
        year_to_date_revenue=ytd_revenue
    )


@router.get("/history", response_model=List[MonthlyFinancialsResponse])
async def get_financial_history(
    year: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get historical financial data (admin only - returns system-wide data)"""
    # Only admins can view historical monthly financials
    if str(current_user.role) != str(UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view historical financial records"
        )
    
    query = db.query(MonthlyFinancials)
    
    if year:
        query = query.filter(MonthlyFinancials.year == year)
    
    financials = query.order_by(
        MonthlyFinancials.year.desc(),
        MonthlyFinancials.month.desc()
    ).offset(skip).limit(limit).all()
    
    return financials


@router.get("/{year}/{month}", response_model=MonthlyFinancialsResponse)
async def get_specific_month(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific month's financial data (admin only)"""
    # Only admins can view specific monthly financials
    if str(current_user.role) != str(UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view monthly financial records"
        )
    
    if month < 1 or month > 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Month must be between 1 and 12"
        )
    
    financials = db.query(MonthlyFinancials).filter(
        MonthlyFinancials.year == year,
        MonthlyFinancials.month == month
    ).first()
    
    if not financials:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No financial data found for {year}-{month:02d}"
        )
    
    return financials


@router.post("/reset", response_model=MonthlyFinancialsResponse)
async def reset_monthly_financials(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manually trigger monthly reset (admin only)
    This should normally be done automatically via scheduled task
    """
    # Only admins can reset monthly financials
    if str(current_user.role) != str(UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can reset monthly financials"
        )
    
    current = get_or_create_current_month(db)
    
    # Add monthly profit to overall capital
    current.overall_capital += current.monthly_profit  # type: ignore
    current.reset_at = datetime.now()  # type: ignore
    
    # Create next month's record
    now = datetime.now()
    if now.month == 12:
        next_year = now.year + 1
        next_month = 1
    else:
        next_year = now.year
        next_month = now.month + 1
    
    # Check if next month already exists
    next_financials = db.query(MonthlyFinancials).filter(
        MonthlyFinancials.year == next_year,
        MonthlyFinancials.month == next_month
    ).first()
    
    if not next_financials:
        next_financials = MonthlyFinancials(
            year=next_year,
            month=next_month,
            monthly_profit=0.0,
            monthly_revenue=0.0,
            overall_capital=current.overall_capital
        )
        db.add(next_financials)
    
    db.commit()
    db.refresh(current)
    
    return current


@router.put("/adjust", response_model=MonthlyFinancialsResponse)
async def adjust_financials(
    adjustment: MonthlyFinancialsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually adjust current month's financials (admin only)"""
    # Only admins can adjust financials
    if str(current_user.role) != str(UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can adjust financials"
        )
    
    financials = get_or_create_current_month(db)
    
    update_data = adjustment.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(financials, field, value)
    
    db.commit()
    db.refresh(financials)
    
    return financials

# Made with Bob