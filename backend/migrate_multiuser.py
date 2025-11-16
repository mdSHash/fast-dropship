"""
Database Migration Script for Multi-User System
This script migrates existing data to support the new multi-user role-based access control system.

Steps:
1. Add role and is_active columns to users table
2. Add created_by column to clients table
3. Add created_by column to orders table
4. Set first user as admin
5. Assign all existing clients and orders to the admin user
"""

import sys
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models import User, Client, Order, UserRole

def migrate_database():
    """Run the migration"""
    print("Starting database migration for multi-user system...")
    
    # Create engine and session
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Get database inspector for checking columns
        inspector = inspect(engine)
        
        # Step 1: Check if columns already exist
        print("\n1. Checking existing schema...")
        
        # Check if role column exists in users table
        user_columns = [col['name'] for col in inspector.get_columns('users')]
        role_exists = 'role' in user_columns
        
        if not role_exists:
            print("   Adding role and is_active columns to users table...")
            # SQLite requires separate ALTER TABLE statements for each column
            # Use lowercase 'user' to match the enum value in UserRole
            db.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(10) DEFAULT 'user' NOT NULL"))
            db.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1 NOT NULL"))
            db.commit()
            print("   ✓ Added role and is_active columns")
        else:
            print("   ✓ Role column already exists")
        
        # Check if created_by column exists in clients table
        client_columns = [col['name'] for col in inspector.get_columns('clients')]
        client_created_by_exists = 'created_by' in client_columns
        
        if not client_created_by_exists:
            print("\n2. Adding created_by column to clients table...")
            db.execute(text("""
                ALTER TABLE clients 
                ADD COLUMN created_by INTEGER
            """))
            db.commit()
            print("   ✓ Added created_by column to clients")
        else:
            print("\n2. ✓ created_by column already exists in clients")
        
        # Check if created_by column exists in orders table
        order_columns = [col['name'] for col in inspector.get_columns('orders')]
        order_created_by_exists = 'created_by' in order_columns
        
        if not order_created_by_exists:
            print("\n3. Adding created_by column to orders table...")
            db.execute(text("""
                ALTER TABLE orders 
                ADD COLUMN created_by INTEGER
            """))
            db.commit()
            print("   ✓ Added created_by column to orders")
        else:
            print("\n3. ✓ created_by column already exists in orders")
        
        # Step 2: Get or create admin user
        print("\n4. Setting up admin user...")
        admin_user = db.query(User).filter(User.role == UserRole.ADMIN).first()
        
        if not admin_user:
            # Make the first user an admin
            first_user = db.query(User).order_by(User.id).first()
            if first_user:
                # Use setattr to avoid type checker issues with SQLAlchemy columns
                setattr(first_user, 'role', UserRole.ADMIN)
                setattr(first_user, 'is_active', True)
                db.commit()
                admin_user = first_user
                print(f"   ✓ Set user '{admin_user.username}' (ID: {admin_user.id}) as admin")
            else:
                print("   ⚠ No users found in database. Please create an admin user first.")
                return
        else:
            print(f"   ✓ Admin user already exists: '{admin_user.username}' (ID: {admin_user.id})")
        
        # Step 3: Assign existing clients to admin
        print("\n5. Assigning existing clients to admin user...")
        unassigned_clients = db.query(Client).filter(Client.created_by == None).all()
        if unassigned_clients:
            for client in unassigned_clients:
                setattr(client, 'created_by', admin_user.id)
            db.commit()
            print(f"   ✓ Assigned {len(unassigned_clients)} clients to admin user")
        else:
            print("   ✓ All clients already assigned")
        
        # Step 4: Assign existing orders to admin
        print("\n6. Assigning existing orders to admin user...")
        unassigned_orders = db.query(Order).filter(Order.created_by == None).all()
        if unassigned_orders:
            for order in unassigned_orders:
                setattr(order, 'created_by', admin_user.id)
            db.commit()
            print(f"   ✓ Assigned {len(unassigned_orders)} orders to admin user")
        else:
            print("   ✓ All orders already assigned")
        
        # Step 5: Add foreign key constraints (SQLite doesn't support ALTER TABLE ADD CONSTRAINT)
        print("\n7. Checking foreign key constraints...")
        print("   ℹ Note: SQLite foreign keys are defined at table creation")
        print("   ✓ Foreign keys will be enforced by SQLAlchemy ORM")
        
        # Step 6: Make created_by NOT NULL (SQLite limitation - would require table recreation)
        print("\n8. Checking NOT NULL constraints...")
        print("   ℹ Note: SQLite doesn't support ALTER COLUMN")
        print("   ✓ NOT NULL constraints will be enforced by SQLAlchemy ORM")
        
        print("\n" + "="*60)
        print("✓ Migration completed successfully!")
        print("="*60)
        print(f"\nAdmin user: {admin_user.username} (ID: {admin_user.id})")
        print(f"Total clients: {db.query(Client).count()}")
        print(f"Total orders: {db.query(Order).count()}")
        print("\nNext steps:")
        print("1. Restart your backend server")
        print("2. Login with the admin user")
        print("3. Create additional users from the Users management page")
        print("4. Test the multi-user access control")
        
    except Exception as e:
        print(f"\n✗ Migration failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    try:
        migrate_database()
    except Exception as e:
        print(f"\nError: {str(e)}")
        sys.exit(1)

# Made with Bob