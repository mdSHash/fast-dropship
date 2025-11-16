from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..core import get_db
from ..models import Delivery, Order, Client, User, DeliveryStatus
from ..schemas import DeliveryCreate, DeliveryUpdate, DeliveryResponse, DeliveryWithOrder
from .auth import get_current_user, get_user_filter

router = APIRouter(prefix="/deliveries", tags=["Deliveries"])


@router.get("/", response_model=List[DeliveryWithOrder])
async def get_deliveries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status_filter: Optional[DeliveryStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all deliveries with optional status filter"""
    query = db.query(
        Delivery,
        Order.order_name.label("order_name"),
        Client.name.label("client_name"),
        Client.phone.label("client_phone"),
        User.username.label("created_by_username")
    ).join(Order, Delivery.order_id == Order.id).join(Client, Order.client_id == Client.id).outerjoin(User, Delivery.created_by == User.id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Delivery.created_by == user_filter)
    
    if status_filter:
        query = query.filter(Delivery.status == status_filter)
    
    results = query.offset(skip).limit(limit).all()
    
    deliveries = []
    for delivery, order_name, client_name, client_phone, created_by_username in results:
        delivery_dict = {
            "id": delivery.id,
            "order_id": delivery.order_id,
            "delivery_address": delivery.delivery_address,
            "tracking_number": delivery.tracking_number,
            "driver_name": delivery.driver_name,
            "driver_phone": delivery.driver_phone,
            "notes": delivery.notes,
            "status": delivery.status,
            "created_at": delivery.created_at,
            "updated_at": delivery.updated_at,
            "delivered_at": delivery.delivered_at,
            "created_by": delivery.created_by,
            "created_by_username": created_by_username,
            "order_name": order_name,
            "client_name": client_name,
            "client_phone": client_phone
        }
        deliveries.append(delivery_dict)
    
    return deliveries


@router.get("/{delivery_id}", response_model=DeliveryResponse)
async def get_delivery(
    delivery_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific delivery by ID"""
    query = db.query(Delivery).filter(Delivery.id == delivery_id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Delivery.created_by == user_filter)
    
    delivery = query.first()
    
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found"
        )
    
    return delivery


@router.get("/order/{order_id}", response_model=DeliveryResponse)
async def get_delivery_by_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get delivery for a specific order"""
    query = db.query(Delivery).filter(Delivery.order_id == order_id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Delivery.created_by == user_filter)
    
    delivery = query.first()
    
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found for this order"
        )
    
    return delivery


@router.post("/", response_model=DeliveryResponse, status_code=status.HTTP_201_CREATED)
async def create_delivery(
    delivery_data: DeliveryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new delivery"""
    # Verify order exists and user has access to it
    order_query = db.query(Order).filter(Order.id == delivery_data.order_id)
    
    # Apply role-based filtering for order access
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        order_query = order_query.filter(Order.created_by == user_filter)
    
    order = order_query.first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if delivery already exists for this order
    existing_delivery = db.query(Delivery).filter(Delivery.order_id == delivery_data.order_id).first()
    if existing_delivery:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Delivery already exists for this order"
        )
    
    new_delivery = Delivery(**delivery_data.model_dump(), created_by=current_user.id)
    
    db.add(new_delivery)
    db.commit()
    db.refresh(new_delivery)
    
    return new_delivery


@router.put("/{delivery_id}", response_model=DeliveryResponse)
async def update_delivery(
    delivery_id: int,
    delivery_data: DeliveryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a delivery"""
    query = db.query(Delivery).filter(Delivery.id == delivery_id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Delivery.created_by == user_filter)
    
    delivery = query.first()
    
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found"
        )
    
    # Update only provided fields
    update_data = delivery_data.model_dump(exclude_unset=True)
    
    # If status is being changed to delivered, set delivered_at
    if "status" in update_data and update_data["status"] == DeliveryStatus.DELIVERED:
        update_data["delivered_at"] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(delivery, field, value)
    
    db.commit()
    db.refresh(delivery)
    
    return delivery


@router.delete("/{delivery_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_delivery(
    delivery_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a delivery"""
    query = db.query(Delivery).filter(Delivery.id == delivery_id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Delivery.created_by == user_filter)
    
    delivery = query.first()
    
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery not found"
        )
    
    db.delete(delivery)
    db.commit()
    
    return None

# Made with Bob
