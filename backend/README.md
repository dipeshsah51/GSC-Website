# Genting Services & Contracting W.L.L. — Backend API

Production-ready REST API built with Node.js, Express, MongoDB/Mongoose, and JWT authentication for Genting Services & Contracting W.L.L. (Doha, Qatar).

---

## 🚀 Features

- **Quote Requests (`/api/quotes`)**:
  - `POST /api/quotes`: Submit quotation requests with auto-generated reference ticket (`GSC-XXXXXX`).
  - `GET /api/quotes/track/:referenceId`: Real-time public tracking of proposal status.
  - `GET /api/quotes`: Admin list with status filtering, search, and pagination (Protected).
  - `PATCH /api/quotes/:id`: Admin update for approval status, internal notes, and budget estimates (Protected).
  - `DELETE /api/quotes/:id`: Admin removal of quote records (Protected).

- **Contact Inquiries (`/api/contacts`)**:
  - `POST /api/contacts`: Public messaging and service inquiries.
  - `GET /api/contacts`: Admin inbox with status workflow (`New`, `In Progress`, `Resolved`, `Archived`) (Protected).
  - `PATCH /api/contacts/:id`: Admin status updates (Protected).
  - `DELETE /api/contacts/:id`: Admin deletion (Protected).

- **Projects & Portfolio (`/api/projects`)**:
  - `GET /api/projects`: Query landmark Qatar projects by division or featured status.
  - `GET /api/projects/:id`: Detailed view of a single project.
  - `POST /api/projects`: Add new projects with photo attachment using Multer (Protected).
  - `PATCH /api/projects/:id`: Update existing project records (Protected).
  - `DELETE /api/projects/:id`: Delete project item (Protected).

- **Authentication & Security (`/api/auth`)**:
  - `POST /api/auth/login`: Admin login returning JWT Bearer token.
  - `POST /api/auth/register`: Create new administrator account.
  - `GET /api/auth/me`: Current authenticated session profile (Protected).

- **Resilient Fallback Mode**:
  - Automatically connects to MongoDB if running.
  - If MongoDB is offline, gracefully engages the built-in local JSON data repository so developers can run and test everything out of the box without setup friction!

---

## 🔑 Default Administrator Credentials

| Field | Value |
|---|---|
| **Email** | `admin@gsc-qatar.com` |
| **Password** | `admin123456` |
| **Role** | `admin` |

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm.cmd install
```

### 2. Environment Variables (`.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/gsc_website_db
JWT_SECRET=gsc_qatar_jwt_super_secret_key_2026
NODE_ENV=development
```

### 3. Start Development Server
```bash
npm.cmd run dev
# or for standard start:
npm.cmd start
```

### 4. Seed MongoDB (Optional)
```bash
npm.cmd run seed
```

---

## 🩺 Health Check

Test server status at:
```http
GET http://localhost:5000/api/health
```
Example response:
```json
{
  "status": "ok",
  "timestamp": "2026-10-01T15:26:02.252Z",
  "uptime": "57 seconds",
  "database": {
    "connected": false,
    "status": "Local Storage Mode (Active)"
  },
  "system": "GSC Doha API Node.js Service"
}
```
