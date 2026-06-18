#!/usr/bin/env bash
# Push only .env.production to server (no code deploy). Restart API to pick up changes.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER_IP="${1:-139.59.87.174}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/do_139.59.87.174}"
REMOTE_DIR="/var/www/rightdirection"
ENV_LOCAL="${ENV_LOCAL:-$ROOT/.env.production}"

if [ ! -f "$ENV_LOCAL" ]; then
  echo "ERROR: Missing $ENV_LOCAL — copy from .env.production.example"
  exit 1
fi

echo "==> Push $ENV_LOCAL → ${SERVER_IP}:${REMOTE_DIR}/.env"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new \
  "$ENV_LOCAL" "root@${SERVER_IP}:${REMOTE_DIR}/.env"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "root@${SERVER_IP}" \
  "chmod 600 ${REMOTE_DIR}/.env && ln -sf ${REMOTE_DIR}/.env ${REMOTE_DIR}/api/.env && pm2 restart rightdirection-api rightdirection-ai"
echo "==> Done. API + AI restarted."
