# Laundry Management System 🧺

A complete, full-stack Laundry & Valet Management Ecosystem featuring:
- **Frontend:** Next.js 16 Web Application with high-end Editorial Magazine UI
- **Backend:** PHP 8.2 REST API with JWT Authentication & Docker support
- **Database:** MySQL database schema with complete migrations, seeders, and SQL dump
- **Desktop Admin Suite:** .NET 8 WPF Desktop Application for real-time order, customer, and catalog management

---

## 📁 Repository Structure
```
laundry-management-system/
├── frontend/             # Next.js 16 Web Application & Editorial Magazine UI
│   ├── app/              # App router pages (Customer portal, Admin portal, Public editorial)
│   ├── components/       # UI components & magazine layout
│   ├── public/images/    # Bespoke editorial garment photography
│   └── admin-desktop-app/# .NET 8 WPF Desktop Admin Source Code
├── backend/              # PHP 8.2 REST API & Database
│   ├── public/           # Entry point (index.php)
│   ├── src/              # Controllers, Models, Core Router, Middleware
│   ├── database/         # SQL migrations, seeders, and full export dump
│   └── Dockerfile        # Production Docker configuration for Render
└── README.md
```

---

## 🚀 Deployment Instructions

### 1. Backend on Render (Web Service)
- **Root Directory:** `backend`
- **Environment:** `Docker`
- Set environment variables: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, `FRONTEND_URL`.

### 2. Frontend on Vercel
- **Root Directory:** `frontend`
- **Framework Preset:** `Next.js`
- Set environment variable: `NEXT_PUBLIC_API_URL` to your Render backend URL.

### 3. Database on TiDB Cloud / Cloud MySQL
- Import `backend/database/laundry_db_full_export.sql`.
