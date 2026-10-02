# Genting Services & Contracting W.L.L. (GSC) — Official Web Application

Complete corporate web application and backend system for **Genting Services & Contracting W.L.L.**, located at Building 69, Zone 26, Street 840, Al Bateel Tower, B Ring Road, Doha, Qatar.

---

## 🏗️ Architecture Overview

The project is structured into two decoupled, high-performance tiers:

```
GSC-Website/
├── frontend/               # React 19 + Vite 8 SPA
│   ├── src/
│   │   ├── assets/         # 7 Doha photorealistic service images & logos
│   │   ├── components/     # Header, Footer, FloatingActions, ErrorBoundary, etc.
│   │   ├── data/           # Centralized company data (websiteData.js)
│   │   ├── pages/          # 14 complete routes (Home, About, Services, Projects, Quote, etc.)
│   │   └── services/       # API client layer (api.js) connecting to Node.js backend
│   └── package.json
│
└── backend/                # Node.js + Express + MongoDB REST API
    ├── config/             # Database connection (db.js)
    ├── controllers/        # Quote, Contact, Project, Auth controllers
    ├── middleware/         # JWT Auth, Multer file upload, Error handling
    ├── models/             # Mongoose schemas (Quote, Contact, Project, User)
    ├── routes/             # REST route endpoints
    ├── services/           # Resilient storage fallback & seed defaults
    ├── uploads/            # Uploaded project photos and attachments
    ├── .env                # Environment configuration
    ├── server.js           # API Entrypoint (Port 5000)
    └── package.json
```

---

## ⚡ How to Run in VS Code

### 1. Run the Backend API (Port 5000)
Open a terminal in VS Code:
```powershell
cd backend
npm.cmd install
npm.cmd run dev
```
> The API will be active at `http://localhost:5000`  
> Health check: `http://localhost:5000/api/health`

### 2. Run the Frontend (Port 5173)
Open a second terminal in VS Code:
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
> Open your browser at `http://localhost:5173/`

---

## 🌐 Connected Endpoints

| Resource | HTTP Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | Service and database status |
| **Quotes** | `POST` | `/api/quotes` | Submit quotation request (Generates `GSC-XXXXXX`) |
| **Quotes Track** | `GET` | `/api/quotes/track/:ref` | Public proposal tracking by ticket reference |
| **Quotes (Admin)** | `GET` | `/api/quotes` | View and filter all quotation inquiries (Bearer Token) |
| **Contacts** | `POST` | `/api/contacts` | Submit inquiry form message |
| **Contacts (Admin)**| `GET` | `/api/contacts` | View and manage contact messages (Bearer Token) |
| **Projects** | `GET` | `/api/projects` | Fetch Qatar landmark deliverables portfolio |
| **Auth Login** | `POST` | `/api/auth/login` | Administrator authentication |

---

## 🔐 Admin Credentials

- **Email**: `admin@gsc-qatar.com`
- **Password**: `admin123456`

---

## 🌟 Built With
- **Frontend**: React 19, Vite 8, Lucide React, Plus Jakarta Sans & Manrope fonts, Pure CSS Responsive Grid.
- **Backend**: Node.js, Express, MongoDB / Mongoose, JSON Web Tokens (JWT), Multer, BcryptJS.
