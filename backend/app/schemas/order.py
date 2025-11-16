from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from ..models.order import OrderStatus


class OrderBase(BaseModel):
    client_id: int
    order_name: str
    order_link: Optional[str] = None
    quantity: int
    cost: float  # Cost to purchase/produce
    customer_price: float  # Price charged to customer
    taxes: float = 0.0  # Taxes and fees


class OrderCreate(OrderBase):
    assigned_to: Optional[int] = None  # Optional user assignment


class OrderUpdate(BaseModel):
    order_name: Optional[str] = None
    order_link: Optional[str] = None
    quantity: Optional[int] = None
    cost: Optional[float] = None
    customer_price: Optional[float] = None
    taxes: Optional[float] = None
    status: Optional[OrderStatus] = None


class OrderResponse(OrderBase):
    id: int
    profit: Optional[float] = None  # Calculated: customer_price - cost - taxes
    status: OrderStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_by: Optional[int] = None
    created_by_username: Optional[str] = None
    assigned_to: Optional[int] = None
    assigned_to_username: Optional[str] = None
    
    class Config:
        from_attributes = True


class OrderWithClient(OrderResponse):
    client_name: str
    client_phone: str
    client_location: str
    client_email: Optional[str] = None

# Made with Bob
