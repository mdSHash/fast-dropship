"""
Migration script to add created_by field to deliveries and transactions tables
Run this after the multiuser migration
"""

import sqlite3
import sys
from pathlib import Path

# Add parent directory to path to import models
sys.path.insert(0, str(Path(__file__).parent))

def migrate_database():
    """Add created_by column to deliveries and transactions tables"""
    db_path = Path(__file__).parent / "fastdropship.db"
    
    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        print("Please run the application first to create the database.")
        return False
    
    print(f"📊 Migrating database at {db_path}")
    
    conn = None
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if deliveries table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='deliveries'
        """)
        if not cursor.fetchone():
            print("⚠️  Deliveries table doesn't exist yet")
        else:
            # Check if created_by column already exists in deliveries
            cursor.execute("PRAGMA table_info(deliveries)")
            columns = [col[1] for col in cursor.fetchall()]
            
            if 'created_by' not in columns:
                print("➕ Adding created_by column to deliveries table...")
                cursor.execute("""
                    ALTER TABLE deliveries 
                    ADD COLUMN created_by INTEGER 
                    REFERENCES users(id)
                """)
                print("✅ Added created_by to deliveries")
            else:
                print("ℹ️  created_by column already exists in deliveries")
        
        # Check if transactions table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='transactions'
        """)
        if not cursor.fetchone():
            print("⚠️  Transactions table doesn't exist yet")
        else:
            # Check if created_by column already exists in transactions
            cursor.execute("PRAGMA table_info(transactions)")
            columns = [col[1] for col in cursor.fetchall()]
            
            if 'created_by' not in columns:
                print("➕ Adding created_by column to transactions table...")
                cursor.execute("""
                    ALTER TABLE transactions 
                    ADD COLUMN created_by INTEGER 
                    REFERENCES users(id)
                """)
                print("✅ Added created_by to transactions")
            else:
                print("ℹ️  created_by column already exists in transactions")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        print("\n📝 Note: Existing deliveries and transactions will have NULL created_by values.")
        print("   You may want to update them manually or through the admin interface.")
        
        return True
        
    except sqlite3.Error as e:
        print(f"\n❌ Migration failed: {e}")
        return False
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("🔄 Database Migration: Add created_by to deliveries & transactions")
    print("=" * 60)
    print()
    
    success = migrate_database()
    
    if success:
        print("\n" + "=" * 60)
        print("✅ Migration completed successfully!")
        print("=" * 60)
        sys.exit(0)
    else:
        print("\n" + "=" * 60)
        print("❌ Migration failed!")
        print("=" * 60)
        sys.exit(1)

# Made with Bob