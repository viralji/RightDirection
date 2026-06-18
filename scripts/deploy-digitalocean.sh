#!/usr/bin/env bash
# Deploy RightDirection via git (no code rsync). Only .env is copied from local.
# Usage: ./scripts/deploy-digitalocean.sh [server_ip]
#   ENV_LOCAL=.env.production ./scripts/deploy-digitalocean.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER_IP="${1:-139.59.87.174}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/do_139.59.87.174}"
REMOTE_DIR="/var/www/rightdirection"
GIT_REPO="${GIT_REPO:-git@github.com:viralji/RightDirection.git}"
GIT_BRANCH="${GIT_BRANCH:-main}"
ENV_LOCAL="${ENV_LOCAL:-$ROOT/.env.production}"

SSH=(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "root@${SERVER_IP}")
SCP=(scp -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new)

if [ ! -f "$ENV_LOCAL" ]; then
  echo "ERROR: Missing $ENV_LOCAL — create production env (never commit to git)."
  exit 1
fi

echo "==> Push .env from local ($ENV_LOCAL) — code comes from git only"
"${SSH[@]}" "mkdir -p ${REMOTE_DIR}"
"${SCP[@]}" "$ENV_LOCAL" "root@${SERVER_IP}:/tmp/rightdirection.env"

echo "==> Deploy ${GIT_BRANCH} from ${GIT_REPO} to ${SERVER_IP}:${REMOTE_DIR}"
"${SSH[@]}" bash -s <<REMOTE
set -euo pipefail
RD=${REMOTE_DIR}
GIT_REPO='${GIT_REPO}'
GIT_BRANCH='${GIT_BRANCH}'

# --- Bootstrap (fresh server) ---
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ] 2>/dev/null; then
  echo "==> Install Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
fi
if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Install PM2"
  npm install -g pm2
fi
if ! command -v psql >/dev/null 2>&1; then
  echo "==> Install PostgreSQL"
  DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib
  systemctl enable postgresql
  systemctl start postgresql
fi
if ! command -v redis-server >/dev/null 2>&1; then
  echo "==> Install Redis"
  DEBIAN_FRONTEND=noninteractive apt-get install -y redis-server
fi
if ! command -v nginx >/dev/null 2>&1; then
  echo "==> Install Nginx"
  DEBIAN_FRONTEND=noninteractive apt-get install -y nginx
fi
systemctl enable redis-server nginx postgresql 2>/dev/null || true
systemctl start redis-server nginx postgresql 2>/dev/null || true

# pgvector (best-effort)
apt-get install -y postgresql-16-pgvector 2>/dev/null || \
  apt-get install -y postgresql-15-pgvector 2>/dev/null || true

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
  mkdir -p "\$(dirname "\$RD")"
  rm -rf "\$RD"
  git clone --branch "\$GIT_BRANCH" --depth 1 "\$GIT_REPO" "\$RD"
fi

# --- Production .env (pushed from local, never in git) ---
cp /tmp/rightdirection.env "\$RD/.env"
chmod 600 "\$RD/.env"
ln -sf "\$RD/.env" "\$RD/api/.env"

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
