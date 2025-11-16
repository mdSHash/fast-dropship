#!/bin/bash

echo "============================================================"
echo "🔄 Running All Database Migrations"
echo "============================================================"
echo ""

# Check if database exists
if [ ! -f "fastdropship.db" ]; then
    echo "❌ Database not found at fastdropship.db"
    echo "Please run the application first to create the database."
    echo ""
    echo "You can create a fresh database by running:"
    echo "  python3 seed_data.py"
    exit 1
fi

echo "📊 Found database: fastdropship.db"
echo ""

# Run multiuser migration
echo "Step 1: Running multiuser RBAC migration..."
echo "------------------------------------------------------------"
python3 migrate_multiuser.py
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Multiuser migration failed!"
    exit 1
fi

echo ""
echo "Step 2: Adding created_by to deliveries and transactions..."
echo "------------------------------------------------------------"
python3 add_created_by_to_deliveries_transactions.py
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Deliveries/Transactions migration failed!"
    exit 1
fi

echo ""
echo "============================================================"
echo "✅ All migrations completed successfully!"
echo "============================================================"
echo ""
echo "Next steps:"
echo "1. Restart the backend server if it's running"
echo "2. Test the role-based access control"
echo "3. Verify deliveries and transactions filtering"
echo ""

# Made with Bob