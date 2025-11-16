"""
Database Seed Script for Fast-Dropship
Run this script to populate the database with sample data for testing
"""

from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models import (
    Base, User, Client, Order, OrderStatus, Transaction, TransactionType,
    TransactionCategory, Delivery, DeliveryStatus, MonthlyFinancials,
    BudgetTransaction, BudgetTransactionType, BudgetAccount, UserRole
)
from datetime import datetime, timedelta
import random

# Create tables
Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    
    try:
        print("🌱 Starting database seeding...")
        
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print("⚠️  Database already contains data. Skipping seed.")
            return
        
        # Create admin user
        print("👤 Creating admin user...")
        admin = User(
            username="admin",
            email="admin@fastdropship.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print("✅ Admin user created (email: admin@fastdropship.com, password: admin123, role: admin)")
        
        # Create sample clients with emails
        print("👥 Creating sample clients...")
        clients_data = [
            {"name": "John Smith", "email": "john.smith@example.com", "phone": "+1-555-0101", "location": "New York, NY", "notes": "Preferred customer, always pays on time"},
            {"name": "Sarah Johnson", "email": "sarah.j@example.com", "phone": "+1-555-0102", "location": "Los Angeles, CA", "notes": "Interested in bulk orders"},
            {"name": "Michael Brown", "email": "m.brown@example.com", "phone": "+1-555-0103", "location": "Chicago, IL", "notes": ""},
            {"name": "Emily Davis", "email": "emily.davis@example.com", "phone": "+1-555-0104", "location": "Houston, TX", "notes": "VIP customer"},
            {"name": "David Wilson", "email": "d.wilson@example.com", "phone": "+1-555-0105", "location": "Phoenix, AZ", "notes": ""},
            {"name": "Lisa Anderson", "email": "lisa.a@example.com", "phone": "+1-555-0106", "location": "Philadelphia, PA", "notes": "Prefers email communication"},
            {"name": "James Taylor", "email": "james.taylor@example.com", "phone": "+1-555-0107", "location": "San Antonio, TX", "notes": ""},
            {"name": "Jennifer Martinez", "email": "j.martinez@example.com", "phone": "+1-555-0108", "location": "San Diego, CA", "notes": "Regular customer since 2023"},
            {"name": "Robert Garcia", "email": "r.garcia@example.com", "phone": "+1-555-0109", "location": "Dallas, TX", "notes": ""},
            {"name": "Maria Rodriguez", "email": "maria.r@example.com", "phone": "+1-555-0110", "location": "San Jose, CA", "notes": "Wholesale buyer"},
        ]
        
        clients = []
        for client_data in clients_data:
            client = Client(**client_data, created_by=admin.id)
            db.add(client)
            clients.append(client)
        
        db.commit()
        print(f"✅ Created {len(clients)} sample clients")
        
        # Initialize MonthlyFinancials for current month
        print("💰 Initializing monthly financials...")
        now = datetime.now()
        current_financials = MonthlyFinancials(
            year=now.year,
            month=now.month,
            monthly_profit=0.0,
            monthly_revenue=0.0,
            overall_capital=10000.0  # Starting capital
        )
        db.add(current_financials)
        db.commit()
        print("✅ Created current month's financial record with $10,000 starting capital")
        
        # Create sample orders with new fields
        print("📦 Creating sample orders...")
        order_names = [
            "Summer T-Shirt Collection",
            "Winter Jacket - Premium",
            "Running Shoes - Sport Edition",
            "Casual Denim Jeans",
            "Leather Handbag",
            "Wireless Headphones",
            "Smart Watch Series 5",
            "Yoga Mat Set",
            "Coffee Maker Deluxe",
            "Backpack - Travel Edition",
        ]
        
        orders = []
        for i in range(20):
            client = random.choice(clients)
            
            # Generate realistic pricing
            cost = round(random.uniform(20, 300), 2)
            customer_price = round(cost * random.uniform(1.3, 2.0), 2)  # 30-100% markup
            taxes = round(customer_price * 0.08, 2)  # 8% tax
            
            order = Order(
                client_id=client.id,
                order_name=random.choice(order_names),
                order_link=f"https://example.com/product/{i+1}",
                quantity=random.randint(1, 10),
                cost=cost,
                customer_price=customer_price,
                taxes=taxes,
                status=random.choice([OrderStatus.PENDING, OrderStatus.COMPLETED]),
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 90)),
                created_by=admin.id
            )
            
            # Calculate profit
            order.calculate_profit()
            
            # Deduct cost from capital for all orders
            current_financials.overall_capital -= order.cost  # type: ignore
            
            # If completed, add to monthly revenue and profit
            if order.status == OrderStatus.COMPLETED:  # type: ignore
                order.completed_at = order.created_at + timedelta(days=random.randint(1, 7))  # type: ignore
                current_financials.monthly_revenue += order.customer_price  # type: ignore
                current_financials.monthly_profit += order.profit  # type: ignore
            
            db.add(order)
            orders.append(order)
        
        db.commit()
        print(f"✅ Created {len(orders)} sample orders")
        
        # Create sample deliveries
        print("🚚 Creating sample deliveries...")
        completed_orders = [o for o in orders if o.status == OrderStatus.COMPLETED]
        deliveries = []
        
        for i, order in enumerate(completed_orders[:15]):
            delivery = Delivery(
                order_id=order.id,
                tracking_number=f"TRACK{1000 + i}",
                delivery_address=order.client.location,  # Use client's location as delivery address
                status=random.choice([DeliveryStatus.PENDING, DeliveryStatus.IN_TRANSIT, DeliveryStatus.DELIVERED]),
                driver_name=random.choice(["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams"]),
                driver_phone=f"+1-555-{2000 + i}",
                created_at=order.completed_at
            )
            db.add(delivery)
            deliveries.append(delivery)
        
        db.commit()
        print(f"✅ Created {len(deliveries)} sample deliveries")
        
        # Create sample transactions
        print("💳 Creating sample transactions...")
        
        # Income transactions (from completed orders)
        for order in orders:
            if order.status == OrderStatus.COMPLETED:
                transaction = Transaction(
                    type=TransactionType.INCOME,
                    category=TransactionCategory.ORDER_PAYMENT,
                    amount=order.customer_price * order.quantity,
                    description=f"Payment for order: {order.order_name}",
                    reference_id=str(order.id),
                    transaction_date=order.completed_at or order.created_at
                )
                db.add(transaction)
        
        # Expense transactions
        expense_categories = [
            (TransactionCategory.PRODUCT_COST, "Product purchase from supplier"),
            (TransactionCategory.DELIVERY_COST, "Shipping and delivery fees"),
            (TransactionCategory.OPERATIONAL, "Office supplies and utilities"),
            (TransactionCategory.OTHER, "Marketing and advertising"),
        ]
        
        for i in range(15):
            category, desc = random.choice(expense_categories)
            transaction = Transaction(
                type=TransactionType.EXPENSE,
                category=category,
                amount=round(random.uniform(50, 300), 2),
                description=desc,
                transaction_date=datetime.utcnow() - timedelta(days=random.randint(0, 90))
            )
            db.add(transaction)
        
        db.commit()
        print("✅ Created sample transactions")
        
        # Create sample budget transactions
        print("💼 Creating sample budget transactions...")
        budget_transactions = [
            BudgetTransaction(
                type=BudgetTransactionType.ADDITION,
                account=BudgetAccount.OVERALL_CAPITAL,
                amount=10000.0,
                description="Initial capital investment",
                notes="Starting funds for business operations",
                created_by=admin.email,
                transaction_date=datetime.utcnow() - timedelta(days=90)
            ),
            BudgetTransaction(
                type=BudgetTransactionType.ADDITION,
                account=BudgetAccount.OVERALL_CAPITAL,
                amount=5000.0,
                description="Additional investment",
                notes="Expansion funds",
                created_by=admin.email,
                transaction_date=datetime.utcnow() - timedelta(days=60)
            ),
            BudgetTransaction(
                type=BudgetTransactionType.WITHDRAWAL,
                account=BudgetAccount.OVERALL_CAPITAL,
                amount=2000.0,
                description="Equipment purchase",
                notes="New computer and office equipment",
                created_by=admin.email,
                transaction_date=datetime.utcnow() - timedelta(days=45)
            ),
            BudgetTransaction(
                type=BudgetTransactionType.ADDITION,
                account=BudgetAccount.MONTHLY_PROFIT,
                amount=500.0,
                description="Bonus income",
                notes="Referral bonus",
                created_by=admin.email,
                transaction_date=datetime.utcnow() - timedelta(days=10)
            ),
        ]
        
        for bt in budget_transactions:
            db.add(bt)
        
        db.commit()
        print(f"✅ Created {len(budget_transactions)} sample budget transactions")
        
        # Refresh financials to get updated values
        db.refresh(current_financials)
        
        # Print summary
        print("\n" + "="*60)
        print("🎉 Database seeding completed successfully!")
        print("="*60)
        print("\n📊 Summary:")
        print(f"  • Users: {db.query(User).count()}")
        print(f"  • Clients: {db.query(Client).count()}")
        print(f"  • Orders: {db.query(Order).count()}")
        print(f"  • Deliveries: {db.query(Delivery).count()}")
        print(f"  • Transactions: {db.query(Transaction).count()}")
        print(f"  • Budget Transactions: {db.query(BudgetTransaction).count()}")
        print(f"  • Monthly Financial Records: {db.query(MonthlyFinancials).count()}")
        
        print("\n💰 Current Financial Status:")
        print(f"  • Monthly Profit: ${current_financials.monthly_profit:.2f}")
        print(f"  • Monthly Revenue: ${current_financials.monthly_revenue:.2f}")
        print(f"  • Overall Capital: ${current_financials.overall_capital:.2f}")
        
        print("\n🔐 Login Credentials:")
        print("  • Email: admin@fastdropship.com")
        print("  • Password: admin123")
        
        print("\n✨ You can now start the application and login!")
        print("   Backend: uvicorn app.main:app --reload")
        print("   Frontend: npm run dev")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

# Made with Bob
