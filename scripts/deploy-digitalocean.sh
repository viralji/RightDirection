#!/usr/bin/env bash
# Deploy RightDirection to DigitalOcean without touching ClickK / liveindus.
# Usage: ./scripts/deploy-digitalocean.sh [server_ip]
set -euo pipefail

SERVER_IP="${1:-139.59.87.174}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/do_139.59.87.174}"
REMOTE_DIR="/var/www/rightdirection"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

SSH=(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "root@${SERVER_IP}")
RSYNC=(rsync -az --delete
  --exclude node_modules --exclude .next --exclude api/dist --exclude .git
  --exclude ai-service/venv --exclude '*.tsbuildinfo' --exclude .env --exclude api/.env --exclude web/.env.local
  "$REPO_ROOT/" "root@${SERVER_IP}:${REMOTE_DIR}/")

echo "==> Syncing code to ${SERVER_IP}:${REMOTE_DIR}"
"${RSYNC[@]}" -e "ssh -i $SSH_KEY"

echo "==> Remote install & build (isolated ports: web 3001, api 4005, ai 8000, nginx 8090)"
"${SSH[@]}" bash -s <<'REMOTE'
set -euo pipefail
RD=/var/www/rightdirection
cd "$RD"

# --- Redis (for OTP/cache) — safe if already installed ---
if ! command -v redis-server >/dev/null 2>&1; then
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y redis-server
fi
systemctl enable redis-server
systemctl start redis-server

# --- PostgreSQL database (separate from other apps) ---
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='rightdirection'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER rightdirection WITH PASSWORD 'rd_prod_change_me';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='rightdirection'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE rightdirection OWNER rightdirection;"
sudo -u postgres psql -d rightdirection -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null || true

# --- Production .env (only for RightDirection) ---
if [ ! -f "$RD/.env" ]; then
  JWT_A=$(openssl rand -hex 32)
  JWT_R=$(openssl rand -hex 32)
  INT_KEY=$(openssl rand -hex 32)
  cat > "$RD/.env" <<ENV
NODE_ENV=production
PORT=4005
DATABASE_URL=postgresql://rightdirection:rd_prod_change_me@127.0.0.1:5432/rightdirection
REDIS_URL=redis://127.0.0.1:6379
JWT_ACCESS_SECRET=${JWT_A}
JWT_REFRESH_SECRET=${JWT_R}
INTERNAL_API_KEY=${INT_KEY}
AI_SERVICE_URL=http://127.0.0.1:8000
FRONTEND_URL=http://139.59.87.174:8090
BASE_DOMAIN=rightdirection.com
EMAIL_FROM=noreply@rightdirection.com
ENV
  ln -sf "$RD/.env" "$RD/api/.env"
fi

# --- API ---
cd "$RD/api"
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=512}" npx prisma db seed || echo "seed skipped (non-fatal)"

# --- Web ---
cd "$RD/web"
export API_ORIGIN=http://127.0.0.1:4005
export NEXT_PUBLIC_API_URL=/api/v1
export NEXT_PUBLIC_BASE_DOMAIN=rightdirection.com
npm ci
npm run build

# --- AI service ---
cd "$RD/ai-service"
python3 -m venv venv
./venv/bin/pip install -q -r requirements.txt

# --- PM2 (RightDirection apps only) ---
cd "$RD"
pm2 delete rightdirection-api 2>/dev/null || true
pm2 delete rightdirection-web 2>/dev/null || true
pm2 delete rightdirection-ai 2>/dev/null || true
pm2 start scripts/ecosystem.config.cjs
pm2 save

# --- Nginx site on port 8090 only ---
cp "$RD/nginx/rightdirection-ip.conf" /etc/nginx/sites-available/rightdirection
ln -sf /etc/nginx/sites-available/rightdirection /etc/nginx/sites-enabled/rightdirection
nginx -t
systemctl reload nginx

sleep 5
curl -sf http://127.0.0.1:4005/api/v1/health
curl -sf -o /dev/null -w "web:%{http_code}\n" http://127.0.0.1:3001/login
curl -sf -o /dev/null -w "public:%{http_code}\n" http://127.0.0.1:8090/login

echo ""
echo "Deployed. Open: http://139.59.87.174:8090"
echo "Demo: student@example.com / Demo@123  |  admin@rightdirection.com / Admin@123"
pm2 list | grep rightdirection || true
REMOTE

echo "==> Done."
