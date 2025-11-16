from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ClientBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: str
    location: str
    notes: Optional[str] = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class ClientResponse(ClientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Made with Bob
