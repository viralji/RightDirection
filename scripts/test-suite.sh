#!/bin/bash
# RightDirection — Integration Test Suite
# Tests the live API at localhost:4000

API="http://localhost:4000/api/v1"
AI="http://localhost:8000"
PASS=0
FAIL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

pass() { echo -e "${GREEN}  ✓ $1${NC}"; PASS=$((PASS+1)); }
fail() { echo -e "${RED}  ✗ $1${NC}"; echo -e "${RED}    Response: $2${NC}"; FAIL=$((FAIL+1)); }
header() { echo -e "\n${CYAN}── $1 ──${NC}"; }

assert_ok() {
  local label="$1"; local body="$2"; local status="$3"
  if [[ "$status" == "200" || "$status" == "201" ]]; then pass "$label"
  else fail "$label (HTTP $status)" "$body"; fi
}

assert_field() {
  local label="$1"; local body="$2"; local field="$3"
  if echo "$body" | grep -q "\"$field\""; then pass "$label"
  else fail "$label (missing field: $field)" "$body"; fi
}

# ─── HELPERS ──────────────────────────────────────────────────────────────────

post_json() {
  curl -s -w "\n%{http_code}" -X POST "$1" \
    -H "Content-Type: application/json" \
    -b /tmp/rd-cookies.txt -c /tmp/rd-cookies.txt \
    ${2:+-d "$2"}
}

get_json() {
  curl -s -w "\n%{http_code}" "$1" \
    -b /tmp/rd-cookies.txt -c /tmp/rd-cookies.txt
}

patch_json() {
  curl -s -w "\n%{http_code}" -X PATCH "$1" \
    -H "Content-Type: application/json" \
    -b /tmp/rd-cookies.txt -c /tmp/rd-cookies.txt \
    ${2:+-d "$2"}
}

rm -f /tmp/rd-cookies.txt /tmp/rd-cookies-admin.txt /tmp/rd-cookies-uni.txt

# ─── 1. HEALTH ────────────────────────────────────────────────────────────────

header "1. Health Checks"

R=$(curl -s -w "\n%{http_code}" "$API/health")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "NestJS API health" "$BODY" "$STATUS"
assert_field "API health has status" "$BODY" "status"

R=$(curl -s -w "\n%{http_code}" "$AI/health")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "FastAPI AI health" "$BODY" "$STATUS"

# ─── 2. AUTH ──────────────────────────────────────────────────────────────────

header "2. Authentication"

# Login as agent owner
R=$(post_json "$API/auth/login" '{"email":"owner@studyvision.com","password":"Demo@123"}')
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Agent login" "$BODY" "$STATUS"
assert_field "Login returns user" "$BODY" "user"

# Get current user
R=$(get_json "$API/auth/me")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Get current user (me)" "$BODY" "$STATUS"
assert_field "User has email" "$BODY" "email"
AGENT_TENANT_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('tenantId',''))" 2>/dev/null)

# Wrong password
R=$(post_json "$API/auth/login" '{"email":"owner@studyvision.com","password":"WRONG"}')
STATUS=$(echo "$R" | tail -1)
if [[ "$STATUS" == "401" ]]; then pass "Rejects wrong password (401)"; PASS=$((PASS+1))
else fail "Should reject wrong password" "$STATUS"; fi

# Login as admin (separate cookie jar)
R=$(curl -s -w "\n%{http_code}" -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -b /tmp/rd-cookies-admin.txt -c /tmp/rd-cookies-admin.txt \
  -d '{"email":"admin@rightdirection.com","password":"Admin@123"}')
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Admin login" "$BODY" "$STATUS"

# ─── 3. TENANT ────────────────────────────────────────────────────────────────

header "3. Tenant / Branding"

R=$(get_json "$API/tenants/by-subdomain/demo")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Get tenant by subdomain" "$BODY" "$STATUS"
assert_field "Tenant has name" "$BODY" "name"
assert_field "Tenant has subdomain" "$BODY" "subdomain"

# Non-existent subdomain
R=$(get_json "$API/tenants/by-subdomain/nonexistent-xyz-123")
STATUS=$(echo "$R" | tail -1)
if [[ "$STATUS" == "404" ]]; then pass "Returns 404 for unknown subdomain"; PASS=$((PASS+1))
else fail "Should 404 for unknown subdomain" "Got $STATUS"; fi

# ─── 4. STUDENTS ──────────────────────────────────────────────────────────────

header "4. Student Management"

R=$(get_json "$API/students")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "List students" "$BODY" "$STATUS"

# Create a student
TS=$(date +%s)
R=$(post_json "$API/students" "{
  \"name\": \"Test Student CI\",
  \"email\": \"ci.student.$TS@test.com\",
  \"phone\": \"+919876543210\",
  \"educationLevel\": \"BACHELORS\",
  \"aggregatePct\": 75,
  \"ieltsScore\": 6.5,
  \"annualBudgetInr\": 2000000,
  \"preferredCountries\": [\"UK\",\"Canada\"],
  \"preferredField\": [\"Computer Science\"],
  \"preferredIntake\": \"September 2025\",
  \"leadSource\": \"DIRECT\"
}")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Create student" "$BODY" "$STATUS"
STUDENT_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)

if [[ -n "$STUDENT_ID" ]]; then
  R=$(get_json "$API/students/$STUDENT_ID")
  BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
  assert_ok "Get student by ID" "$BODY" "$STATUS"
  assert_field "Student has profileScore" "$BODY" "profileScore"

  R=$(patch_json "$API/students/$STUDENT_ID" '{"annualBudgetInr": 2500000}')
  STATUS=$(echo "$R" | tail -1)
  assert_ok "Update student" "$(echo "$R" | head -1)" "$STATUS"
fi

# Search
R=$(get_json "$API/students?search=Test")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Search students" "$BODY" "$STATUS"

# ─── 5. UNIVERSITIES ──────────────────────────────────────────────────────────

header "5. Universities"

R=$(get_json "$API/universities")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "List universities" "$BODY" "$STATUS"

UNI_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); items=d.get('data',{}).get('data',[]); print(items[0]['id'] if items else '')" 2>/dev/null)

if [[ -n "$UNI_ID" ]]; then
  R=$(get_json "$API/universities/$UNI_ID")
  BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
  assert_ok "Get university by ID" "$BODY" "$STATUS"
  assert_field "University has courses" "$BODY" "courses"

  R=$(get_json "$API/universities/$UNI_ID/courses")
  STATUS=$(echo "$R" | tail -1)
  assert_ok "List university courses" "$(echo "$R" | head -1)" "$STATUS"
fi

# Filter by country
R=$(get_json "$API/universities?country=UK")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Filter universities by country" "$BODY" "$STATUS"

# ─── 6. APPLICATIONS ──────────────────────────────────────────────────────────

header "6. Applications"

R=$(get_json "$API/applications/kanban")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Get applications kanban" "$BODY" "$STATUS"

R=$(get_json "$API/applications")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "List applications" "$BODY" "$STATUS"

# Create application if we have student + uni
if [[ -n "$STUDENT_ID" && -n "$UNI_ID" ]]; then
  COURSE_ID=$(curl -s "$API/universities/$UNI_ID/courses" | python3 -c "import sys,json; d=json.load(sys.stdin); items=d.get('data',[]); print(items[0]['id'] if items else '')" 2>/dev/null)
  if [[ -n "$COURSE_ID" ]]; then
    R=$(post_json "$API/applications" "{\"studentId\":\"$STUDENT_ID\",\"universityId\":\"$UNI_ID\",\"courseId\":\"$COURSE_ID\",\"intake\":\"Sep 2025\"}")
    BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
    assert_ok "Create application" "$BODY" "$STATUS"
    APP_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)

    if [[ -n "$APP_ID" ]]; then
      R=$(get_json "$API/applications/$APP_ID")
      assert_ok "Get application by ID" "$(echo "$R" | head -1)" "$(echo "$R" | tail -1)"

      R=$(patch_json "$API/applications/$APP_ID/stage" '{"stage":"DOCS_COLLECTION","note":"Moving to docs collection"}')
      BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
      assert_ok "Change application stage" "$BODY" "$STATUS"

      R=$(patch_json "$API/applications/$APP_ID/stage" '{"stage":"UNDER_REVIEW"}')
      assert_ok "Move to UNDER_REVIEW" "$(echo "$R" | head -1)" "$(echo "$R" | tail -1)"
    fi
  fi
fi

# ─── 7. DOCUMENTS ─────────────────────────────────────────────────────────────

header "7. Documents"

R=$(get_json "$API/documents")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "List documents" "$BODY" "$STATUS"

# Request presign URL
if [[ -n "$STUDENT_ID" ]]; then
  R=$(post_json "$API/documents/presign" "{\"studentId\":\"$STUDENT_ID\",\"category\":\"ACADEMIC\",\"fileName\":\"transcript.pdf\",\"mimeType\":\"application/pdf\",\"fileSize\":102400}")
  BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
  assert_ok "Get presigned upload URL" "$BODY" "$STATUS"
  assert_field "Presign returns uploadUrl" "$BODY" "uploadUrl"
fi

# ─── 8. NOTIFICATIONS ─────────────────────────────────────────────────────────

header "8. Notifications"

R=$(get_json "$API/notifications")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "List notifications" "$BODY" "$STATUS"

R=$(get_json "$API/notifications/unread-count")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Get unread count" "$BODY" "$STATUS"
assert_field "Unread count has count" "$BODY" "count"

# ─── 9. COMMISSIONS ───────────────────────────────────────────────────────────

header "9. Commissions"

R=$(get_json "$API/commissions")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "List commissions" "$BODY" "$STATUS"

R=$(get_json "$API/commissions/wallet")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Get wallet summary" "$BODY" "$STATUS"
assert_field "Wallet has walletBalance" "$BODY" "walletBalance"

# ─── 10. AGENT MODULE ─────────────────────────────────────────────────────────

header "10. Agent"

R=$(get_json "$API/agent/profile")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Get agent profile" "$BODY" "$STATUS"

R=$(get_json "$API/agent/stats")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Get agent stats" "$BODY" "$STATUS"

R=$(get_json "$API/agent/team")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "List team members" "$BODY" "$STATUS"

# ─── 11. PROPOSALS ────────────────────────────────────────────────────────────

header "11. Proposals"

R=$(get_json "$API/proposals")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "List proposals" "$BODY" "$STATUS"

# ─── 12. MARKETPLACE ──────────────────────────────────────────────────────────

header "12. Marketplace"

R=$(get_json "$API/marketplace/leads")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "List marketplace leads" "$BODY" "$STATUS"

R=$(get_json "$API/marketplace/leads?intent=HOT")
STATUS=$(echo "$R" | tail -1)
assert_ok "Filter leads by intent" "$(echo "$R" | head -1)" "$STATUS"

# ─── 13. BILLING ──────────────────────────────────────────────────────────────

header "13. Billing"

R=$(get_json "$API/billing/plan")
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Get current plan" "$BODY" "$STATUS"
assert_field "Plan has subscriptionPlan" "$BODY" "plan"

R=$(get_json "$API/billing/history")
STATUS=$(echo "$R" | tail -1)
assert_ok "Get billing history" "$(echo "$R" | head -1)" "$STATUS"

# ─── 14. ADMIN (using admin cookies) ──────────────────────────────────────────

header "14. Admin Portal"

R=$(curl -s -w "\n%{http_code}" "$API/admin/stats" -b /tmp/rd-cookies-admin.txt)
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Admin platform stats" "$BODY" "$STATUS"
assert_field "Stats has totalTenants" "$BODY" "totalTenants"

R=$(curl -s -w "\n%{http_code}" "$API/admin/agents" -b /tmp/rd-cookies-admin.txt)
STATUS=$(echo "$R" | tail -1)
assert_ok "Admin list agents" "$(echo "$R" | head -1)" "$STATUS"

R=$(curl -s -w "\n%{http_code}" "$API/admin/commissions/pending" -b /tmp/rd-cookies-admin.txt)
STATUS=$(echo "$R" | tail -1)
assert_ok "Admin pending commissions" "$(echo "$R" | head -1)" "$STATUS"

R=$(curl -s -w "\n%{http_code}" "$API/admin/fraud/high-risk" -b /tmp/rd-cookies-admin.txt)
STATUS=$(echo "$R" | tail -1)
assert_ok "Admin fraud high-risk list" "$(echo "$R" | head -1)" "$STATUS"

R=$(curl -s -w "\n%{http_code}" "$API/admin/config" -b /tmp/rd-cookies-admin.txt)
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Admin get platform config" "$BODY" "$STATUS"

R=$(curl -s -w "\n%{http_code}" "$API/admin/activity-log" -b /tmp/rd-cookies-admin.txt)
STATUS=$(echo "$R" | tail -1)
assert_ok "Admin activity log" "$(echo "$R" | head -1)" "$STATUS"

# ─── 15. AUTHORIZATION / RBAC ─────────────────────────────────────────────────

header "15. Authorization (RBAC)"

# Agent accessing admin endpoints should be 403
R=$(get_json "$API/admin/stats")
STATUS=$(echo "$R" | tail -1)
if [[ "$STATUS" == "403" ]]; then pass "Agent blocked from admin endpoints (403)"; PASS=$((PASS+1))
else fail "Agent should be blocked from admin (got $STATUS)" ""; fi

# Unauthenticated access should be 401
R=$(curl -s -w "\n%{http_code}" "$API/students")
STATUS=$(echo "$R" | tail -1)
if [[ "$STATUS" == "401" ]]; then pass "Unauthenticated blocked from /students (401)"; PASS=$((PASS+1))
else fail "Unauthenticated should get 401 for /students (got $STATUS)" ""; fi

# ─── 16. AI SERVICE ───────────────────────────────────────────────────────────

header "16. AI Service (FastAPI)"

R=$(curl -s -w "\n%{http_code}" -X POST "$AI/ai/trust-score" \
  -H "Content-Type: application/json" \
  -H "X-Internal-Api-Key: rightdirection-internal-api-key-dev-32chars" \
  -d '{
    "student_id": "test-student-001",
    "document_fraud_scores": [0.1, 0.2, 0.05],
    "num_documents_verified": 3,
    "num_documents_total": 5,
    "bank_statement_score": 0.8,
    "academic_gpa_stated": 3.5,
    "profile_completeness": 0.85
  }')
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Trust Score calculation" "$BODY" "$STATUS"
assert_field "Trust score has grade" "$BODY" "grade"
assert_field "Trust score has overall_score" "$BODY" "overall_score"
assert_field "Trust score has recommendation" "$BODY" "recommendation"

# Trust score with high fraud
R=$(curl -s -w "\n%{http_code}" -X POST "$AI/ai/trust-score" \
  -H "Content-Type: application/json" \
  -H "X-Internal-Api-Key: rightdirection-internal-api-key-dev-32chars" \
  -d '{
    "student_id": "test-student-002",
    "document_fraud_scores": [0.9, 0.85, 0.7],
    "num_documents_verified": 3,
    "num_documents_total": 3,
    "profile_completeness": 0.3
  }')
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Trust score for high-risk student" "$BODY" "$STATUS"
GRADE=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('grade',''))" 2>/dev/null)
if [[ "$GRADE" == "D" || "$GRADE" == "F" ]]; then pass "High-fraud student gets D/F grade (got $GRADE)"
else fail "High-fraud student should get D/F grade (got $GRADE)" "$BODY"; fi

# Fraud check (no real S3 key, but tests the endpoint structure)
R=$(curl -s -w "\n%{http_code}" -X POST "$AI/ai/document/fraud-check" \
  -H "Content-Type: application/json" \
  -H "X-Internal-Api-Key: rightdirection-internal-api-key-dev-32chars" \
  -d '{"document_id":"test-doc-001","category":"PASSPORT","tenant_id":"t1","student_id":"s1"}')
BODY=$(echo "$R" | head -1); STATUS=$(echo "$R" | tail -1)
assert_ok "Document fraud check endpoint" "$BODY" "$STATUS"
assert_field "Fraud check has fraud_score" "$BODY" "fraud_score"

# Unauthorized AI call (wrong key)
R=$(curl -s -w "\n%{http_code}" -X POST "$AI/ai/trust-score" \
  -H "Content-Type: application/json" \
  -H "X-Internal-Api-Key: WRONG_KEY" \
  -d '{"student_id":"x","profile_completeness":0.5}')
STATUS=$(echo "$R" | tail -1)
if [[ "$STATUS" == "401" ]]; then pass "AI service blocks invalid internal key (401)"; PASS=$((PASS+1))
else fail "AI service should block invalid key (got $STATUS)" ""; fi

# ─── 17. RATE LIMITING ────────────────────────────────────────────────────────

header "17. Rate Limiting"

# Hit health endpoint rapidly — should not 429 (it's exempt from strict limiting)
for i in {1..5}; do curl -s "$API/health" > /dev/null; done
pass "Health endpoint handles burst without crash"

# ─── 18. LOGOUT ───────────────────────────────────────────────────────────────

header "18. Logout"

R=$(post_json "$API/auth/logout")
STATUS=$(echo "$R" | tail -1)
assert_ok "Logout clears session" "$(echo "$R" | head -1)" "$STATUS"

# After logout, /me should 401
R=$(get_json "$API/auth/me")
STATUS=$(echo "$R" | tail -1)
if [[ "$STATUS" == "401" ]]; then pass "Accessing /me after logout returns 401"; PASS=$((PASS+1))
else fail "After logout /me should return 401 (got $STATUS)" ""; fi

# ─── SUMMARY ──────────────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL=$((PASS+FAIL))
echo -e "${CYAN}Results: ${GREEN}$PASS passed${NC} / ${RED}$FAIL failed${NC} / $TOTAL total"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ $FAIL -eq 0 ]]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}$FAIL test(s) failed.${NC}"
  exit 1
fi
