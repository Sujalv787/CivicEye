# CivicEye 👁️ — Citizen Evidence-Based Accountability Platform

> An **independent** platform for citizens to report traffic violations and railway misconduct with photo/video evidence. Authorities review reports before any action is taken. **No challans are issued directly.**

---

## 🗂️ Project Structure

```
CivicEye/
├── backend/          Node.js + Express + MongoDB API
│   ├── config/       DB + Cloudinary config
│   ├── controllers/  Auth, Complaint, Authority logic
│   ├── middleware/   JWT auth, Multer upload, Rate limiter
│   ├── models/       User, Complaint (Mongoose schemas)
│   ├── routes/       auth.js, complaint.js, authority.js
│   ├── utils/        Email, Token generator
│   ├── server.js     Express entry point
│   └── .env.example  Environment variable template
└── frontend/         React + Vite + Tailwind CSS
    └── src/
        ├── api/      Axios instance (with JWT interceptor)
        ├── components/ Sidebar, DashboardLayout, ProtectedRoute
        ├── context/  AuthContext (login/register/logout)
        └── pages/
            ├── LandingPage.jsx
            ├── auth/    Login, Register
            ├── citizen/ Dashboard, ComplaintForm, TrackComplaint
            └── authority/ AuthorityDashboard, ComplaintList, ComplaintDetail
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- Cloudinary account (free tier works)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# → Fill in MONGO_URI, JWT_SECRET, Cloudinary, Email credentials
npm install
npm run dev       # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev       # Starts on http://localhost:5173
```

---

## 🔐 User Roles

| Role | Access |
|------|--------|
| `citizen` | Submit & track complaints |
| `traffic_admin` | View/update traffic complaints |
| `railway_admin` | View/update railway complaints |

> **Admin accounts must be created directly in MongoDB** (set `role` field). Citizens self-register.

### Seed an Admin (MongoDB shell / Atlas)
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "traffic_admin", isVerified: true } })
```

---

## 🌐 API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | Public | Citizen registration |
| POST | `/api/auth/login` | Public | Login (all roles) |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/auth/verify-email/:token` | Public | Email verification |
| POST | `/api/complaints` | JWT (citizen) | Submit complaint + upload |
| GET | `/api/complaints/my` | JWT (citizen) | My complaints |
| GET | `/api/complaints/track/:id` | Public | Track by complaint ID |
| GET | `/api/authority/complaints` | JWT (admin) | List all complaints |
| GET | `/api/authority/complaints/:id` | JWT (admin) | Complaint detail |
| PATCH | `/api/authority/complaints/:id/status` | JWT (admin) | Update status + remark |
| GET | `/api/authority/analytics` | JWT (admin) | Stats + 7-day trend |

---

## 🔄 Complaint Status Flow

```
Pending → Under Review → Approved → Forwarded → Closed
                                   ↘ Rejected
```

---

## 🛡️ Security Features

- **JWT authentication** with 7-day expiry
- **Role-based route guards** (citizen / traffic_admin / railway_admin)
- **Rate limiting**: 10 auth requests / 15 min, 20 complaints / hour
- **Helmet** HTTP security headers
- **Input validation** via express-validator
- **Anonymous ID masking** — citizen identity hidden on request
- **50 MB upload cap**, allowed formats enforced server-side

---

## 🎨 UI Overview

- **Landing page** — Hero, features, how-it-works, CTA
- **Auth pages** — Login + Register with password strength meter
- **Citizen Dashboard** — Stats cards + complaint history table
- **Submit Report** — Type selector, GPS, anonymous toggle, file upload
- **Track Complaint** — Status timeline with progress steps
- **Authority Dashboard** — Totals, category breakdown, 7-day bar chart
- **Complaint List** — Paginated, filterable by type + status
- **Complaint Detail** — Evidence viewer, maps link, status updater, history

---

## 📦 Environment Variables (`.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/civiceye
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...        # Use Gmail App Password
EMAIL_FROM=CivicEye <noreply@civiceye.in>
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

*CivicEye is an independent citizen accountability platform — not affiliated with any government body.*
