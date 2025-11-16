# 🚀 Fast-Dropship

<div align="center">

![Fast-Dropship Logo](https://img.shields.io/badge/Fast--Dropship-Business%20Management-purple?style=for-the-badge&logo=shopify)

**A Modern Business Management Dashboard for E-commerce & Dropshipping Operations**

[![Python](https://img.shields.io/badge/Python-3.11+-blue?style=flat-square&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🎯 Overview

**Fast-Dropship** is a comprehensive business management dashboard designed specifically for e-commerce and dropshipping businesses. It provides a complete solution for managing clients, orders, deliveries, and financial tracking with a modern, intuitive interface.

### Why Fast-Dropship?

- 🎨 **Beautiful UI**: Modern glassmorphism design with purple/cyan gradients
- 👥 **Multi-User Support**: Role-based access control (Admin & User roles)
- 📊 **Real-time Analytics**: Live dashboard with KPIs and performance charts
- 🔒 **Secure**: JWT authentication with password hashing
- 📱 **Responsive**: Works seamlessly on desktop, tablet, and mobile
- ⚡ **Fast**: Built with Next.js 14 and FastAPI for optimal performance
- 🌐 **Easy Deployment**: Ready for Vercel, Railway, or any cloud platform

---

## ✨ Features

### 🏠 Dashboard
- **Real-time KPIs**: Profit, Capital, Client Count, Ongoing Orders
- **Performance Charts**: Monthly trends with interactive visualizations
- **Recent Activity**: Last 10 clients and orders at a glance
- **Role-based Views**: Admins see all data, users see their own

### 👥 Client Management
- Add, edit, and delete clients
- Store contact information (name, phone, email, location)
- Search and filter capabilities
- Track client order history

### 📦 Order Management
- **Create Orders**: Link orders to clients with detailed information
- **Order Tracking**: Separate views for pending and completed orders
- **Financial Tracking**: Cost, customer price, taxes, and profit calculations
- **Order Assignment**: Admins can assign orders to specific users
- **Bulk Operations**: Edit and manage multiple orders efficiently

### 🚚 Delivery Tracking
- Create and manage deliveries
- Track delivery status (Pending, In Transit, Delivered, Failed)
- Link deliveries to orders
- Delivery address management

### 💬 Client Notes (Chat)
- Internal notes system for each client
- Track communication history
- Searchable note archive

### 💰 Budget & Transactions
- Income and expense tracking
- Transaction categorization
- Financial reports and summaries
- Monthly financial analysis

### 📅 Historical Data
- Previous months' performance
- Comparative analytics
- Export capabilities

### 🔐 User Management (Admin Only)
- Create and manage user accounts
- Assign roles (Admin/User)
- Monitor user activity
- Password management

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **Charts**: Recharts
- **HTTP Client**: Axios
- **State Management**: React Hooks

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: SQLite (easily upgradable to PostgreSQL)
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Passlib with bcrypt
- **Validation**: Pydantic

### DevOps
- **Version Control**: Git
- **Package Management**: npm (frontend), pip (backend)
- **Environment**: python-dotenv
- **CORS**: FastAPI CORS middleware

---

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/0F172A/FFFFFF?text=Dashboard+View)

### Order Management
![Orders](https://via.placeholder.com/800x400/0F172A/FFFFFF?text=Order+Management)

### Client Management
![Clients](https://via.placeholder.com/800x400/0F172A/FFFFFF?text=Client+Management)

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Git**

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/fast-dropship.git
cd fast-dropship
```

2. **Backend Setup**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Initialize database with seed data
python seed_data.py

# Start the backend server
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

3. **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Default Credentials

After running the seed script, you can login with:

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Regular User Account:**
- Username: `test`
- Password: `test123`

⚠️ **Important**: Change these passwords in production!

---

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL=sqlite:///./fastdropship.db

# JWT Settings
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend Configuration

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📖 Usage

### Creating Your First Order

1. **Add a Client**
   - Navigate to "Clients" page
   - Click "Add New Client"
   - Fill in client details
   - Save

2. **Create an Order**
   - Go to "Add Order" page
   - Select the client
   - Enter order details (name, link, quantity)
   - Set financial information (cost, customer price, taxes)
   - Assign to a user (admin only)
   - Submit

3. **Track the Order**
   - View in "Order Pending" page
   - Edit if needed
   - Mark as completed when done

4. **Create Delivery**
   - Go to "Delivery" page
   - Create delivery for the order
   - Track delivery status

### User Roles

**Admin Users Can:**
- View all data across all users
- Create and manage users
- Assign orders to users
- Access all features

**Regular Users Can:**
- View their own data
- View orders assigned to them
- Create and manage their clients
- Create and manage their orders
- Track their deliveries

---

## 📚 API Documentation

### Authentication Endpoints

```http
POST /auth/register
POST /auth/login
POST /auth/change-password
```

### Client Endpoints

```http
GET    /clients
POST   /clients
GET    /clients/{id}
PUT    /clients/{id}
DELETE /clients/{id}
```

### Order Endpoints

```http
GET    /orders
POST   /orders
GET    /orders/pending
GET    /orders/completed
GET    /orders/{id}
PUT    /orders/{id}
DELETE /orders/{id}
```

### Delivery Endpoints

```http
GET    /deliveries
POST   /deliveries
GET    /deliveries/{id}
PUT    /deliveries/{id}
DELETE /deliveries/{id}
```

### Dashboard Endpoints

```http
GET /dashboard/stats
GET /dashboard/monthly-stats
```

For complete API documentation, visit `http://localhost:8000/docs` when the backend is running.

---

## 📁 Project Structure

```
fast-dropship/
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── core/          # Core functionality (auth, config)
│   │   └── main.py        # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   ├── seed_data.py       # Database seeding script
│   └── .env.example       # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   │   ├── (auth)/    # Authentication pages
│   │   │   └── (dashboard)/ # Dashboard pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities and API client
│   │   └── types/         # TypeScript types
│   ├── public/            # Static assets
│   ├── package.json       # Node dependencies
│   └── .env.example       # Environment variables template
│
├── docs/                  # Documentation files
├── README.md              # This file
└── LICENSE                # MIT License
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 🐛 Known Issues & Fixes

### Recent Fixes (v1.1.0)

✅ **Quantity Multiplication Issue** - Fixed quantity incorrectly multiplying financial values  
✅ **Assigned Orders Visibility** - Users can now see orders assigned to them by admins

See [`QUANTITY_AND_ASSIGNMENT_FIXES.md`](QUANTITY_AND_ASSIGNMENT_FIXES.md) for details.

---

## 🗺️ Roadmap

- [ ] PostgreSQL support
- [ ] Email notifications
- [ ] PDF invoice generation
- [ ] Advanced reporting
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Bulk import/export
- [ ] API rate limiting
- [ ] Two-factor authentication

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

### Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Troubleshooting](TROUBLESHOOTING.md)

### Get Help

- 📧 Email: support@fastdropship.com
- 💬 Discord: [Join our community](https://discord.gg/fastdropship)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/fast-dropship/issues)
- 📖 Wiki: [Project Wiki](https://github.com/yourusername/fast-dropship/wiki)

---

## 🙏 Acknowledgments

- Built with ❤️ by [Your Name]
- Icons by [Lucide](https://lucide.dev/)
- UI inspiration from modern SaaS dashboards
- Special thanks to all contributors

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/fast-dropship?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/fast-dropship?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/fast-dropship)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/fast-dropship)

---

<div align="center">

**[⬆ Back to Top](#-fast-dropship)**

Made with 💜 by the Fast-Dropship Team

</div>