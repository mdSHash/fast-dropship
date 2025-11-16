from sqlalchemy import Column, Integer, Float, DateTime, String
from sqlalchemy.sql import func
from ..core.database import Base


class MonthlyFinancials(Base):
    __tablename__ = "monthly_financials"
    
    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False, index=True)
    month = Column(Integer, nullable=False, index=True)  # 1-12
    monthly_profit = Column(Float, default=0.0, nullable=False)  # Resets each month
    monthly_revenue = Column(Float, default=0.0, nullable=False)  # Customer payments, resets each month
    overall_capital = Column(Float, default=0.0, nullable=False)  # Persists across months
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    reset_at = Column(DateTime(timezone=True), nullable=True)  # When monthly reset occurred
    
    def __repr__(self):
        return f"<MonthlyFinancials {self.year}-{self.month:02d}>"

# Made with Bob