# Multi-User System Implementation Guide

## Overview
This document outlines the implementation of a role-based access control (RBAC) system for Fast-Dropship, allowing multiple users with different permission levels.

## User Roles

### Admin Role
- **Full Access**: Can view and manage all data across the system
- **User Management**: Can create, edit, and delete user accounts
- **Global Dashboard**: Sees aggregated data from all users
- **Financial Management**: Full access to budget and financial features
- **All Clients & Orders**: Can view and manage all clients and orders

### User Role
- **Limited Access**: Can only view and manage their own data
- **Personal Dashboard**: Sees only their own statistics and data
- **Own Clients**: Can only view/edit clients they created
- **Own Orders**: Can only view/edit orders they created
- **No User Management**: Cannot access user management features
- **Limited Financial Access**: Can see their own profit/revenue only

## Database Schema Changes

### 1. User Model Updates ✅ COMPLETED
```python
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class User(Base):
    # ... existing fields ...
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
```

### 2. Client Model Updates ✅ COMPLETED
```python
class Client(Base):
    # ... existing fields ...
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    creator = relationship("User", foreign_keys=[created_by])
```

### 3. Order Model Updates ✅ COMPLETED
```python
class Order(Base):
    # ... existing fields ...
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    creator = relationship("User", foreign_keys=[created_by])
```

## API Changes Required

### 1. Authentication Updates
- Add `role` field to JWT token payload
- Add `is_active` check during login
- Return user role in login response

### 2. Authorization Middleware
Create helper functions:
```python
def require_admin(current_user: User):
    """Decorator to require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")

def get_user_filter(current_user: User, model):
    """Return filter for user's own data"""
    if current_user.role == UserRole.ADMIN:
        return None  # No filter, see all
    return model.created_by == current_user.id
```

### 3. Client API Updates
**GET /api/clients**
- Admin: Returns all clients
- User: Returns only clients where `created_by = current_user.id`

**POST /api/clients**
- Automatically set `created_by = current_user.id`

**PUT /api/clients/{id}**
- Admin: Can edit any client
- User: Can only edit if `created_by = current_user.id`

**DELETE /api/clients/{id}**
- Admin: Can delete any client
- User: Can only delete if `created_by = current_user.id`

### 4. Order API Updates
**GET /api/orders**
- Admin: Returns all orders
- User: Returns only orders where `created_by = current_user.id`

**POST /api/orders**
- Automatically set `created_by = current_user.id`
- Validate that selected client belongs to user

**PUT /api/orders/{id}**
- Admin: Can edit any order
- User: Can only edit if `created_by = current_user.id`

**DELETE /api/orders/{id}**
- Admin: Can delete any order
- User: Can only delete if `created_by = current_user.id`

### 5. Dashboard API Updates
**GET /api/dashboard**
- Admin: Shows aggregated data from all users
- User: Shows only their own data (filtered by created_by)

### 6. Financial API Updates
**GET /api/financials/current**
- Admin: Shows global financial data
- User: Shows only their contribution to monthly financials

### 7. New User Management API
**GET /api/users** (Admin only)
- List all users with their roles and status

**POST /api/users** (Admin only)
- Create new user account
- Set role and initial password

**PUT /api/users/{id}** (Admin only)
- Update user details, role, or active status

**DELETE /api/users/{id}** (Admin only)
- Deactivate or delete user account

**POST /api/users/{id}/reset-password** (Admin only)
- Reset user password

## Frontend Changes Required

### 1. TypeScript Types
```typescript
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}
```

### 2. Auth Context Updates
- Store user role in context
- Add `isAdmin` helper function
- Add role-based route protection

### 3. Sidebar Navigation
- Show "Users" link only for admin users
- Conditionally show/hide features based on role

### 4. New Users Management Page
**Location:** `/users`
**Features:**
- List all users in a table
- Add new user button (opens modal)
- Edit user (role, active status)
- Reset password
- Delete/deactivate user

**Table Columns:**
- Username
- Email
- Role (badge)
- Status (Active/Inactive badge)
- Created Date
- Actions (Edit, Reset Password, Delete)

### 5. Dashboard Updates
- Show role-specific data
- Admin sees "All Users" stats
- Regular users see "My Stats"

### 6. Client/Order Pages
- Filter data based on user role
- Show creator information for admin

## Migration Strategy

### Step 1: Database Migration
```sql
-- Add role and is_active to users table
ALTER TABLE users ADD COLUMN role VARCHAR(10) DEFAULT 'user' NOT NULL;
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL;

-- Update existing admin user
UPDATE users SET role = 'admin' WHERE username = 'admin';

-- Add created_by to clients table
ALTER TABLE clients ADD COLUMN created_by INTEGER NOT NULL DEFAULT 1;
ALTER TABLE clients ADD FOREIGN KEY (created_by) REFERENCES users(id);
CREATE INDEX idx_clients_created_by ON clients(created_by);

-- Add created_by to orders table
ALTER TABLE orders ADD COLUMN created_by INTEGER NOT NULL DEFAULT 1;
ALTER TABLE orders ADD FOREIGN KEY (created_by) REFERENCES users(id);
CREATE INDEX idx_orders_created_by ON orders(created_by);
```

### Step 2: Update Seed Data
- Set admin user role to ADMIN
- Assign all existing clients/orders to admin user

### Step 3: Deploy Backend Changes
1. Update models
2. Update API endpoints with filtering
3. Add user management endpoints
4. Test with existing data

### Step 4: Deploy Frontend Changes
1. Update TypeScript types
2. Update auth context
3. Create Users management page
4. Update sidebar navigation
5. Test role-based access

## Security Considerations

1. **JWT Token**: Include role in token payload
2. **API Validation**: Always verify user ownership on updates/deletes
3. **SQL Injection**: Use parameterized queries (SQLAlchemy handles this)
4. **Password Security**: Use bcrypt for password hashing
5. **Session Management**: Implement token expiration
6. **Audit Trail**: Log user actions for security monitoring

## Testing Checklist

### Admin User Tests
- [ ] Can view all clients
- [ ] Can view all orders
- [ ] Can edit any client/order
- [ ] Can delete any client/order
- [ ] Can access user management
- [ ] Can create new users
- [ ] Can edit user roles
- [ ] Can deactivate users
- [ ] Dashboard shows all data

### Regular User Tests
- [ ] Can only view own clients
- [ ] Can only view own orders
- [ ] Cannot edit others' clients
- [ ] Cannot edit others' orders
- [ ] Cannot access user management
- [ ] Dashboard shows only own data
- [ ] Cannot see other users' data in API responses

### Security Tests
- [ ] Non-admin cannot access /api/users
- [ ] User cannot modify created_by field
- [ ] User cannot access other users' data via API
- [ ] Inactive users cannot login
- [ ] Token includes correct role
- [ ] Role changes require re-login

## Implementation Priority

### Phase 1: Backend Foundation (Current)
1. ✅ Update User model with role and is_active
2. ✅ Update Client model with created_by
3. ✅ Update Order model with created_by
4. ⏳ Update authentication to include role
5. ⏳ Create authorization helpers

### Phase 2: API Updates
6. ⏳ Update Client API with filtering
7. ⏳ Update Order API with filtering
8. ⏳ Update Dashboard API with filtering
9. ⏳ Create User Management API

### Phase 3: Frontend Implementation
10. ⏳ Update TypeScript types
11. ⏳ Update auth context
12. ⏳ Create Users management page
13. ⏳ Update sidebar navigation
14. ⏳ Add role-based UI elements

### Phase 4: Testing & Deployment
15. ⏳ Database migration
16. ⏳ Update seed data
17. ⏳ Integration testing
18. ⏳ Deploy to production

## Notes

- All existing data will be assigned to the admin user during migration
- New users will have USER role by default
- Only admins can change user roles
- Inactive users cannot login but their data remains
- Deleting a user should transfer their data to admin or mark as orphaned

## Support

For questions or issues during implementation, refer to:
- FastAPI documentation: https://fastapi.tiangolo.com/
- SQLAlchemy documentation: https://docs.sqlalchemy.org/
- JWT authentication: https://jwt.io/

---

**Status:** Phase 1 - Backend Foundation (In Progress)
**Last Updated:** 2025-11-15
**Next Steps:** Complete authentication updates and create authorization helpers