from pydantic import BaseModel
from typing import List, Dict


class DashboardStats(BaseModel):
    monthly_profit: float  # Current month's profit
    monthly_revenue: float  # Current month's revenue
    overall_capital: float  # Persistent capital
    total_clients: int
    ongoing_orders: int


class MonthlyData(BaseModel):
    month: str
    pv: float  # Revenue/Income
    uv: float  # Expenses


class ChartData(BaseModel):
    monthly_data: List[MonthlyData]


class RecentClient(BaseModel):
    id: int
    name: str
    phone: str
    location: str


class RecentOrder(BaseModel):
    id: int
    order_name: str
    order_link: str
    quantity: int
    cost: float
    customer_price: float
    taxes: float
    profit: float


class DashboardData(BaseModel):
    stats: DashboardStats
    chart_data: ChartData
    recent_clients: List[RecentClient]
    recent_orders: List[RecentOrder]

# Made with Bob
