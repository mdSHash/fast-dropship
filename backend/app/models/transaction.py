from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base


class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"


class TransactionCategory(str, enum.Enum):
    ORDER_PAYMENT = "order_payment"
    DELIVERY_COST = "delivery_cost"
    PRODUCT_COST = "product_cost"
    OPERATIONAL = "operational"
    OTHER = "other"


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(SQLEnum(TransactionType), nullable=False)
    category = Column(SQLEnum(TransactionCategory), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    reference_id = Column(String, nullable=True)  # Can link to order_id or other references
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    transaction_date = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])

# Made with Bob
