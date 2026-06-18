#!/usr/bin/env bash
# Compare commit hashes: local, GitHub origin/main, and production server.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVER_IP="${1:-139.59.87.174}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/do_139.59.87.174}"
GIT_BRANCH="${GIT_BRANCH:-main}"

cd "$ROOT"
git fetch origin "$GIT_BRANCH" 2>/dev/null || true

LOCAL=$(git rev-parse --short HEAD)
REMOTE=$(git rev-parse --short "origin/${GIT_BRANCH}" 2>/dev/null || echo "unknown")
SERVER=$(ssh -i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=8 "root@${SERVER_IP}" \
  "git -C /var/www/rightdirection rev-parse --short HEAD 2>/dev/null" 2>/dev/null || echo "unreachable")

echo "Sync status (${GIT_BRANCH})"
echo "  Local:  ${LOCAL}"
echo "  GitHub: ${REMOTE}"
echo "  Server: ${SERVER}"

if [ "$LOCAL" = "$REMOTE" ] && [ "$LOCAL" = "$SERVER" ]; then
  echo "  ✓ All in sync"
else
  echo "  ✗ Out of sync — run: git push origin ${GIT_BRANCH} && ./scripts/deploy-digitalocean.sh"
fi

HEALTH=$(curl -sf --max-time 5 "http://${SERVER_IP}:8090/api/v1/health" 2>/dev/null | head -c 60 || echo "down")
echo "  Health: ${HEALTH}"
