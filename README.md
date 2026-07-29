# Woven Project — Client Partner Portal

Local installation and setup guide for running this application on your machine **without Docker**.

---

## 📋 Prerequisites

Ensure your machine has the following installed:

| Requirement | Minimum Version |
|-------------|----------------|
| Node.js     | v20.x or higher (LTS) |
| npm         | v10.x or higher |
| PostgreSQL  | v15.x or v16.x |
| Git         | Any recent version |

---

## 🛠️ Step 1: Install Prerequisites

### 💻 Windows

1. **Node.js**
   - Download the Windows Installer (`.msi`) from [nodejs.org](https://nodejs.org/) — choose the **LTS** version.
   - During installation, check the box to **Add Node.js to PATH**.
   - Verify installation:
     ```powershell
     node -v
     npm -v
     ```

2. **PostgreSQL**
   - Download the installer from [EnterpriseDB PostgreSQL Downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).
   - Run the installer with these settings:
     - Default port: `5432`
     - Set a password for the `postgres` superuser (remember this — e.g. `password123`)
     - Include **pgAdmin 4** (the database GUI)
   - Close the Stack Builder wizard at the end (not required).

3. **Git**
   - Download and install from [git-scm.com](https://git-scm.com/download/win).

---

### 🍏 macOS

1. **Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Node.js & Git**:
   ```bash
   brew install node git
   # Verify
   node -v && npm -v && git --version
   ```

3. **PostgreSQL** — choose one option:

   **Option A — Homebrew (Recommended):**
   ```bash
   brew install postgresql@16
   brew services start postgresql@16
   # Verify
   psql --version
   ```

   **Option B — Postgres.app:**
   - Download [Postgres.app](https://postgresapp.com/) and drag it to `/Applications`.
   - Open the app and click **Initialize**.
   - Follow the on-screen instructions to add `psql` to your shell `PATH`.

---

## 🗄️ Step 2: Create the Database

The application requires a PostgreSQL database named `wovn_web_db`.

### Via Terminal / Command Prompt (All platforms):
```bash
# Connect to PostgreSQL as the postgres superuser
psql -U postgres -h localhost

# Inside the psql prompt, run:
CREATE DATABASE wovn_web_db;

# Exit psql
\q
```

### Via pgAdmin 4 (Windows GUI):
1. Open **pgAdmin 4** from the Start Menu.
2. Enter the superuser password set during installation.
3. In the left panel: **Servers** → **PostgreSQL** → right-click **Databases** → **Create** → **Database...**
4. Name it `wovn_web_db` and click **Save**.

---

## 📂 Step 3: Get the Project

**Option A — Clone from Git:**
```bash
git clone <repository-url> woven_projects-main
cd woven_projects-main
```

**Option B — From a ZIP archive:**
- Extract the archive to your desired location.
- Open a terminal and navigate into the project folder:
  ```bash
  # macOS / Linux
  cd /path/to/woven_projects-main

  # Windows (PowerShell)
  cd "C:\path\to\woven_projects-main"
  ```

**Install dependencies:**
```bash
npm install
```

---

## ⚙️ Step 4: Configure Environment Variables

1. Create your local `.env` file from the example:

   ```bash
   # macOS / Linux
   cp .env.example .env

   # Windows (PowerShell)
   Copy-Item .env.example .env

   # Windows (Command Prompt)
   copy .env.example .env
   ```

2. Open the `.env` file in your editor and update the database connection string:

   ```env
   DATABASE_URL="postgres://postgres:<YOUR_POSTGRES_PASSWORD>@localhost:5432/wovn_web_db"
   ```
   > Replace `<YOUR_POSTGRES_PASSWORD>` with the password you set during PostgreSQL installation.

3. Ensure all required keys are present (Algolia, Salesforce, session secret):

   ```env
   # Algolia
   NEXT_PUBLIC_ALGOLIA_APP_ID=<your-algolia-app-id>
   NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=<your-algolia-search-key>
   ALGOLIA_ADMIN_KEY=<your-algolia-admin-key>

   # Salesforce OAuth
   SF_CLIENT_ID=<your-salesforce-client-id>
   SF_CLIENT_SECRET=<your-salesforce-client-secret>
   SF_USERNAME=<your-salesforce-username>
   SF_PASSWORD=<your-salesforce-password>
   SF_DATA_URL=https://your-org.my.salesforce.com/
   SF_AUTH_URL=https://your-org.my.salesforce.com/services/oauth2/token

   # Salesforce IDs
   NEXT_PUBLIC_SALESFORCE_ACCOUNT_ID=<your-account-id>
   NEXT_PUBLIC_SALESFORCE_CONTACT_ID=<your-contact-id>

   # Session Security
   SESSION_SECRET=<a-long-random-string>
   ADMIN_HOST=localhost:3000
   ```

---

## 🚀 Step 5: Initialize the Database

Run these commands **in order** from the project root directory:

### 1. Apply schema migrations
```bash
npm run db:migrate
```
This creates all the required tables in your `wovn_web_db` database.

### 2. Seed the default Admin user
```bash
npm run db:seed
```
This creates the initial admin account:

| Field    | Value              |
|----------|--------------------|
| Email    | `admin@admin.com`  |
| Password | `Password@1234`    |
| Role     | Super Admin        |

---

## 🏃 Step 6: Run the Application

Start the Next.js development server:
```bash
npm run dev
```

Open your browser and go to: **[http://localhost:3000](http://localhost:3000)**

Log in with the seeded admin credentials:
- **Email**: `admin@admin.com`
- **Password**: `Password@1234`

---

## 🔍 Troubleshooting

### SSL Error During Migration
**Error**: `SSL connection required` or `no pg_hba.conf entry for host`

**Fix**: Edit `drizzle.config.ts` and set `ssl: false` for local development:

```typescript
// drizzle.config.ts
export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
    ssl: false, // ← Change this for local use
  },
} satisfies Config;
```

---

### Port 3000 Already in Use
Next.js will automatically use the next available port (e.g., `3001`). Check your terminal output for the correct URL after running `npm run dev`.

---

### `psql` command not found on macOS
If using Homebrew:
```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

### Password Authentication Failed for PostgreSQL
Ensure the password in `DATABASE_URL` exactly matches the one set during PostgreSQL installation. On macOS with Homebrew, the default may use **peer authentication** (no password). Try:
```bash
psql -U $(whoami) -h localhost -d wovn_web_db
```
And update your `DATABASE_URL` with your macOS username instead of `postgres`.

---

## 📁 Available npm Scripts

| Command              | Description                                      |
|----------------------|--------------------------------------------------|
| `npm run dev`        | Start Next.js development server                 |
| `npm run build`      | Build the production bundle                      |
| `npm run db:migrate` | Apply Drizzle ORM database migrations            |
| `npm run db:push`    | Push schema changes directly (skip migrations)   |
| `npm run db:seed`    | Seed the default admin user                      |
| `npm run db:studio`  | Open Drizzle Studio (visual DB browser)          |
| `npm run lint`       | Run ESLint checks                                |
