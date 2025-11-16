# Testing Guide - Fast-Dropship

Complete guide for testing all features of the Fast-Dropship application.

## Table of Contents
1. [Setup for Testing](#setup-for-testing)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [Feature Testing Checklist](#feature-testing-checklist)
5. [Common Issues & Solutions](#common-issues--solutions)

---

## Setup for Testing

### 1. Install Backend Dependencies

```bash
cd backend
pip3 install -r requirements.txt
```

**Expected Output:**
- All packages installed successfully
- No error messages

### 2. Seed the Database

```bash
# From backend directory
python3 seed_data.py
```

**Expected Output:**
```
Database seeded successfully!
Created 1 user
Created 10 clients
Created 20 orders
Created 15 deliveries
Created 30 transactions
```

**Test Credentials:**
- Email: `admin@fastdropship.com`
- Password: `admin123`

### 3. Start Backend Server

```bash
# From backend directory
uvicorn app.main:app --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify Backend:**
- Open browser: http://127.0.0.1:8000/docs
- You should see FastAPI Swagger documentation

### 4. Install Frontend Dependencies

```bash
# Open new terminal
cd frontend
npm install
```

**Expected Output:**
- All packages installed
- No vulnerabilities (or only low-severity)

### 5. Start Frontend Server

```bash
# From frontend directory
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in Xs
```

**Verify Frontend:**
- Open browser: http://localhost:3000
- You should see the login page

---

## Backend Testing

### API Endpoints Testing (via Swagger UI)

Visit: http://127.0.0.1:8000/docs

#### 1. Authentication Endpoints

**Test Registration:**
```json
POST /api/auth/register
{
  "email": "test@example.com",
  "password": "test123",
  "full_name": "Test User"
}
```
✅ Expected: 200 OK with user object

**Test Login:**
```json
POST /api/auth/login
{
  "username": "admin@fastdropship.com",
  "password": "admin123"
}
```
✅ Expected: 200 OK with access_token

**Copy the access_token for next tests**

**Authorize in Swagger:**
- Click "Authorize" button (top right)
- Enter: `Bearer <your_access_token>`
- Click "Authorize"

#### 2. Client Endpoints

**Get All Clients:**
```
GET /api/clients/
```
✅ Expected: 200 OK with array of 10 clients

**Search Clients:**
```
GET /api/clients/?search=John
```
✅ Expected: Filtered results

**Get Single Client:**
```
GET /api/clients/1
```
✅ Expected: 200 OK with client details

**Create Client:**
```json
POST /api/clients/
{
  "name": "New Client",
  "phone": "1234567890",
  "location": "New York",
  "notes": "Test notes"
}
```
✅ Expected: 200 OK with created client

**Update Client:**
```json
PUT /api/clients/1
{
  "name": "Updated Name",
  "phone": "9876543210",
  "location": "Los Angeles",
  "notes": "Updated notes"
}
```
✅ Expected: 200 OK with updated client

**Delete Client:**
```
DELETE /api/clients/1
```
✅ Expected: 200 OK

#### 3. Order Endpoints

**Get All Orders:**
```
GET /api/orders/
```
✅ Expected: 200 OK with array of orders

**Filter Pending Orders:**
```
GET /api/orders/?status=pending
```
✅ Expected: Only pending orders

**Filter Completed Orders:**
```
GET /api/orders/?status=completed
```
✅ Expected: Only completed orders

**Create Order:**
```json
POST /api/orders/
{
  "client_id": 2,
  "order_name": "Test Product",
  "order_link": "https://example.com/product",
  "quantity": 5,
  "price": 99.99,
  "status": "pending"
}
```
✅ Expected: 200 OK with created order

**Update Order Status:**
```json
PUT /api/orders/1
{
  "status": "completed"
}
```
✅ Expected: 200 OK with updated order

#### 4. Delivery Endpoints

**Get All Deliveries:**
```
GET /api/deliveries/
```
✅ Expected: 200 OK with array of deliveries

**Create Delivery:**
```json
POST /api/deliveries/
{
  "order_id": 1,
  "tracking_number": "TRACK123456",
  "status": "in_transit",
  "driver_name": "John Driver",
  "driver_phone": "1234567890"
}
```
✅ Expected: 200 OK with created delivery

**Update Delivery:**
```json
PUT /api/deliveries/1
{
  "status": "delivered"
}
```
✅ Expected: 200 OK with updated delivery

#### 5. Transaction Endpoints

**Get All Transactions:**
```
GET /api/transactions/
```
✅ Expected: 200 OK with array of transactions

**Get Monthly Summary:**
```
GET /api/transactions/monthly?year=2024&month=1
```
✅ Expected: Monthly income/expense summary

**Create Transaction:**
```json
POST /api/transactions/
{
  "type": "income",
  "amount": 500.00,
  "description": "Product sale",
  "category": "sales"
}
```
✅ Expected: 200 OK with created transaction

#### 6. Dashboard Endpoint

**Get Dashboard Data:**
```
GET /api/dashboard/
```
✅ Expected: 200 OK with:
- total_profit
- total_capital
- total_clients
- ongoing_orders
- monthly_data (12 months)

---

## Frontend Testing

### 1. Login Page Testing

**URL:** http://localhost:3000

**Test Cases:**

✅ **Valid Login:**
- Email: `admin@fastdropship.com`
- Password: `admin123`
- Click "Sign In"
- Should redirect to dashboard

✅ **Invalid Login:**
- Email: `wrong@email.com`
- Password: `wrongpass`
- Should show error message

✅ **Registration:**
- Click "Sign Up" tab
- Fill in all fields
- Click "Sign Up"
- Should create account and redirect

✅ **Form Validation:**
- Try submitting empty form
- Should show validation errors

### 2. Dashboard Page Testing

**URL:** http://localhost:3000/dashboard

**Test Cases:**

✅ **KPI Cards Display:**
- Profit card shows correct value
- Capital card shows correct value
- Clients card shows correct count
- Ongoing Orders card shows correct count

✅ **Chart Display:**
- Chart renders with 12 months
- Data points are visible
- Legend shows "pv" and "uv"
- Hover shows tooltips

✅ **Last 10 Clients Table:**
- Shows up to 10 recent clients
- Displays Name, Address, Phone
- Data is formatted correctly

✅ **Last 10 Orders Table:**
- Shows up to 10 recent orders
- Displays Order Name, Link, Quantity, Price
- Links are clickable
- Prices formatted as currency

### 3. Clients Page Testing

**URL:** http://localhost:3000/clients

**Test Cases:**

✅ **View Clients:**
- Table displays all clients
- Columns: Name, Phone, Location, Actions
- Data loads correctly

✅ **Search Clients:**
- Type in search box
- Results filter in real-time
- Search works for name, phone, location

✅ **Add New Client:**
- Click "Add New Client" button
- Modal opens
- Fill in form:
  - Name: "Test Client"
  - Phone: "1234567890"
  - Location: "Test City"
  - Notes: "Test notes"
- Click "Add Client"
- Modal closes
- New client appears in table
- Success message shows

✅ **Edit Client:**
- Click edit icon on any client
- Modal opens with existing data
- Modify fields
- Click "Update Client"
- Changes saved
- Table updates

✅ **Delete Client:**
- Click delete icon
- Confirmation dialog appears
- Click confirm
- Client removed from table

### 4. Add Order Page Testing

**URL:** http://localhost:3000/add-order

**Test Cases:**

✅ **Form Display:**
- All fields visible
- Client dropdown populated
- All inputs functional

✅ **Create Order:**
- Select client from dropdown
- Enter order name: "Test Product"
- Enter order link: "https://example.com"
- Enter quantity: 5
- Enter price: 99.99
- Click "Create Order"
- Success message shows
- Form resets

✅ **Form Validation:**
- Try submitting empty form
- Required field errors show
- Invalid price shows error
- Invalid quantity shows error

### 5. Order Pending Page Testing

**URL:** http://localhost:3000/order-pending

**Test Cases:**

✅ **View Pending Orders:**
- Table shows only pending orders
- Columns display correctly
- Data formatted properly

✅ **Mark as Complete:**
- Click "Mark Complete" button
- Order status updates
- Order removed from pending list
- Success message shows

✅ **View Order Details:**
- Click on order row
- Details display correctly
- Client info shows
- Order info shows

### 6. Order Completed Page Testing

**URL:** http://localhost:3000/order-completed

**Test Cases:**

✅ **View Completed Orders:**
- Table shows only completed orders
- Completion dates display
- All data visible

✅ **Search Orders:**
- Search by order name
- Search by client name
- Results filter correctly

✅ **Sort Orders:**
- Click column headers
- Data sorts ascending/descending
- Multiple columns sortable

### 7. Delivery Page Testing

**URL:** http://localhost:3000/delivery

**Test Cases:**

✅ **View Deliveries:**
- All deliveries listed
- Status badges colored correctly:
  - Pending: Yellow
  - In Transit: Blue
  - Delivered: Green
  - Failed: Red

✅ **Update Delivery Status:**
- Click status dropdown
- Select new status
- Status updates
- Badge color changes

✅ **View Delivery Details:**
- Tracking number visible
- Driver info displays
- Order details show
- Timeline visible

### 8. Chat/Notes Page Testing

**URL:** http://localhost:3000/chat

**Test Cases:**

✅ **Client List:**
- All clients listed on left
- Click client to view notes
- Active client highlighted

✅ **View Notes:**
- Notes display for selected client
- Formatted correctly
- Scrollable if long

✅ **Add Notes:**
- Type in text area
- Click "Save Notes"
- Notes saved
- Success message shows

✅ **Update Notes:**
- Edit existing notes
- Click "Save Notes"
- Changes saved
- Updated notes display

### 9. Transactions Page Testing

**URL:** http://localhost:3000/transactions

**Test Cases:**

✅ **View Transactions:**
- All transactions listed
- Income/Expense labeled
- Amounts formatted as currency
- Dates formatted correctly

✅ **Filter by Type:**
- Click "Income" filter
- Only income shows
- Click "Expense" filter
- Only expenses show
- Click "All" to reset

✅ **Add Transaction:**
- Click "Add Transaction"
- Modal opens
- Fill form:
  - Type: Income/Expense
  - Amount: 500.00
  - Description: "Test transaction"
  - Category: Select from dropdown
- Click "Add"
- Transaction appears in list

✅ **Summary Cards:**
- Total Income displays
- Total Expense displays
- Net Profit calculates correctly
- Values update with filters

### 10. Previous Months Page Testing

**URL:** http://localhost:3000/previous-months

**Test Cases:**

✅ **Year Selection:**
- Dropdown shows years
- Select different year
- Data updates

✅ **Month Selection:**
- Dropdown shows all 12 months
- Select different month
- Data updates

✅ **Monthly Data Display:**
- Income for month shows
- Expenses for month show
- Profit calculates correctly
- Order count displays

✅ **Charts:**
- Monthly trend chart displays
- Data points accurate
- Hover shows details

### 11. Change Password Page Testing

**URL:** http://localhost:3000/change-password

**Test Cases:**

✅ **Change Password:**
- Enter current password
- Enter new password
- Confirm new password
- Click "Change Password"
- Success message shows

✅ **Validation:**
- Passwords must match
- Minimum length enforced
- Current password verified
- Error messages clear

### 12. Navigation Testing

**Test Cases:**

✅ **Sidebar Navigation:**
- All menu items clickable
- Active page highlighted
- Icons display correctly
- Hover effects work

✅ **Mobile Navigation:**
- Resize to mobile width
- Hamburger menu appears
- Click to open sidebar
- Click outside to close
- All links work

✅ **Logout:**
- Click "Log Out"
- Redirects to login
- Token cleared
- Cannot access protected pages

---

## Feature Testing Checklist

### Authentication ✅
- [ ] User registration works
- [ ] User login works
- [ ] Token stored in localStorage
- [ ] Protected routes redirect to login
- [ ] Logout clears token
- [ ] Password change works

### Client Management ✅
- [ ] View all clients
- [ ] Search clients
- [ ] Add new client
- [ ] Edit client
- [ ] Delete client
- [ ] Client notes save

### Order Management ✅
- [ ] Create new order
- [ ] View pending orders
- [ ] View completed orders
- [ ] Mark order as complete
- [ ] Edit order details
- [ ] Delete order
- [ ] Link to client works

### Delivery Tracking ✅
- [ ] View all deliveries
- [ ] Create delivery
- [ ] Update delivery status
- [ ] View tracking info
- [ ] Driver info displays

### Financial Management ✅
- [ ] View all transactions
- [ ] Add income transaction
- [ ] Add expense transaction
- [ ] Filter by type
- [ ] Monthly summaries accurate
- [ ] Profit calculations correct

### Dashboard Analytics ✅
- [ ] KPIs display correctly
- [ ] Chart renders
- [ ] Recent clients show
- [ ] Recent orders show
- [ ] Data updates in real-time

### UI/UX ✅
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Loading states show
- [ ] Error messages clear
- [ ] Success messages show
- [ ] Forms validate
- [ ] Buttons have hover effects

---

## Common Issues & Solutions

### Backend Issues

**Issue: Port 8000 already in use**
```bash
# Solution: Kill the process
lsof -ti:8000 | xargs kill -9
# Or use different port
uvicorn app.main:app --reload --port 8001
```

**Issue: Database locked**
```bash
# Solution: Delete and recreate
rm backend/fastdropship.db
python3 seed_data.py
```

**Issue: Import errors**
```bash
# Solution: Reinstall dependencies
pip3 install -r requirements.txt --force-reinstall
```

**Issue: CORS errors**
```bash
# Solution: Check ALLOWED_ORIGINS in backend/.env
# Should include: http://localhost:3000
```

### Frontend Issues

**Issue: Port 3000 already in use**
```bash
# Solution: Kill the process
lsof -ti:3000 | xargs kill -9
# Or use different port
npm run dev -- -p 3001
```

**Issue: API connection failed**
```bash
# Solution: Check NEXT_PUBLIC_API_URL in frontend/.env.local
# Should be: http://127.0.0.1:8000
```

**Issue: Module not found**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Issue: Build errors**
```bash
# Solution: Clear Next.js cache
rm -rf .next
npm run dev
```

### Authentication Issues

**Issue: Token expired**
- Solution: Logout and login again

**Issue: Unauthorized errors**
- Solution: Check token in localStorage
- Clear localStorage and login again

**Issue: CORS on login**
- Solution: Verify backend ALLOWED_ORIGINS includes frontend URL

### Data Issues

**Issue: No data showing**
- Solution: Run seed script again
- Check API responses in Network tab

**Issue: Wrong data displaying**
- Solution: Clear browser cache
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

---

## Performance Testing

### Load Testing

**Test with multiple clients:**
```bash
# Install Apache Bench
brew install httpd  # macOS

# Test API endpoint
ab -n 1000 -c 10 http://127.0.0.1:8000/api/clients/
```

**Expected Results:**
- Response time < 100ms
- No failed requests
- Consistent performance

### Browser Performance

**Use Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Performance tab
3. Record page load
4. Check metrics:
   - First Contentful Paint < 1s
   - Time to Interactive < 2s
   - Total Blocking Time < 200ms

---

## Security Testing

### Basic Security Checks

✅ **Password Security:**
- [ ] Passwords hashed (not stored plain text)
- [ ] Minimum password length enforced
- [ ] Password change requires current password

✅ **Token Security:**
- [ ] JWT tokens expire
- [ ] Tokens stored securely
- [ ] Tokens validated on each request

✅ **API Security:**
- [ ] Protected endpoints require authentication
- [ ] CORS properly configured
- [ ] SQL injection prevented (using ORM)
- [ ] XSS prevented (React escapes by default)

✅ **Input Validation:**
- [ ] All inputs validated
- [ ] Error messages don't leak info
- [ ] File uploads restricted (if implemented)

---

## Automated Testing (Future)

### Backend Tests (pytest)

```bash
# Install pytest
pip3 install pytest pytest-asyncio httpx

# Run tests
pytest backend/tests/
```

### Frontend Tests (Jest + React Testing Library)

```bash
# Install testing libraries
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

---

## Test Report Template

```markdown
# Test Report - Fast-Dropship
Date: [Date]
Tester: [Name]
Version: 1.0.0

## Summary
- Total Tests: X
- Passed: X
- Failed: X
- Skipped: X

## Failed Tests
1. [Test Name]
   - Expected: [Expected result]
   - Actual: [Actual result]
   - Steps to reproduce: [Steps]

## Notes
[Any additional observations]

## Recommendations
[Suggested improvements]
```

---

## Success Criteria

All tests pass when:
- ✅ Backend API responds correctly
- ✅ Frontend loads without errors
- ✅ All CRUD operations work
- ✅ Authentication flow works
- ✅ Data displays correctly
- ✅ Charts render properly
- ✅ Mobile responsive
- ✅ No console errors
- ✅ Performance acceptable
- ✅ Security measures in place

🎉 **Ready for Production!**