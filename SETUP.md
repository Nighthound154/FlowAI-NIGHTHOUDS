# FlowAI - Complete Setup & Troubleshooting Guide

## Quick Start (Development)

### Step 1: Database Setup
```bash
# Create PostgreSQL database and user
psql -U postgres
CREATE DATABASE flowai;
CREATE USER flowai_user WITH PASSWORD 'flowai123';
GRANT ALL PRIVILEGES ON DATABASE flowai TO flowai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO flowai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO flowai_user;
\q
```

### Step 2: Backend Setup
```bash
cd backend
npm install

# Run database migrations (creates tables and indices)
npm run migrate

# Start backend server (port 5000)
npm run dev
```

You should see: `🚀 FlowAI backend running on port 5000 [development]`

### Step 3: Frontend Setup
```bash
# In a NEW terminal, from root directory
cd frontend
npm install

# Start frontend dev server (port 3000)
npm start
```

### Step 4: Test the Application
1. Open http://localhost:3000 in your browser
2. Register a new account
3. Log in
4. Go to "New Idea" page
5. Enter an idea (minimum 10 characters)
6. Click "Generate ↗"

---

## Environment Configuration

### Backend (.env file)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flowai
DB_USER=flowai_user
DB_PASSWORD=flowai123
JWT_SECRET=flowaisecretkey123456789abcdef
JWT_EXPIRES_IN=7d
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxx
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

### Frontend (.env.local file)
```
REACT_APP_API_URL=http://flowai-nighthounds.onrender.com/api
```

---

## Testing & Troubleshooting

### Test API Endpoints

#### Health Check
```bash
curl http://localhost:5000/health
# Expected: {"status":"ok","timestamp":"..."}
```

#### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
# Copy the "token" from response for next step
```

#### Generate (Replace with actual token)
```bash
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "idea": "An AI-powered tool that helps developers write better code by analyzing code quality and suggesting improvements"
  }'
```

### Common Issues

#### 1. "Database connection failed"
**Problem**: Backend can't connect to PostgreSQL

**Solution**:
- Verify PostgreSQL is running: `psql -U postgres` should work
- Check .env DB credentials match your setup
- Ensure database and user exist: `psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='flowai';"`
- Run migrations: `cd backend && npm run migrate`

#### 2. "Invalid API key" error during generation
**Problem**: OpenRouter API key is invalid or missing

**Solution**:
- Go to https://openrouter.ai/keys to get/verify your API key
- Copy the key that starts with `sk-or-v1-`
- Update the OPENROUTER_API_KEY in backend/.env
- Restart backend server

#### 3. Generation starts but shows no results
**Problem**: API call succeeds but response has no data

**Solution**:
- Check browser console (F12 → Console) for error messages
- Check backend logs for "❌ Generate error"
- Verify your idea is at least 10 characters
- Check OPENROUTER_API_KEY is valid
- Look for rate-limiting: wait a minute before retrying

#### 4. Frontend can't connect to backend
**Problem**: CORS errors or connection refused

**Solution**:
- Ensure backend is running: `npm run dev` in backend folder
- Verify REACT_APP_API_URL is correct: http://localhost:5000/api
- Check browser Network tab (F12 → Network) for actual request URL
- Backend CORS should allow http://localhost:3000

#### 5. "Too many requests" error
**Problem**: Rate limiting active

**Solution**:
- Wait 60 seconds before trying again
- Rate limit: 5 requests per minute per user for /generate

---

## Database Information

### Tables Created by Migration:
- **users**: Stores user accounts and credentials
- **projects**: Stores generated project ideas
- **project_results**: Stores AI-generated content (research, plan, content, learning)

### Module Data Structure:
Each project can have up to 4 modules:
1. **research**: Market analysis, competitors, target audience
2. **plan**: Tech stack, MVP features, phases, risks
3. **content**: Elevator pitch, brand voice, social posts
4. **learning**: Skills roadmap, timeline, quick wins

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Create a new user account
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/auth/login
Authenticate and get JWT token
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /api/auth/me
Get current user info (requires Authorization header)

### Generation Endpoints

#### POST /api/generate
Generate execution plan from idea (requires Authorization)
```json
{
  "idea": "Your idea description here (min 10 chars)"
}
```

Response includes project details and generated results for all 4 modules.

#### GET /api/projects
Get all user projects (requires Authorization)

#### GET /api/projects/:id
Get specific project with all results (requires Authorization)

#### DELETE /api/projects/:id
Delete a project (requires Authorization)

---

## Performance Notes

- Generation takes 15-60 seconds depending on API response time
- Each generation makes up to 5 API calls to OpenRouter
- Database keeps full generation history
- Images are fetched from Unsplash (free, no API key needed)

---

## For Production Deployment

See deploy.sh and nginx/flowai.conf for production setup with PM2 and Nginx.
