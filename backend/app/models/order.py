from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"


class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    order_name = Column(String, nullable=False)
    order_link = Column(String, nullable=True)
    quantity = Column(Integer, nullable=False)
    cost = Column(Float, nullable=False)  # Cost to purchase/produce the order
    customer_price = Column(Float, nullable=False)  # Price charged to customer
    taxes = Column(Float, default=0.0, nullable=False)  # Taxes/fees
    profit = Column(Float, nullable=True)  # Calculated: customer_price - cost - taxes
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # User who created this order
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # User assigned to handle this order
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    client = relationship("Client", back_populates="orders")
    delivery = relationship("Delivery", back_populates="order", uselist=False, cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    
    def calculate_profit(self):
        """Calculate profit: customer_price - cost - taxes"""
        self.profit = self.customer_price - self.cost - self.taxes
        return self.profit

# Made with Bob
