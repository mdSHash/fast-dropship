from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base


class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    email = Column(String, nullable=True, unique=True, index=True)  # Email address
    phone = Column(String, nullable=False)
    location = Column(String, nullable=False)
    notes = Column(Text, nullable=True)  # For the chat/notes feature
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)  # User who created this client
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    orders = relationship("Order", back_populates="client", cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])

# Made with Bob
