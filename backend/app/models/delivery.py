from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base


class DeliveryStatus(str, enum.Enum):
    PENDING = "pending"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    FAILED = "failed"


class Delivery(Base):
    __tablename__ = "deliveries"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, unique=True)
    tracking_number = Column(String, nullable=True)
    delivery_address = Column(String, nullable=False)
    driver_name = Column(String, nullable=True)
    driver_phone = Column(String, nullable=True)
    status = Column(SQLEnum(DeliveryStatus), default=DeliveryStatus.PENDING, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    order = relationship("Order", back_populates="delivery")
    creator = relationship("User", foreign_keys=[created_by])

# Made with Bob
