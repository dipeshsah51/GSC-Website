# 🚀 Genting Services & Contracting W.L.L. (GSC)
## Production Deployment Guide for `gscqa.loveslife.biz` (InfinityFree / cPanel & MySQL)

This guide walks you through deploying the GSC web application and connecting your MySQL database on **InfinityFree** for your domain **`gscqa.loveslife.biz`**.

---

### 📦 Pre-Packaged Deployment Archive
Your ready-to-upload archive has already been updated and packaged with your account credentials:
📁 **`gsc-deployment-htdocs.zip`** *(6.7 MB)*
- **Frontend**: Full compiled production React SPA (`index.html`, `assets/`, favicon, icons)
- **Backend API**: PHP REST endpoints with JWT authentication and MySQL PDO engine
- **Pre-Configured**: Pre-loaded with account username `if0_43086816` and password `Saah8080`
- **One-Click Installer**: Web setup and connection diagnostic utility at `/api/setup.php`
- **Fallback Resilience**: Auto-switches to local file storage if MySQL is offline

---

### 📋 Account & Connection Overview
- **Domain**: `http://gscqa.loveslife.biz/`
- **Account Username**: `if0_43086816`
- **Account Password**: `Saah8080`
- **Server Home Path**: `/home/vol15_1/infinityfree.com/if0_43086816`
- **Target Folder in File Manager**: 
  - If `gscqa.loveslife.biz` is your account's primary domain: `/htdocs/`
  - If added as a subdomain/addon domain: `/gscqa.loveslife.biz/htdocs/`

---

### Step 1: Create Database in InfinityFree cPanel
1. Log in to your **[InfinityFree Dashboard](https://dash.infinityfree.com/)**.
2. Click on your account **`if0_43086816`**.
3. Under **Database Details**, check and note your **MySQL Hostname**:
   *(Example: `sql105.infinityfree.com`, `sql201.infinityfree.com`, `sql304.infinityfree.com` — each InfinityFree account has a specific SQL host)*.
4. Click **Control Panel (cPanel/vPanel)** -> **MySQL Databases**.
5. In **"Create New Database"**, enter:
   ```
   gsc
   ```
   Click **Create Database**.
6. Your database name will be:
   ```
   if0_43086816_gsc
   ```
   *(Note: The system also auto-detects any database matching `if0_43086816_*`)*.

---

### Step 2: Upload Deployment Package to File Manager
1. In your InfinityFree Dashboard or Control Panel, open **File Manager** (or [filemanager.ai](https://filemanager.ai/new3/index.php)).
2. Navigate into your web folder:
   - Go inside **`htdocs/`** (or `gscqa.loveslife.biz/htdocs/`).
3. If there is a default file like `default2.html` or `index2.html`, delete it.
4. Click **Upload** and upload the zip file:
   👉 **`gsc-deployment-htdocs.zip`**
5. Right-click **`gsc-deployment-htdocs.zip`** and choose **Extract** (into `htdocs/`).
6. You can delete the `.zip` file from the server after extracting.

---

### Step 3: Run One-Click Web Setup & Diagnostics
Once uploaded, you don't even need to manually edit config files!

1. Open your browser and go to:
   👉 **`http://gscqa.loveslife.biz/api/setup.php`**
2. The setup utility will show your current connection status:
   - Enter your assigned **MySQL Hostname** (e.g. `sql105.infinityfree.com` from Step 1).
   - Database name: `if0_43086816_gsc` (pre-filled).
   - Username: `if0_43086816` (pre-filled).
   - Password: `Saah8080` (pre-filled).
3. Click **"⚡ Test & Save MySQL Connection"**.
4. The system will:
   - Connect to MySQL.
   - Automatically initialize all 4 tables (`gsc_users`, `gsc_quotes`, `gsc_contacts`, `gsc_projects`).
   - Automatically seed default Qatar landmark projects and administrator account.
   - Automatically save the verified settings to `config.php`.

*(Alternatively, if you prefer manual configuration: edit `htdocs/api/config.php` in File Manager and set `DB_HOST` to your MySQL Hostname).*

---

### Step 4: Verify Live Website & Admin Portal
Visit your live website to confirm everything is operational:

1. **Public Website**:
   [http://gscqa.loveslife.biz/](http://gscqa.loveslife.biz/)
2. **Quotation Request**:
   [http://gscqa.loveslife.biz/quote](http://gscqa.loveslife.biz/quote) — Submit a test quote (generates ticket `GSC-XXXXXX`).
3. **Track Quotation**:
   [http://gscqa.loveslife.biz/track](http://gscqa.loveslife.biz/track) — Enter reference number to track status.
4. **Admin Portal**:
   [http://gscqa.loveslife.biz/admin](http://gscqa.loveslife.biz/admin)
   - **Email**: `admin@gsc-qatar.com`
   - **Password**: `admin123456`
5. **API Health & Diagnostic JSON**:
   [http://gscqa.loveslife.biz/api/health](http://gscqa.loveslife.biz/api/health)
