from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import re

from ..core import get_db
from ..models import Client, User, UserRole
from ..schemas import ClientCreate, ClientUpdate, ClientResponse
from .auth import get_current_user, get_user_filter

router = APIRouter(prefix="/clients", tags=["Clients"])


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


@router.get("/", response_model=List[ClientResponse])
async def get_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all clients with optional search"""
    query = db.query(Client)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Client.created_by == user_filter)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Client.name.ilike(search_filter)) |
            (Client.email.ilike(search_filter)) |
            (Client.phone.ilike(search_filter)) |
            (Client.location.ilike(search_filter))
        )
    
    clients = query.offset(skip).limit(limit).all()
    return clients


@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific client by ID"""
    query = db.query(Client).filter(Client.id == client_id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Client.created_by == user_filter)
    
    client = query.first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    return client


@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    client_data: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new client"""
    # Validate email if provided
    if client_data.email:
        if not validate_email(client_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Check if email already exists
        existing_client = db.query(Client).filter(Client.email == client_data.email).first()
        if existing_client:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
    
    # Create client with created_by field
    client_dict = client_data.model_dump()
    client_dict['created_by'] = current_user.id
    new_client = Client(**client_dict)
    
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    
    return new_client


@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: int,
    client_data: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a client"""
    query = db.query(Client).filter(Client.id == client_id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Client.created_by == user_filter)
    
    client = query.first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    # Update only provided fields
    update_data = client_data.model_dump(exclude_unset=True)
    
    # Validate email if being updated
    if "email" in update_data and update_data["email"]:
        if not validate_email(update_data["email"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Check if email already exists (excluding current client)
        existing_client = db.query(Client).filter(
            Client.email == update_data["email"],
            Client.id != client_id
        ).first()
        if existing_client:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
    
    for field, value in update_data.items():
        setattr(client, field, value)
    
    db.commit()
    db.refresh(client)
    
    return client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a client"""
    query = db.query(Client).filter(Client.id == client_id)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Client.created_by == user_filter)
    
    client = query.first()
    
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )
    
    db.delete(client)
    db.commit()
    
    return None


@router.get("/recent/list", response_model=List[ClientResponse])
async def get_recent_clients(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get most recent clients"""
    query = db.query(Client)
    
    # Apply role-based filtering
    user_filter = get_user_filter(current_user)
    if user_filter is not None:
        query = query.filter(Client.created_by == user_filter)
    
    clients = query.order_by(Client.created_at.desc()).limit(limit).all()
    return clients

# Made with Bob
