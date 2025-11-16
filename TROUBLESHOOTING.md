# Troubleshooting Guide

## Issue: Admin Features Not Showing

If you're logged in as an admin but don't see admin-only features (like "Created By" columns or user assignment dropdown), follow these steps:

### Solution 1: Clear Cache and Re-login (Recommended)

1. **Log out** from the application
2. **Clear browser localStorage**:
   - Open browser DevTools (F12)
   - Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
   - Find "Local Storage" → `http://localhost:3000`
   - Delete all items or specifically delete `user` and `token`
3. **Log back in** as admin user
4. The admin features should now appear

### Solution 2: Manual Cache Refresh

If you don't want to log out, you can manually refresh the user cache:

1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Run this command:
   ```javascript
   localStorage.removeItem('user');
   ```
4. Refresh the page (F5)
5. The app will automatically fetch fresh user info

### Solution 3: Force User Info Fetch

Run this in the browser console to manually fetch and cache user info:

```javascript
fetch('http://localhost:8000/api/auth/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(user => {
  localStorage.setItem('user', JSON.stringify(user));
  console.log('User info cached:', user);
  location.reload();
});
```

## Verifying Admin Status

To check if you're properly logged in as admin:

1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Run:
   ```javascript
   JSON.parse(localStorage.getItem('user'))
   ```
4. You should see output like:
   ```json
   {
     "id": 1,
     "username": "admin",
     "email": "admin@example.com",
     "role": "admin",
     "is_active": true
   }
   ```

If `role` is not `"admin"`, you're not logged in as an admin user.

## Common Issues

### 1. "Created By" Column Not Showing

**Symptoms:**
- Logged in as admin
- Don't see "Created By" column in orders, deliveries, or transactions pages

**Cause:**
- User info not cached in localStorage
- Logged in before the caching feature was implemented

**Solution:**
- Follow Solution 1 above (Clear Cache and Re-login)

### 2. User Assignment Dropdown Not Showing in Add Order

**Symptoms:**
- Logged in as admin
- Don't see "Assign to User" dropdown in Add Order form

**Cause:**
- Same as above - user info not cached

**Solution:**
- Follow Solution 1 above (Clear Cache and Re-login)

### 3. Database Columns Missing

**Symptoms:**
- Backend errors about missing columns
- `created_by` or `assigned_to` fields not found

**Cause:**
- Database migrations not run

**Solution:**
```bash
cd backend
python3 migrate_multiuser.py
python3 add_created_by_to_deliveries_transactions.py
python3 add_assigned_to_orders.py
```

Or run all migrations at once:
```bash
cd backend
./migrate_all.sh
```

### 4. Backend Not Returning Username

**Symptoms:**
- "Created By" column shows but displays "N/A" for all entries
- "Assigned To" column shows but displays "Not assigned" for all entries

**Cause:**
- Backend not joining with User table properly
- Old data created before `created_by` field was added

**Solution:**
- For new data: Should work automatically
- For old data: Run this SQL to set created_by for existing records:
  ```bash
  cd backend
  sqlite3 fastdropship.db
  ```
  ```sql
  -- Set created_by to admin user (id=1) for existing orders
  UPDATE orders SET created_by = 1 WHERE created_by IS NULL;
  UPDATE deliveries SET created_by = 1 WHERE created_by IS NULL;
  UPDATE transactions SET created_by = 1 WHERE created_by IS NULL;
  ```

## Testing Admin Features

After fixing the issue, verify these features work:

### As Admin User:

1. **Order Pending Page:**
   - ✅ See "Created By" column
   - ✅ See "Assigned To" column
   - ✅ See usernames in both columns

2. **Order Completed Page:**
   - ✅ See "Created By" column
   - ✅ See "Assigned To" column
   - ✅ See usernames in both columns

3. **Delivery Page:**
   - ✅ See "Created By" column
   - ✅ See usernames

4. **Transactions Page:**
   - ✅ See "Created By" column
   - ✅ See usernames

5. **Add Order Page:**
   - ✅ See "Assign to User" dropdown
   - ✅ Dropdown shows list of all users
   - ✅ Can select a user or leave as default

### As Regular User:

1. **All Pages:**
   - ✅ Do NOT see "Created By" column
   - ✅ Do NOT see "Assigned To" column
   - ✅ Only see own data

2. **Add Order Page:**
   - ✅ Do NOT see "Assign to User" dropdown

## Still Having Issues?

If none of the above solutions work:

1. Check browser console for errors (F12 → Console tab)
2. Check backend logs for errors
3. Verify backend is running: `http://localhost:8000/docs`
4. Test the `/auth/me` endpoint directly:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/auth/me
   ```

## Quick Reset (Nuclear Option)

If all else fails, completely reset:

```bash
# Stop backend and frontend
# Then:

# 1. Reset database
cd backend
rm fastdropship.db
python3 seed_data.py

# 2. Clear browser data
# In browser: Clear all site data for localhost:3000

# 3. Restart everything
cd ..
./start.sh

# 4. Login with fresh credentials
# Admin: admin / admin123
# User: user / user123
```

---

**Made with Bob** 🤖