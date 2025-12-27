# 🛡️ GearGuard - Maintenance Management System

A comprehensive maintenance management system built for the **Odoo Hackathon (27th Dec)**. GearGuard helps organizations track equipment, manage maintenance requests, and coordinate maintenance teams efficiently.

![GearGuard](https://img.shields.io/badge/GearGuard-Maintenance%20Management-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql)

## 🚀 Features

### Dashboard & Analytics
- **Kanban Board** - Drag-and-drop maintenance request management
- **Real-time Stats** - Critical equipment, technician load, open requests
- **Reporting Dashboard** - Analytics and insights for maintenance operations

### Equipment Management
- Complete CRUD operations for equipment
- Equipment categories with responsible person assignment
- Equipment health tracking

### Maintenance Requests
- Create and manage maintenance requests
- Stage-based workflow (New → In Progress → Repaired → Scrap)
- Priority levels (Low, Medium, High, Urgent)
- Equipment or Work Center based maintenance

### Maintenance Calendar
- Visual calendar view of scheduled maintenance
- Color-coded events by priority
- Month, Week, Day, and Agenda views

### Team Management
- Create and manage maintenance teams
- Assign team members
- Track team assignments

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL 18 |
| **UI Components** | Lucide React Icons, React Big Calendar, React DnD |

## �️ Database Design

The database schema is designed to support comprehensive maintenance management with proper relationships between entities.

**📊 View Interactive Database Diagram:** [DrawSQL - GearGuard Schema](https://drawsql.app/teams/odoo-hacks-1/diagrams/prisma-sql)

### Key Entities
- **app_user** - System users (technicians, admins)
- **equipment** - Tracked equipment with categories
- **maintenance_request** - Maintenance tickets with stages and priorities
- **maintenance_team** - Teams with member assignments
- **work_center** - Production work centers
- **company** / **department** - Organizational structure

## �📁 Project Structure

```
GearGuard/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable components (DashboardNavbar, etc.)
│   │   ├── pages/          # Page components
│   │   │   ├── dashboard/  # Dashboard pages
│   │   │   └── ...         # Auth pages (Login, Signup, etc.)
│   │   └── App.tsx         # Main application with routing
│   └── package.json
│
├── backend/                # Express backend API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   │   ├── auth.ts     # Authentication
│   │   │   ├── dashboard.ts# Dashboard data
│   │   │   ├── equipment.ts# Equipment CRUD
│   │   │   ├── categories.ts# Equipment categories
│   │   │   ├── teams.ts    # Team management
│   │   │   └── maintenance.ts
│   │   ├── config/         # Database configuration
│   │   └── server.ts       # Express server entry
│   └── package.json
│
└── gearguard_workbench_pg18.sql  # Database schema
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 18
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/GearGuard.git
cd GearGuard
```

### 2. Set up the database
```bash
# Create database
createdb gearguard

# Import schema
psql -d gearguard -f gearguard_workbench_pg18.sql
```

### 3. Configure environment variables
Create a `.env` file in the `backend` folder:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/gearguard
JWT_SECRET=your_jwt_secret_key
```

### 4. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Start the application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Access the application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | User registration |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/dashboard/requests` | Get maintenance requests |
| `GET` | `/api/dashboard/stats` | Get dashboard statistics |
| `GET` | `/api/dashboard/equipment` | Get equipment list |
| `GET` | `/api/dashboard/calendar` | Get calendar events |
| `GET` | `/api/categories` | Get equipment categories |
| `GET` | `/api/teams` | Get maintenance teams |
| `PATCH` | `/api/dashboard/requests/:id/stage` | Update request stage |

## 👥 Team - Fantastic 4

Built with ❤️ for the Odoo Hackathon

## 📄 License

This project is licensed under the MIT License.
