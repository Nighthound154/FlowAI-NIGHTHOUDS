# FlowAI — Idea to Execution Platform
### NIGHTHOUNDS · Netaji Subhas University Jamshedpur

> Transform any raw idea into a complete execution plan: Market Research, Project Plan, Content Strategy, and Learning Roadmap — powered by Claude AI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, CSS Modules |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL |
| AI | Anthropic Claude API |
| Auth | JWT (7-day tokens) |
| Process Manager | PM2 (cluster mode) |
| Web Server | Nginx (reverse proxy + SSL) |

---

## Project Structure

```
flowai/
├── backend/
│   ├── src/
│   │   ├── index.js                  ← Express server
│   │   ├── db/
│   │   │   ├── index.js              ← PostgreSQL pool
│   │   │   └── migrate.js            ← DB schema setup
│   │   ├── middleware/
│   │   │   └── auth.js               ← JWT middleware
│   │   ├── controllers/
│   │   │   ├── auth.js               ← Register, Login, Me
│   │   │   └── flowai.js             ← Generate + CRUD
│   │   └── routes/
│   │       ├── auth.js
│   │       └── flowai.js
│   ├── ecosystem.config.js           ← PM2 config
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── index.js                  ← App entry + Router
│   │   ├── index.css                 ← Global styles
│   │   ├── context/
│   │   │   └── AuthContext.js        ← Global auth state
│   │   ├── utils/
│   │   │   └── api.js                ← Axios + interceptors
│   │   ├── components/
│   │   │   ├── Layout.js             ← Sidebar + nav
│   │   │   └── Layout.module.css
│   │   └── pages/
│   │       ├── Login.js / Auth.module.css
│   │       ├── Register.js
│   │       ├── Dashboard.js / Dashboard.module.css
│   │       ├── Generate.js / Generate.module.css
│   │       └── ProjectView.js / ProjectView.module.css
│   └── .env.example
├── nginx/
│   └── flowai.conf                   ← Nginx server block
├── deploy.sh                         ← One-command VPS deploy
└── README.md
```

---

## Local Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- An Anthropic API key (get one at console.anthropic.com)

### 1. Database
```bash
psql -U postgres
CREATE DATABASE flowai;
CREATE USER flowai_user WITH PASSWORD 'localpassword';
GRANT ALL PRIVILEGES ON DATABASE flowai TO flowai_user;
\q
```

### 2. Backend
```bash
cd backend
cp .env.example .env
# Edit .env — fill in DB credentials and ANTHROPIC_API_KEY

npm install
npm run migrate      # Creates all tables
npm run dev          # Starts with nodemon on port 5000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
# .env: REACT_APP_API_URL=http://localhost:5000/api
# (or leave blank — package.json proxy handles it in dev)

npm install
npm start            # Opens http://localhost:3000
```

---

## VPS Deployment (One Command)

```bash
# 1. Clone repo to /tmp/flowai on your server
git clone https://github.com/yourname/flowai /tmp/flowai

# 2. Run deployment script (pass your domain)
chmod +x /tmp/flowai/deploy.sh
sudo /tmp/flowai/deploy.sh yourdomain.com

# 3. Add your Anthropic API key
nano /var/www/flowai/backend/.env
# Set: ANTHROPIC_API_KEY=sk-ant-...

# 4. Restart backend
pm2 restart flowai-backend
```

The script automatically:
- Installs Node.js 20, PostgreSQL, Nginx, PM2, Certbot
- Creates the database and user
- Generates secure JWT_SECRET and DB password
- Builds the React frontend
- Configures Nginx with SSL (Let's Encrypt)
- Starts the backend in cluster mode with PM2
- Sets PM2 to auto-start on reboot

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/me` | Get current user |

### FlowAI
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/generate` | Generate execution plan | ✓ |
| GET | `/api/projects` | List all user projects | ✓ |
| GET | `/api/projects/:id` | Get project + results | ✓ |
| DELETE | `/api/projects/:id` | Delete a project | ✓ |

### Rate Limits
- Global: 200 req / 15 min per IP
- `/api/generate`: 5 req / 1 min per user

---

## PM2 Commands
```bash
pm2 status                     # Check process status
pm2 logs flowai-backend        # View live logs
pm2 restart flowai-backend     # Restart after .env changes
pm2 reload flowai-backend      # Zero-downtime reload
```

---

## Team

| Name | University | Batch |
|---|---|---|
| Faizan Haider Khan | Netaji Subhas University | 2025–2029 |
| Sujal Kumar Thakur | Netaji Subhas University | 2025–2029 |
| Deep Prakash Kumar | Netaji Subhas University | 2025–2029 |
| Anjali Kumari | Netaji Subhas University | 2025–2029 |
