# 🚀 Genting Services & Contracting W.L.L. (GSC)
## Deployment Guide for `gscqa.loveslife.biz` (InfinityFree / cPanel Server & MySQL Database)

This guide walks you through deploying the GSC web application and connecting it to your server MySQL database on **InfinityFree / loveslife.biz** via the web file manager (**filemanager.ai**).

---

### 📦 Pre-Packaged Deployment Archive
Your ready-to-upload archive has already been created in this folder:
📁 **`gsc-deployment-htdocs.zip`** *(6.7 MB - contains the compiled frontend, PHP REST API, Apache `.htaccess` rewrite rules, and database schema)*

---

### Step 1: Set Up MySQL Database on InfinityFree
InfinityFree shared hosting uses MySQL (MariaDB).

1. Log in to your **[InfinityFree Dashboard](https://dash.infinityfree.com/)**.
2. Select your hosting account for `gscqa.loveslife.biz` and click **Control Panel (cPanel/vPanel)**.
3. Under the **Databases** section, click **MySQL Databases**.
4. In "Create New Database", enter a name like `gsc` and click **Create Database**.
5. Note down your MySQL connection credentials displayed on that page:
   - **MySQL Hostname**: *(e.g., `sql100.infinityfree.com` or similar)*
   - **MySQL Database Name**: *(e.g., `if0_XXXXXX_gsc`)*
   - **MySQL Username**: *(e.g., `if0_XXXXXX`)*
   - **MySQL Password**: *(Your account / vPanel password)*

---

### Step 2: Import Database Schema (phpMyAdmin)
1. On the **MySQL Databases** page, click the **phpMyAdmin** link next to your newly created database.
2. In phpMyAdmin, click the **Import** tab in the top navigation.
3. Click **Choose File** and select:
   `server-php/database.sql` (or `htdocs/api/database.sql`)
4. Scroll to the bottom and click **Go** (or **Import**).
5. All 4 tables (`gsc_users`, `gsc_quotes`, `gsc_contacts`, `gsc_projects`) along with default Qatar landmark projects and the admin login will be created automatically!

---

### Step 3: Upload to File Manager (`filemanager.ai`)
1. In your InfinityFree Dashboard or Control Panel, open **File Manager** (or go to `https://filemanager.ai/new3/index.php`).
2. Navigate into the **`htdocs/`** directory.
3. If there are default placeholder files (like `default2.html` or `index2.html`), delete them.
4. Click the **Upload** button (or drag and drop) and upload:
   👉 **`gsc-deployment-htdocs.zip`**
5. Once uploaded, right-click `gsc-deployment-htdocs.zip` and select **Extract** (extract into `htdocs/`).
6. You can now delete the `.zip` file from the server.

---

### Step 4: Configure Database Connection (`config.php`)
1. In File Manager, navigate to `htdocs/api/`.
2. Right-click **`config.php`** and select **Edit**.
3. Replace the placeholder values with your real InfinityFree MySQL credentials from Step 1:
   ```php
   define('DB_HOST', 'sql100.infinityfree.com'); // Your MySQL Hostname
   define('DB_NAME', 'if0_XXXXXX_gsc');          // Your Database Name
   define('DB_USER', 'if0_XXXXXX');              // Your MySQL Username
   define('DB_PASS', 'your_password_here');      // Your Hosting Password
   ```
4. Click **Save** (disk icon).

> 💡 **Built-in Resilience**: If the database is ever offline or credentials are not yet entered, the API automatically falls back to secure local file storage in `api/data/` so quote submissions never fail!

---

### Step 5: Test Your Live Website
Open your browser and visit:
1. **Public Website**: `http://gscqa.loveslife.biz/`
2. **Quotation Request**: Submit a test quotation at `http://gscqa.loveslife.biz/quote` (generates ticket `GSC-XXXXXX`).
3. **Quotation Tracking**: Track your quote at `http://gscqa.loveslife.biz/track`.
4. **Admin Portal**: Go to `http://gscqa.loveslife.biz/admin`
   - **Email**: `admin@gsc-qatar.com`
   - **Password**: `admin123456`
5. **System Health Status**: Check `http://gscqa.loveslife.biz/api/health` to confirm the database engine status is active.
