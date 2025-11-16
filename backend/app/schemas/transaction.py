from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from ..models.transaction import TransactionType, TransactionCategory


class TransactionBase(BaseModel):
    type: TransactionType
    category: TransactionCategory
    amount: float
    description: Optional[str] = None
    reference_id: Optional[str] = None


class TransactionCreate(TransactionBase):
    transaction_date: Optional[datetime] = None


class TransactionUpdate(BaseModel):
    type: Optional[TransactionType] = None
    category: Optional[TransactionCategory] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    reference_id: Optional[str] = None


class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    transaction_date: datetime
    created_by: Optional[int] = None
    created_by_username: Optional[str] = None
    
    class Config:
        from_attributes = True

# Made with Bob
