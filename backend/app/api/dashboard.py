from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from datetime import datetime

from ..core import get_db
from ..models import Client, Order, User, OrderStatus, MonthlyFinancials, UserRole
from ..schemas import DashboardData, DashboardStats, ChartData, MonthlyData, RecentClient, RecentOrder
from .auth import get_current_user, get_user_filter
from .financials import get_or_create_current_month

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardData)
async def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all dashboard data including stats, charts, and recent items"""
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    
    # Calculate financial stats based on user role
    if current_user.role == UserRole.ADMIN:  # type: ignore
        # Admin sees system-wide MonthlyFinancials
        financials = get_or_create_current_month(db)
        monthly_profit = float(financials.monthly_profit)  # type: ignore
        monthly_revenue = float(financials.monthly_revenue)  # type: ignore
        overall_capital = float(financials.overall_capital)  # type: ignore
    else:
        # Regular users see their own calculated financials
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        # Calculate from user's completed orders this month
        user_orders = db.query(Order).filter(
            Order.created_by == user_filter,
            Order.status == OrderStatus.COMPLETED,
            func.extract('month', Order.completed_at) == current_month,
            func.extract('year', Order.completed_at) == current_year
        ).all()
        
        monthly_profit = sum(order.profit or 0 for order in user_orders)
        monthly_revenue = sum(order.customer_price * order.quantity for order in user_orders)
        
        # Calculate overall capital from all completed orders
        all_user_orders = db.query(Order).filter(
            Order.created_by == user_filter,
            Order.status == OrderStatus.COMPLETED
        ).all()
        overall_capital = sum(order.profit or 0 for order in all_user_orders)
    
    # Count clients
    client_query = db.query(func.count(Client.id))
    if user_filter is not None:
        client_query = client_query.filter(Client.created_by == user_filter)
    total_clients = client_query.scalar() or 0
    
    # Count ongoing orders
    order_query = db.query(func.count(Order.id)).filter(Order.status == OrderStatus.PENDING)
    if user_filter is not None:
        # Include orders created by user OR assigned to user
        order_query = order_query.filter(
            or_(
                Order.created_by == user_filter,
                Order.assigned_to == user_filter
            )
        )
    ongoing_orders = order_query.scalar() or 0
    
    stats = DashboardStats(
        monthly_profit=monthly_profit,
        monthly_revenue=monthly_revenue,
        overall_capital=overall_capital,
        total_clients=total_clients,
        ongoing_orders=ongoing_orders
    )
    
    # Get monthly data for charts (last 12 months)
    current_year = datetime.now().year
    monthly_records = db.query(MonthlyFinancials).filter(
        MonthlyFinancials.year == current_year
    ).order_by(MonthlyFinancials.month).all()
    
    # Create monthly data for all 12 months
    monthly_data = []
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    for month_num in range(1, 13):
        record = next((r for r in monthly_records if r.month == month_num), None)  # type: ignore
        monthly_data.append(MonthlyData(
            month=month_names[month_num - 1],
            pv=record.monthly_revenue if record else 0.0,  # type: ignore
            uv=record.monthly_profit if record else 0.0  # type: ignore
        ))
    
    chart_data = ChartData(monthly_data=monthly_data)
    
    # Get recent clients
    recent_clients_query = db.query(Client)
    if user_filter is not None:
        recent_clients_query = recent_clients_query.filter(Client.created_by == user_filter)
    recent_clients_query = recent_clients_query.order_by(Client.created_at.desc()).limit(10).all()
    recent_clients = [
        RecentClient(
            id=client.id,  # type: ignore
            name=client.name,  # type: ignore
            phone=client.phone,  # type: ignore
            location=client.location  # type: ignore
        )
        for client in recent_clients_query
    ]
    
    # Get recent orders
    recent_orders_query = db.query(Order)
    if user_filter is not None:
        # Include orders created by user OR assigned to user
        recent_orders_query = recent_orders_query.filter(
            or_(
                Order.created_by == user_filter,
                Order.assigned_to == user_filter
            )
        )
    recent_orders_query = recent_orders_query.order_by(Order.created_at.desc()).limit(10).all()
    recent_orders = [
        RecentOrder(
            id=order.id,  # type: ignore
            order_name=order.order_name,  # type: ignore
            order_link=order.order_link or "",  # type: ignore
            quantity=order.quantity,  # type: ignore
            cost=order.cost,  # type: ignore
            customer_price=order.customer_price,  # type: ignore
            taxes=order.taxes,  # type: ignore
            profit=order.profit or 0.0  # type: ignore
        )
        for order in recent_orders_query
    ]
    
    return DashboardData(
        stats=stats,
        chart_data=chart_data,
        recent_clients=recent_clients,
        recent_orders=recent_orders
    )


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics only"""
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    
    # Calculate financial stats based on user role
    if current_user.role == UserRole.ADMIN:  # type: ignore
        # Admin sees system-wide MonthlyFinancials
        financials = get_or_create_current_month(db)
        monthly_profit = float(financials.monthly_profit)  # type: ignore
        monthly_revenue = float(financials.monthly_revenue)  # type: ignore
        overall_capital = float(financials.overall_capital)  # type: ignore
    else:
        # Regular users see their own calculated financials
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        # Calculate from user's completed orders this month
        user_orders = db.query(Order).filter(
            Order.created_by == user_filter,
            Order.status == OrderStatus.COMPLETED,
            func.extract('month', Order.completed_at) == current_month,
            func.extract('year', Order.completed_at) == current_year
        ).all()
        
        monthly_profit = sum(order.profit or 0 for order in user_orders)
        monthly_revenue = sum(order.customer_price * order.quantity for order in user_orders)
        
        # Calculate overall capital from all completed orders
        all_user_orders = db.query(Order).filter(
            Order.created_by == user_filter,
            Order.status == OrderStatus.COMPLETED
        ).all()
        overall_capital = sum(order.profit or 0 for order in all_user_orders)
    
    # Count clients
    client_query = db.query(func.count(Client.id))
    if user_filter is not None:
        client_query = client_query.filter(Client.created_by == user_filter)
    total_clients = client_query.scalar() or 0
    
    # Count ongoing orders
    order_query = db.query(func.count(Order.id)).filter(Order.status == OrderStatus.PENDING)
    if user_filter is not None:
        # Include orders created by user OR assigned to user
        order_query = order_query.filter(
            or_(
                Order.created_by == user_filter,
                Order.assigned_to == user_filter
            )
        )
    ongoing_orders = order_query.scalar() or 0
    
    return DashboardStats(
        monthly_profit=monthly_profit,
        monthly_revenue=monthly_revenue,
        overall_capital=overall_capital,
        total_clients=total_clients,
        ongoing_orders=ongoing_orders
    )

# Made with Bob
