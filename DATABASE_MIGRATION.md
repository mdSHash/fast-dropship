# Database Migration Guide - Fast-Dropship

## Overview

Due to significant schema changes in the enhanced version, you need to **delete the existing database and recreate it** with the new schema.

## What Changed

### Modified Tables

**1. Orders Table**
- ❌ Removed: `price` field
- ✅ Added: `cost` field (order cost/purchase price)
- ✅ Added: `customer_price` field (price charged to customer)
- ✅ Added: `taxes` field (taxes and fees)
- ✅ Added: `profit` field (calculated: customer_price - cost - taxes)

**2. Clients Table**
- ✅ Added: `email` field (unique, optional)

### New Tables

**3. MonthlyFinancials Table**
- `id` - Primary key
- `year` - Year (indexed)
- `month` - Month 1-12 (indexed)
- `monthly_profit` - Resets each month
- `monthly_revenue` - Resets each month
- `overall_capital` - Persists across months
- `created_at` - Timestamp
- `updated_at` - Timestamp
- `reset_at` - When monthly reset occurred

**4. BudgetTransactions Table**
- `id` - Primary key
- `type` - addition/withdrawal
- `account` - monthly_profit/overall_capital
- `amount` - Transaction amount
- `description` - Optional description
- `notes` - Optional notes
- `reference_id` - Optional reference
- `created_by` - User who created
- `created_at` - Timestamp
- `transaction_date` - Transaction date

## Migration Steps

### Step 1: Backup Existing Data (Optional)

If you have important data, export it first:

```bash
# From backend directory
sqlite3 fastdropship.db .dump > backup.sql
```

### Step 2: Delete Old Database

```bash
cd backend
rm fastdropship.db
```

### Step 3: Recreate Database

The database will be automatically created when you start the backend server:

```bash
# From backend directory
uvicorn app.main:app --reload
```

This will create all tables with the new schema.

### Step 4: Seed with Sample Data

```bash
# From backend directory
python3 seed_data.py
```

This will create:
- 1 admin user
- 10 clients (with emails)
- 20 orders (with cost, customer_price, taxes, profit)
- 15 deliveries
- 30 transactions
- Initial MonthlyFinancials record
- Sample budget transactions

### Step 5: Verify

1. **Start Backend:**
   ```bash
   uvicorn app.main:app --reload
   ```

2. **Check API Docs:**
   Visit http://127.0.0.1:8000/docs

3. **Test Login:**
   - Email: `admin@fastdropship.com`
   - Password: `admin123`

4. **Verify New Endpoints:**
   - `/api/financials/current` - Current month's financials
   - `/api/budget/balances` - Budget balances
   - `/api/dashboard/` - Updated dashboard with new metrics

## Data Mapping Guide

If you need to migrate existing data manually:

### Orders Migration

**Old Schema:**
```sql
SELECT id, client_id, order_name, order_link, quantity, price, status
FROM orders;
```

**New Schema:**
```sql
INSERT INTO orders (
    id, client_id, order_name, order_link, quantity,
    cost, customer_price, taxes, profit, status
) VALUES (
    ?, ?, ?, ?, ?,
    ?, ?, 0.0, ?, ?
);
```

**Mapping Logic:**
- `cost` = `price * 0.7` (assume 70% cost)
- `customer_price` = `price`
- `taxes` = `0.0` (default)
- `profit` = `customer_price - cost - taxes`

### Clients Migration

**Old Schema:**
```sql
SELECT id, name, phone, location, notes
FROM clients;
```

**New Schema:**
```sql
INSERT INTO clients (
    id, name, email, phone, location, notes
) VALUES (
    ?, ?, NULL, ?, ?, ?
);
```

**Mapping Logic:**
- `email` = `NULL` (can be added later)

## Manual Migration Script

If you need to migrate data from old database:

```python
import sqlite3

# Connect to old database
old_db = sqlite3.connect('fastdropship_old.db')
old_cursor = old_db.cursor()

# Connect to new database
new_db = sqlite3.connect('fastdropship.db')
new_cursor = new_db.cursor()

# Migrate clients
old_cursor.execute("SELECT id, name, phone, location, notes, created_at FROM clients")
for row in old_cursor.fetchall():
    new_cursor.execute("""
        INSERT INTO clients (id, name, email, phone, location, notes, created_at)
        VALUES (?, ?, NULL, ?, ?, ?, ?)
    """, row)

# Migrate orders
old_cursor.execute("SELECT id, client_id, order_name, order_link, quantity, price, status, created_at FROM orders")
for row in old_cursor.fetchall():
    id, client_id, order_name, order_link, quantity, price, status, created_at = row
    cost = price * 0.7  # Assume 70% cost
    customer_price = price
    taxes = 0.0
    profit = customer_price - cost - taxes
    
    new_cursor.execute("""
        INSERT INTO orders (
            id, client_id, order_name, order_link, quantity,
            cost, customer_price, taxes, profit, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (id, client_id, order_name, order_link, quantity, cost, customer_price, taxes, profit, status, created_at))

# Commit and close
new_db.commit()
old_db.close()
new_db.close()

print("Migration complete!")
```

## Troubleshooting

### Issue: "Table already exists" error

**Solution:**
```bash
rm backend/fastdropship.db
# Then restart the backend
```

### Issue: "Column not found" error

**Solution:**
This means you're using the old database schema. Delete and recreate:
```bash
cd backend
rm fastdropship.db
uvicorn app.main:app --reload
python3 seed_data.py
```

### Issue: Seed script fails

**Solution:**
1. Make sure backend is NOT running
2. Delete database: `rm fastdropship.db`
3. Start backend once to create tables
4. Stop backend
5. Run seed script: `python3 seed_data.py`

### Issue: Frontend shows errors

**Solution:**
1. Clear browser cache
2. Check that backend is running
3. Verify API URL in `frontend/.env.local`
4. Check browser console for specific errors

## Post-Migration Checklist

- [ ] Old database backed up (if needed)
- [ ] Old database deleted
- [ ] New database created (tables exist)
- [ ] Seed data loaded successfully
- [ ] Backend starts without errors
- [ ] Can login with test credentials
- [ ] Dashboard shows new metrics (Monthly Profit, Monthly Revenue, Overall Capital)
- [ ] Can create orders with new fields (cost, customer_price, taxes)
- [ ] Can add clients with email
- [ ] Budget management endpoints work
- [ ] Financial endpoints work
- [ ] Frontend connects successfully

## Important Notes

1. **No Automatic Migration**: Due to significant schema changes, automatic migration is not supported. You must delete and recreate the database.

2. **Data Loss**: If you delete the database, all existing data will be lost. Make sure to backup if needed.

3. **Test Environment**: Test the migration in a development environment first before applying to production.

4. **Production Migration**: For production, consider:
   - Scheduling downtime
   - Backing up data
   - Testing migration script thoroughly
   - Having rollback plan

5. **Future Migrations**: For future schema changes, consider using a migration tool like Alembic.

## Quick Start (Fresh Install)

For a completely fresh installation:

```bash
# 1. Delete old database
cd backend
rm -f fastdropship.db

# 2. Install dependencies
pip3 install -r requirements.txt

# 3. Start backend (creates tables)
uvicorn app.main:app --reload &
sleep 3
kill %1

# 4. Seed database
python3 seed_data.py

# 5. Start backend
uvicorn app.main:app --reload
```

Then in another terminal:

```bash
# 6. Start frontend
cd frontend
npm install
npm run dev
```

Access at http://localhost:3000 with:
- Email: `admin@fastdropship.com`
- Password: `admin123`

---

**Need Help?** Check the TESTING_GUIDE.md for comprehensive testing procedures.