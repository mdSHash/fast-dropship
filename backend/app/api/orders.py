from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from ..core import get_db
from ..models import Order, Client, User, OrderStatus, MonthlyFinancials, UserRole
from ..schemas import OrderCreate, OrderUpdate, OrderResponse, OrderWithClient
from .auth import get_current_user, get_user_filter
from .financials import get_or_create_current_month

router = APIRouter(prefix="/orders", tags=["Orders"])


def build_order_dict(order, client_name, client_phone, client_location, client_email=None, created_by_username=None, assigned_to_username=None):
    """Helper function to build order dictionary with all fields"""
    return {
        "id": order.id,
        "client_id": order.client_id,
        "order_name": order.order_name,
        "order_link": order.order_link or "",
        "quantity": order.quantity,
        "cost": order.cost,
        "customer_price": order.customer_price,
        "taxes": order.taxes,
        "profit": order.profit,
        "status": order.status,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "completed_at": order.completed_at,
        "created_by": order.created_by,
        "created_by_username": created_by_username,
        "assigned_to": order.assigned_to,
        "assigned_to_username": assigned_to_username,
        "client_name": client_name,
        "client_phone": client_phone,
        "client_location": client_location,
        "client_email": client_email
    }


@router.get("/", response_model=List[OrderWithClient])
async def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status_filter: Optional[OrderStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all orders with optional status filter"""
    # Create aliases for the User table to join twice
    CreatorUser = db.query(User).subquery()
    AssignedUser = db.query(User).subquery()
    
    query = db.query(
        Order,
        Client.name.label("client_name"),
        Client.phone.label("client_phone"),
        Client.location.label("client_location"),
        Client.email.label("client_email"),
        CreatorUser.c.username.label("created_by_username"),
        AssignedUser.c.username.label("assigned_to_username")
    ).join(Client, Order.client_id == Client.id
    ).outerjoin(CreatorUser, Order.created_by == CreatorUser.c.id
    ).outerjoin(AssignedUser, Order.assigned_to == AssignedUser.c.id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        # Regular users see orders they created OR orders assigned to them
        from sqlalchemy import or_
        query = query.filter(
            or_(
                Order.created_by == user_filter,
                Order.assigned_to == user_filter
            )
        )
    
    if status_filter:
        query = query.filter(Order.status == status_filter)
    
    results = query.offset(skip).limit(limit).all()
    
    orders = []
    for order, client_name, client_phone, client_location, client_email, created_by_username, assigned_to_username in results:
        orders.append(build_order_dict(order, client_name, client_phone, client_location, client_email, created_by_username, assigned_to_username))
    
    return orders


@router.get("/pending", response_model=List[OrderWithClient])
async def get_pending_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all pending orders"""
    # Create aliases for the User table to join twice
    CreatorUser = db.query(User).subquery()
    AssignedUser = db.query(User).subquery()
    
    query = db.query(
        Order,
        Client.name.label("client_name"),
        Client.phone.label("client_phone"),
        Client.location.label("client_location"),
        Client.email.label("client_email"),
        CreatorUser.c.username.label("created_by_username"),
        AssignedUser.c.username.label("assigned_to_username")
    ).join(Client, Order.client_id == Client.id
    ).outerjoin(CreatorUser, Order.created_by == CreatorUser.c.id
    ).outerjoin(AssignedUser, Order.assigned_to == AssignedUser.c.id
    ).filter(Order.status == OrderStatus.PENDING)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        # Regular users see orders they created OR orders assigned to them
        from sqlalchemy import or_
        query = query.filter(
            or_(
                Order.created_by == user_filter,
                Order.assigned_to == user_filter
            )
        )
    
    results = query.offset(skip).limit(limit).all()
    
    orders = []
    for order, client_name, client_phone, client_location, client_email, created_by_username, assigned_to_username in results:
        orders.append(build_order_dict(order, client_name, client_phone, client_location, client_email, created_by_username, assigned_to_username))
    
    return orders


@router.get("/completed", response_model=List[OrderWithClient])
async def get_completed_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all completed orders"""
    # Create aliases for the User table to join twice
    CreatorUser = db.query(User).subquery()
    AssignedUser = db.query(User).subquery()
    
    query = db.query(
        Order,
        Client.name.label("client_name"),
        Client.phone.label("client_phone"),
        Client.location.label("client_location"),
        Client.email.label("client_email"),
        CreatorUser.c.username.label("created_by_username"),
        AssignedUser.c.username.label("assigned_to_username")
    ).join(Client, Order.client_id == Client.id
    ).outerjoin(CreatorUser, Order.created_by == CreatorUser.c.id
    ).outerjoin(AssignedUser, Order.assigned_to == AssignedUser.c.id
    ).filter(Order.status == OrderStatus.COMPLETED)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        # Regular users see orders they created OR orders assigned to them
        from sqlalchemy import or_
        query = query.filter(
            or_(
                Order.created_by == user_filter,
                Order.assigned_to == user_filter
            )
        )
    
    results = query.offset(skip).limit(limit).all()
    
    orders = []
    for order, client_name, client_phone, client_location, client_email, created_by_username, assigned_to_username in results:
        orders.append(build_order_dict(order, client_name, client_phone, client_location, client_email, created_by_username, assigned_to_username))
    
    return orders


@router.get("/recent/list", response_model=List[OrderResponse])
async def get_recent_orders(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get most recent orders"""
    query = db.query(Order)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        # Regular users see orders they created OR orders assigned to them
        from sqlalchemy import or_
        query = query.filter(
            or_(
                Order.created_by == user_filter,
                Order.assigned_to == user_filter
            )
        )
    
    orders = query.order_by(Order.created_at.desc()).limit(limit).all()
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific order by ID"""
    query = db.query(Order).filter(Order.id == order_id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        # Regular users see orders they created OR orders assigned to them
        from sqlalchemy import or_
        query = query.filter(
            or_(
                Order.created_by == user_filter,
                Order.assigned_to == user_filter
            )
        )
    
    order = query.first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new order
    - Calculates profit automatically
    - Deducts cost from overall capital
    """
    # Verify client exists and user has access to it
    client_query = db.query(Client).filter(Client.id == order_data.client_id)
    
    # Apply role-based filtering for client access
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        client_query = client_query.filter(Client.created_by == user_filter)
    
    client = client_query.first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found or you don't have access to it"
        )
    
    # Create order with created_by field
    order_dict = order_data.model_dump()
    order_dict['created_by'] = current_user.id
    new_order = Order(**order_dict)
    
    # Calculate profit
    new_order.calculate_profit()
    
    # Get current month's financials
    financials = get_or_create_current_month(db)
    
    # Deduct cost from overall capital
    if financials.overall_capital < new_order.cost:  # type: ignore
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient capital. Available: ${financials.overall_capital:.2f}, Required: ${new_order.cost:.2f}"
        )
    
    financials.overall_capital -= new_order.cost  # type: ignore
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    db.refresh(financials)
    
    return new_order


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_data: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an order
    - Recalculates profit if cost, customer_price, or taxes change
    - Updates monthly financials when order is completed
    """
    query = db.query(Order).filter(Order.id == order_id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Order.created_by == user_filter)
    
    order = query.first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Store old status
    old_status = order.status
    
    # Update only provided fields
    update_data = order_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(order, field, value)
    
    # Recalculate profit if financial fields changed
    if any(field in update_data for field in ['cost', 'customer_price', 'taxes']):
        order.calculate_profit()
    
    # If status is being changed to completed
    if "status" in update_data and update_data["status"] == OrderStatus.COMPLETED and old_status != OrderStatus.COMPLETED:  # type: ignore
        order.completed_at = datetime.utcnow()  # type: ignore
        
        # Update monthly financials
        financials = get_or_create_current_month(db)
        financials.monthly_revenue += order.customer_price  # type: ignore
        financials.monthly_profit += order.profit  # type: ignore
    
    db.commit()
    db.refresh(order)
    
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an order"""
    query = db.query(Order).filter(Order.id == order_id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        # Regular users can delete orders they created OR orders assigned to them
        from sqlalchemy import or_
        query = query.filter(
            or_(
                Order.created_by == user_filter,
                Order.assigned_to == user_filter
            )
        )
    
    order = query.first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    db.delete(order)
    db.commit()
    
    return None

# Made with Bob
