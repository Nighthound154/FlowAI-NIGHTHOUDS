#!/bin/bash
# ─────────────────────────────────────────────────
# FlowAI — Full VPS Deployment Script
# Run as root or sudo on Ubuntu 22.04 / 24.04
# Usage: chmod +x deploy.sh && sudo ./deploy.sh
# ─────────────────────────────────────────────────

set -e  # Exit on any error

echo ""
echo "╔══════════════════════════════════════╗"
echo "║      FlowAI Deployment Script        ║"
echo "║        NIGHTHOUNDS — NSU             ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. System packages
echo "→ Updating system packages..."
apt-get update -qq
apt-get install -y -qq curl git nginx postgresql postgresql-contrib

# ── 2. Node.js 20 LTS
echo "→ Installing Node.js 20..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "   Node $(node -v), npm $(npm -v)"

# ── 3. PM2
echo "→ Installing PM2..."
npm install -g pm2 --silent

# ── 4. PostgreSQL setup
echo "→ Setting up PostgreSQL..."
DB_NAME="flowai"
DB_USER="flowai_user"
DB_PASS=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)

sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
CREATE DATABASE IF NOT EXISTS ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

echo "   Database: $DB_NAME  User: $DB_USER  Pass: $DB_PASS"

# ── 5. App directory
APP_DIR="/var/www/flowai"
mkdir -p $APP_DIR
mkdir -p /var/log/flowai

# ── 6. Copy app files (assumes you've cloned the repo to /tmp/flowai)
echo "→ Copying application files..."
cp -r /tmp/flowai/backend  $APP_DIR/
cp -r /tmp/flowai/frontend $APP_DIR/

# ── 7. Backend .env
echo "→ Writing backend .env..."
JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 48)
DOMAIN=${1:-"yourdomain.com"}  # Pass domain as first arg: ./deploy.sh mydomain.com

cat > $APP_DIR/backend/.env <<ENV
PORT=5000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASS}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
ANTHROPIC_API_KEY=REPLACE_WITH_YOUR_KEY
ALLOWED_ORIGINS=https://${DOMAIN}
ENV

echo "   ⚠️  IMPORTANT: Edit $APP_DIR/backend/.env and add your ANTHROPIC_API_KEY"

# ── 8. Install backend dependencies
echo "→ Installing backend dependencies..."
cd $APP_DIR/backend
npm install --production --silent

# ── 9. Run DB migrations
echo "→ Running database migrations..."
npm run migrate

# ── 10. Frontend .env + build
echo "→ Building frontend..."
cat > $APP_DIR/frontend/.env <<FENV
REACT_APP_API_URL=https://${DOMAIN}/api
FENV
cd $APP_DIR/frontend
npm install --silent
npm run build

# ── 11. Nginx config
echo "→ Configuring nginx..."
cp /tmp/flowai/nginx/flowai.conf /etc/nginx/sites-available/flowai
sed -i "s/yourdomain.com/${DOMAIN}/g" /etc/nginx/sites-available/flowai
ln -sf /etc/nginx/sites-available/flowai /etc/nginx/sites-enabled/flowai
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── 12. SSL with certbot
echo "→ Installing SSL certificate..."
if ! command -v certbot &> /dev/null; then
  apt-get install -y certbot python3-certbot-nginx -qq
fi
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos -m admin@${DOMAIN} || \
  echo "   ⚠️  SSL setup failed — run 'certbot --nginx -d ${DOMAIN}' manually"

# ── 13. Start backend with PM2
echo "→ Starting backend with PM2..."
cd $APP_DIR/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

echo ""
echo "✅ Deployment complete!"
echo ""
echo "  App URL  : https://${DOMAIN}"
echo "  API      : https://${DOMAIN}/api"
echo "  Health   : https://${DOMAIN}/health"
echo "  PM2 logs : pm2 logs flowai-backend"
echo "  DB pass  : $DB_PASS  (saved in .env)"
echo ""
echo "  ⚠️  Still needed:"
echo "  1. Add ANTHROPIC_API_KEY to $APP_DIR/backend/.env"
echo "  2. Run: pm2 restart flowai-backend"
echo ""
