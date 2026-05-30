#!/usr/bin/env bash
# Deploy RightDirection via git (no rsync). Preserves server .env and other apps on the host.
# Usage: ./scripts/deploy-digitalocean.sh [server_ip]
set -euo pipefail

SERVER_IP="${1:-139.59.87.174}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/do_139.59.87.174}"
REMOTE_DIR="/var/www/rightdirection"
GIT_REPO="${GIT_REPO:-git@github.com:viralji/RightDirection.git}"
GIT_BRANCH="${GIT_BRANCH:-main}"

SSH=(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "root@${SERVER_IP}")

echo "==> Deploy ${GIT_BRANCH} from ${GIT_REPO} to ${SERVER_IP}:${REMOTE_DIR}"
"${SSH[@]}" bash -s <<REMOTE
set -euo pipefail
RD=${REMOTE_DIR}
GIT_REPO='${GIT_REPO}'
GIT_BRANCH='${GIT_BRANCH}'

# --- Git: clone or pull (source of truth) ---
if [ -d "\$RD/.git" ]; then
  echo "==> git pull in \$RD"
  cd "\$RD"
  git fetch origin
  git checkout "\$GIT_BRANCH"
  git reset --hard "origin/\$GIT_BRANCH"
  git clean -fd -e .env -e api/.env -e web/.env.local -e node_modules -e api/node_modules -e web/.next -e api/dist -e ai-service/venv
else
  echo "==> git clone into \$RD"
  ENV_TMP=""
  [ -f "\$RD/.env" ] && ENV_TMP=\$(mktemp) && cp "\$RD/.env" "\$ENV_TMP"
  mkdir -p "\$(dirname "\$RD")"
  rm -rf "\$RD"
  git clone --branch "\$GIT_BRANCH" --depth 1 "\$GIT_REPO" "\$RD"
  if [ -n "\$ENV_TMP" ]; then
    cp "\$ENV_TMP" "\$RD/.env"
    rm -f "\$ENV_TMP"
  fi
fi

cd "\$RD"

# --- Production .env (never committed) ---
if [ ! -f "\$RD/.env" ]; then
  JWT_A=\$(openssl rand -hex 32)
  JWT_R=\$(openssl rand -hex 32)
  INT_KEY=\$(openssl rand -hex 32)
  cat > "\$RD/.env" <<ENV
NODE_ENV=production
PORT=4005
DATABASE_URL=postgresql://rightdirection:rd_prod_change_me@127.0.0.1:5432/rightdirection
REDIS_URL=redis://127.0.0.1:6379
JWT_ACCESS_SECRET=\${JWT_A}
JWT_REFRESH_SECRET=\${JWT_R}
INTERNAL_API_KEY=\${INT_KEY}
AI_SERVICE_URL=http://127.0.0.1:8000
FRONTEND_URL=http://139.59.87.174:8090
BASE_DOMAIN=rightdirection.com
EMAIL_FROM=noreply@rightdirection.com
ENV
fi
ln -sf "\$RD/.env" "\$RD/api/.env"

# --- Redis ---
if ! command -v redis-server >/dev/null 2>&1; then
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y redis-server
fi
systemctl enable redis-server 2>/dev/null || true
systemctl start redis-server 2>/dev/null || true

# --- PostgreSQL (isolated DB) ---
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='rightdirection'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER rightdirection WITH PASSWORD 'rd_prod_change_me';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='rightdirection'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE rightdirection OWNER rightdirection;"
sudo -u postgres psql -d rightdirection -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null || true

# --- API ---
cd "\$RD/api"
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
NODE_OPTIONS="\${NODE_OPTIONS:---max-old-space-size=512}" npx prisma db seed || echo "seed skipped (non-fatal)"

# --- Web ---
cd "\$RD/web"
export API_ORIGIN=http://127.0.0.1:4005
export NEXT_PUBLIC_API_URL=/api/v1
export NEXT_PUBLIC_BASE_DOMAIN=rightdirection.com
npm ci
npm run build

# --- AI service ---
cd "\$RD/ai-service"
python3 -m venv venv
./venv/bin/pip install -q -r requirements.txt

# --- PM2 ---
cd "\$RD"
pm2 delete rightdirection-api 2>/dev/null || true
pm2 delete rightdirection-web 2>/dev/null || true
pm2 delete rightdirection-ai 2>/dev/null || true
pm2 start scripts/ecosystem.config.cjs
pm2 save

# --- Nginx (port 8090 only) ---
cp "\$RD/nginx/rightdirection-ip.conf" /etc/nginx/sites-available/rightdirection
ln -sf /etc/nginx/sites-available/rightdirection /etc/nginx/sites-enabled/rightdirection
nginx -t
systemctl reload nginx

sleep 3
git rev-parse --short HEAD
curl -sf http://127.0.0.1:4005/api/v1/health | head -c 80
echo ""
curl -sf -o /dev/null -w "web:%{http_code} public:%{http_code}\n" http://127.0.0.1:3001/login http://127.0.0.1:8090/login

echo ""
echo "Deployed commit: \$(cd \$RD && git rev-parse --short HEAD)"
echo "Open: http://139.59.87.174:8090"
REMOTE

echo "==> Done."
