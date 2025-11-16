import sqlite3
import os

def add_assigned_to_column():
    """Add assigned_to column to orders table"""
    db_path = os.path.join(os.path.dirname(__file__), 'fastdropship.db')
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(orders)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'assigned_to' not in columns:
            print("Adding assigned_to column to orders table...")
            cursor.execute("""
                ALTER TABLE orders 
                ADD COLUMN assigned_to INTEGER 
                REFERENCES users(id)
            """)
            
            # Create index for better query performance
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_orders_assigned_to 
                ON orders(assigned_to)
            """)
            
            conn.commit()
            print("✓ Successfully added assigned_to column to orders table")
        else:
            print("✓ assigned_to column already exists in orders table")
            
    except sqlite3.Error as e:
        print(f"✗ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 50)
    print("Adding assigned_to column to orders table")
    print("=" * 50)
    add_assigned_to_column()
    print("=" * 50)
    print("Migration complete!")
    print("=" * 50)

# Made with Bob
