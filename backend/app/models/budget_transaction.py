from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SQLEnum, Text
from sqlalchemy.sql import func
import enum
from ..core.database import Base


class BudgetTransactionType(str, enum.Enum):
    ADDITION = "addition"
    WITHDRAWAL = "withdrawal"


class BudgetAccount(str, enum.Enum):
    MONTHLY_PROFIT = "monthly_profit"
    OVERALL_CAPITAL = "overall_capital"


class BudgetTransaction(Base):
    __tablename__ = "budget_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(SQLEnum(BudgetTransactionType), nullable=False)  # addition or withdrawal
    account = Column(SQLEnum(BudgetAccount), nullable=False)  # which account
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    reference_id = Column(String, nullable=True)  # Optional reference to order or other entity
    created_by = Column(String, nullable=True)  # User who created the transaction
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    transaction_date = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<BudgetTransaction {self.type} {self.amount} to {self.account}>"

# Made with Bob