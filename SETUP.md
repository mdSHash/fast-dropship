# Fast-Dropship Setup Guide

This guide will help you set up and run the Fast-Dropship application.

## Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- npm or yarn

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create and activate virtual environment

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Create environment file
```bash
cp .env.example .env
```

Edit `.env` and update the SECRET_KEY:
```
SECRET_KEY=your-super-secret-key-change-this-in-production
```

### 5. Run the backend server
```bash
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

API Documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 6. Create first user (Optional)

You can create a user via the API:

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

## Frontend Setup

### 1. Navigate to frontend directory (in a new terminal)
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
```bash
cp .env.example .env.local
```

The default configuration should work:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Run the development server
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## First Time Usage

1. Open `http://localhost:3000` in your browser
2. You'll be redirected to the login page
3. If you haven't created a user yet, register a new account
4. After logging in, you'll see the dashboard

## Project Structure

```
Fast-Dropship/
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Core functionality
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── main.py      # FastAPI app
│   └── requirements.txt
│
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/        # Next.js 14 app directory
│   │   ├── components/ # React components
│   │   ├── lib/        # Utilities
│   │   └── types/      # TypeScript types
│   └── package.json
│
└── README.md
```

## Features

### Implemented Features

✅ **Authentication System**
- User registration and login
- JWT token-based authentication
- Password change functionality

✅ **Client Management**
- Add, edit, delete clients
- Search clients
- View client details with notes

✅ **Order Management**
- Create orders linked to clients
- Track pending and completed orders
- Update order status

✅ **Delivery Tracking**
- Create deliveries for orders
- Track delivery status
- Assign drivers

✅ **Financial Management**
- Record income and expenses
- Track transactions by category
- View profit and capital

✅ **Dashboard**
- KPI cards (Profit, Capital, Clients, Orders)
- Monthly performance charts
- Recent clients and orders

### Pages

- `/dashboard` - Home dashboard with statistics
- `/clients` - Client management
- `/add-order` - Create new orders
- `/order-pending` - View pending orders
- `/order-completed` - View completed orders
- `/delivery` - Delivery tracking
- `/chat` - Client notes (acts as a notes system)
- `/transactions` - Budget and transaction management
- `/previous-months` - Historical data
- `/change-password` - Change user password

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (form data)
- `POST /api/auth/login-json` - Login (JSON)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create client
- `GET /api/clients/{id}` - Get client
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client

### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders/pending` - List pending orders
- `GET /api/orders/completed` - List completed orders
- `POST /api/orders` - Create order
- `PUT /api/orders/{id}` - Update order
- `DELETE /api/orders/{id}` - Delete order

### Deliveries
- `GET /api/deliveries` - List all deliveries
- `POST /api/deliveries` - Create delivery
- `PUT /api/deliveries/{id}` - Update delivery
- `DELETE /api/deliveries/{id}` - Delete delivery

### Transactions
- `GET /api/transactions` - List all transactions
- `GET /api/transactions/summary` - Get financial summary
- `GET /api/transactions/monthly` - Get monthly data
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Dashboard
- `GET /api/dashboard` - Get all dashboard data
- `GET /api/dashboard/stats` - Get statistics only

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**Database issues:**
Delete the database file and restart:
```bash
rm fastdropship.db
uvicorn app.main:app --reload
```

### Frontend Issues

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Module not found errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

1. **Backend changes:** The server auto-reloads with `--reload` flag
2. **Frontend changes:** Next.js has hot module replacement
3. **Database:** SQLite database file is created automatically
4. **API Testing:** Use the Swagger UI at `/docs` for testing endpoints

## Production Deployment

### Backend (Railway/Render)
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables
4. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set `NEXT_PUBLIC_API_URL` to your backend URL
4. Deploy

## Support

For issues or questions, please check:
- Backend API docs: `http://localhost:8000/docs`
- Project README: `README.md`