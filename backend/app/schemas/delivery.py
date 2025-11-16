from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from ..models.delivery import DeliveryStatus


class DeliveryBase(BaseModel):
    order_id: int
    delivery_address: str
    tracking_number: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    notes: Optional[str] = None


class DeliveryCreate(DeliveryBase):
    pass


class DeliveryUpdate(BaseModel):
    delivery_address: Optional[str] = None
    tracking_number: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    status: Optional[DeliveryStatus] = None
    notes: Optional[str] = None


class DeliveryResponse(DeliveryBase):
    id: int
    status: DeliveryStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    created_by: Optional[int] = None
    created_by_username: Optional[str] = None
    
    class Config:
        from_attributes = True


class DeliveryWithOrder(DeliveryResponse):
    order_name: str
    client_name: str
    client_phone: str

# Made with Bob
