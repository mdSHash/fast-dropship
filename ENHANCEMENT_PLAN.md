# Fast-Dropship Enhancement Plan

## Overview
This document outlines the comprehensive enhancements to add advanced financial tracking, tax calculations, monthly resets, and improved user/customer management.

## Phase 1: Database Schema Updates ✅

### 1.1 Order Model Enhancements ✅
- [x] Add `cost` field (order cost/purchase price)
- [x] Add `customer_price` field (price charged to customer)
- [x] Add `taxes` field (taxes and fees)
- [x] Add `profit` field (calculated: customer_price - cost - taxes)
- [x] Add `calculate_profit()` method

### 1.2 Client Model Enhancements ✅
- [x] Add `email` field (unique, indexed)
- [x] Email validation in schemas

### 1.3 New Models ✅
- [x] `MonthlyFinancials` model
  - year, month
  - monthly_profit (resets monthly)
  - monthly_revenue (resets monthly)
  - overall_capital (persists)
  - reset_at timestamp
  
- [x] `BudgetTransaction` model
  - type (addition/withdrawal)
  - account (monthly_profit/overall_capital)
  - amount, description, notes
  - reference_id, created_by
  - transaction_date

## Phase 2: Backend API Development

### 2.1 Update Existing APIs
- [ ] Update Order schemas (add cost, customer_price, taxes, profit)
- [ ] Update Client schemas (add email)
- [ ] Modify order creation to calculate profit automatically
- [ ] Update order completion to affect monthly financials

### 2.2 New API Endpoints

#### Monthly Financials API (`/api/financials`)
- [ ] GET `/current` - Get current month's financials
- [ ] GET `/history` - Get historical monthly data
- [ ] GET `/{year}/{month}` - Get specific month
- [ ] POST `/reset` - Manual monthly reset (admin only)
- [ ] GET `/dashboard` - Dashboard summary

#### Budget Management API (`/api/budget`)
- [ ] GET `/transactions` - List all budget transactions
- [ ] POST `/add` - Add funds to account
- [ ] POST `/withdraw` - Withdraw funds from account
- [ ] GET `/balance` - Get current balances
- [ ] GET `/history` - Transaction history with filters

#### User Management API (`/api/users`)
- [ ] GET `/` - List all users (admin)
- [ ] GET `/{user_id}` - Get user details
- [ ] PUT `/{user_id}` - Update user (email, name)
- [ ] PUT `/{user_id}/password` - Change user password
- [ ] DELETE `/{user_id}` - Delete user (admin)

### 2.3 Background Tasks
- [ ] Create scheduled task for monthly reset
- [ ] Implement automatic capital deduction on order creation
- [ ] Implement automatic profit addition on order completion

## Phase 3: Frontend Development

### 3.1 Update Existing Pages

#### Dashboard Page
- [ ] Replace "Profit" card with "Monthly Profit"
- [ ] Add "Monthly Revenue" card
- [ ] Add "Overall Capital" card
- [ ] Update chart to show monthly trends
- [ ] Add month-end countdown timer

#### Add Order Page
- [ ] Add "Cost" field
- [ ] Add "Customer Price" field
- [ ] Add "Taxes" field
- [ ] Show calculated profit preview
- [ ] Show capital impact warning

#### Order Completed Page
- [ ] Add detailed view modal
- [ ] Show profit breakdown
- [ ] Show tax information
- [ ] Add filtering by date range
- [ ] Add export functionality

#### Clients Page
- [ ] Add email field to form
- [ ] Add email validation
- [ ] Show customer order history
- [ ] Show total revenue per customer
- [ ] Add email uniqueness check

### 3.2 New Pages

#### Budget Management Page (`/budget`)
- [ ] Current balances display
  - Monthly Profit balance
  - Overall Capital balance
- [ ] Add Funds section
  - Select account dropdown
  - Amount input
  - Description/notes
  - Submit button
- [ ] Withdraw Funds section
  - Select account dropdown
  - Amount input
  - Description/notes
  - Submit button
- [ ] Transaction History table
  - Date, Type, Account, Amount, Description
  - Filters: date range, type, account
  - Pagination
  - Export to CSV

#### User Management Page (`/users`)
- [ ] Users list table
- [ ] Add user button
- [ ] Edit user modal
  - Email field
  - Full name field
  - Role selection
- [ ] Change password modal
  - Current password
  - New password
  - Confirm password
- [ ] Delete user confirmation

#### Financial Reports Page (`/reports`)
- [ ] Monthly performance report
- [ ] Profit/loss statement
- [ ] Capital flow analysis
- [ ] Tax summary
- [ ] Export to PDF/Excel

### 3.3 Update Navigation
- [ ] Add "Budget Management" menu item
- [ ] Add "User Management" menu item (admin only)
- [ ] Add "Financial Reports" menu item
- [ ] Update icons

## Phase 4: Business Logic Implementation

### 4.1 Financial Calculations
- [ ] Profit calculation: `customer_price - cost - taxes`
- [ ] Monthly revenue tracking
- [ ] Capital management logic
- [ ] Tax aggregation

### 4.2 Monthly Reset Logic
```python
# Pseudo-code for monthly reset
def monthly_reset():
    current_month = get_current_month_financials()
    
    # Add monthly profit to overall capital
    current_month.overall_capital += current_month.monthly_profit
    
    # Create new month record
    new_month = MonthlyFinancials(
        year=next_month.year,
        month=next_month.month,
        monthly_profit=0,
        monthly_revenue=0,
        overall_capital=current_month.overall_capital
    )
    
    # Mark reset
    current_month.reset_at = now()
    
    save_changes()
```

### 4.3 Order Lifecycle
```python
# When order is created
def create_order(order_data):
    order = Order(**order_data)
    order.calculate_profit()
    
    # Deduct cost from overall capital
    financials = get_current_month_financials()
    financials.overall_capital -= order.cost
    
    save_order(order)
    save_financials(financials)

# When order is completed
def complete_order(order_id):
    order = get_order(order_id)
    order.status = COMPLETED
    order.completed_at = now()
    
    # Add to monthly revenue and profit
    financials = get_current_month_financials()
    financials.monthly_revenue += order.customer_price
    financials.monthly_profit += order.profit
    
    save_order(order)
    save_financials(financials)
```

## Phase 5: Data Migration

### 5.1 Database Migration Script
- [ ] Create migration for new fields
- [ ] Migrate existing orders (set default values)
- [ ] Create initial MonthlyFinancials record
- [ ] Validate data integrity

### 5.2 Seed Data Updates
- [ ] Update seed script with new fields
- [ ] Add sample budget transactions
- [ ] Add sample monthly financials
- [ ] Add emails to clients

## Phase 6: Testing

### 6.1 Backend Tests
- [ ] Test profit calculations
- [ ] Test monthly reset logic
- [ ] Test capital management
- [ ] Test budget transactions
- [ ] Test user management

### 6.2 Frontend Tests
- [ ] Test form validations
- [ ] Test calculations display
- [ ] Test budget operations
- [ ] Test user management
- [ ] Test reports generation

### 6.3 Integration Tests
- [ ] Test complete order flow
- [ ] Test monthly reset process
- [ ] Test budget management flow
- [ ] Test user management flow

## Phase 7: Documentation

### 7.1 Update Documentation
- [ ] Update README with new features
- [ ] Update API documentation
- [ ] Create user guide for new features
- [ ] Update deployment guide
- [ ] Create admin guide

### 7.2 Create New Documentation
- [ ] Financial management guide
- [ ] Monthly reset process guide
- [ ] Budget management guide
- [ ] User management guide

## Implementation Priority

### High Priority (Core Financial Features)
1. Order model updates (cost, customer_price, taxes, profit)
2. MonthlyFinancials model and API
3. Update dashboard with new metrics
4. Update Add Order page
5. Implement order lifecycle logic

### Medium Priority (Budget Management)
6. BudgetTransaction model and API
7. Budget Management page
8. Transaction history
9. Monthly reset logic

### Low Priority (User Management & Reports)
10. User management enhancements
11. Financial reports page
12. Advanced analytics
13. Export functionality

## Timeline Estimate

- **Phase 1**: 1 hour (Database schema) ✅ COMPLETED
- **Phase 2**: 3-4 hours (Backend APIs)
- **Phase 3**: 4-5 hours (Frontend pages)
- **Phase 4**: 2-3 hours (Business logic)
- **Phase 5**: 1 hour (Data migration)
- **Phase 6**: 2-3 hours (Testing)
- **Phase 7**: 1-2 hours (Documentation)

**Total Estimated Time**: 14-19 hours

## Current Status

✅ **Completed:**
- Order model with cost, customer_price, taxes, profit fields
- Client model with email field
- MonthlyFinancials model created
- BudgetTransaction model created
- Models exported in __init__.py

🔄 **In Progress:**
- Creating Pydantic schemas for new models
- Creating API endpoints

⏳ **Pending:**
- Frontend updates
- Business logic implementation
- Testing
- Documentation

## Next Steps

1. Create Pydantic schemas for updated models
2. Create API endpoints for MonthlyFinancials
3. Create API endpoints for BudgetTransaction
4. Update existing order API to handle new fields
5. Update dashboard API to return new metrics
6. Begin frontend updates

---

**Note**: This is a comprehensive enhancement that will significantly improve the financial tracking capabilities of the application. Each phase should be completed and tested before moving to the next phase.