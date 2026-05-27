#!/usr/bin/env bash
# Student portal E2E smoke test — run while API (:4005) and web (:5175) are up.
set -euo pipefail

API="${API_BASE:-http://localhost:4005/api/v1}"
WEB="${WEB_BASE:-http://localhost:5175}"
COOKIE=$(mktemp)
trap 'rm -f "$COOKIE"' EXIT

pass() { echo "✓ $1"; }
fail() { echo "✗ $1"; exit 1; }

echo "=== Student flow smoke test ==="
echo "API=$API WEB=$WEB"
echo ""

# Health
curl -sf "$API/health" >/dev/null || fail "API health"
pass "API health"

# Login
LOGIN=$(curl -sf -c "$COOKIE" -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@example.com","password":"Demo@123"}')
echo "$LOGIN" | grep -q STUDENT || fail "student login"
pass "Email login"

# Dashboard / journey / documents
curl -sf -b "$COOKIE" "$API/students/me/dashboard" | grep -q profileScore || fail "dashboard"
pass "Dashboard"

curl -sf -b "$COOKIE" "$API/students/me/journey" | grep -q totalEvents || fail "journey"
pass "Journey"

curl -sf -b "$COOKIE" "$API/students/me/documents" | grep -q totalSlots || fail "documents"
pass "Documents checklist"

# Notifications
curl -sf -b "$COOKIE" "$API/notifications/unread-count" | grep -q count || fail "notifications"
pass "Notifications"

# Upload flow
PRESIGN=$(curl -sf -b "$COOKIE" -X POST "$API/students/me/documents/presign" \
  -H 'Content-Type: application/json' \
  -d '{"category":"OTHER","fileName":"smoke.pdf","mimeType":"application/pdf","fileSize":512}')
UPLOAD_URL=$(echo "$PRESIGN" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['uploadUrl'])")
S3KEY=$(echo "$PRESIGN" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['s3Key'])")
curl -sf -X PUT "$UPLOAD_URL" -d '' >/dev/null || fail "dev upload PUT"
curl -sf -b "$COOKIE" -X POST "$API/students/me/documents" \
  -H 'Content-Type: application/json' \
  -d "{\"category\":\"OTHER\",\"fileName\":\"smoke.pdf\",\"mimeType\":\"application/pdf\",\"fileSize\":512,\"s3Key\":\"$S3KEY\"}" >/dev/null
pass "Document upload"

# KYC blocked
CODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE" -X POST "$API/students/me/documents/presign" \
  -H 'Content-Type: application/json' \
  -d '{"category":"KYC","fileName":"x.pdf","mimeType":"application/pdf","fileSize":100}')
[ "$CODE" = "403" ] || fail "KYC should 403 (got $CODE)"
pass "KYC upload blocked"

# Web pages (auth redirect without cookie)
for path in /login /register/student; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$WEB$path")
  [ "$CODE" = "200" ] || fail "$path -> $CODE"
done
pass "Public web pages"

# Authenticated student page
CODE=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE" "$WEB/student/documents")
[ "$CODE" = "200" ] || fail "student documents page $CODE"
pass "Student documents page (authenticated)"

echo ""
echo "All student flow checks passed."
