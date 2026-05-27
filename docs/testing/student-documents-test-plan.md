# Student login, journey & documents — test plan

**Demo student:** `student@example.com` / `Demo@123`  
**Base URL:** http://localhost:5175 (web) · http://localhost:4005/api/v1 (API)

---

## 0. Automated smoke script

```bash
npm run test:student-flow
```

Covers login, dashboard, journey, documents, upload, notifications, and web routes on **:5175 / :4005**.

---

## 1. Student login & redirect

| # | Step | Expected |
|---|------|----------|
| 1.1 | Open `/login`, enter student credentials, submit | Redirect to `/student/dashboard` |
| 1.2 | While logged in, open `/login` | Redirect to `/dashboard` then `/student/dashboard` (not agent) |
| 1.3 | Log out, open `/student/dashboard` | Redirect to `/login?redirect=/student/dashboard` |
| 1.4 | Super admin → Demo as student | Lands on student dashboard with impersonation banner |
| 1.5 | Login → **Phone OTP** tab | Send OTP (see API console in dev), verify → student dashboard |
| 1.6 | `/register/student` | OTP → details with agency code `demo` → auto-login to dashboard |

---

## 1b. Notifications

| # | Step | Expected |
|---|------|----------|
| 1b.1 | Nav → **Alerts** | List of in-app notifications |
| 1b.2 | Unread items | Pastel highlight + “Mark as read” |
| 1b.3 | Mark all read | Badge count clears in nav |

---

## 2. My documents — checklist & status

| # | Step | Expected |
|---|------|----------|
| 2.1 | Nav → **My Documents** (`/student/documents`) | 7 category cards: Identity, Academic, Test scores, Financial, Application, Visa, Other |
| 2.2 | Review seed data (Arjun Mehta) | Identity, Academic, Test scores = **Verified**; Financial, Application = **Uploaded** |
| 2.3 | Each card shows status chip (color + label) | Matches `NOT_UPLOADED` / `UPLOADED` / `UNDER_REVIEW` / `VERIFIED` / `REJECTED` |
| 2.4 | Summary row | Required done, Verified, Under review, Rejected counts |
| 2.5 | Click **View** on an uploaded doc | PDF preview drawer opens (sample PDF in dev without AWS) |
| 2.6 | Rejected doc (if seeded) | Red chip + rejection reason text |

---

## 3. Upload by category (tag)

| # | Step | Expected |
|---|------|----------|
| 3.1 | On **Other** (or empty slot), click **Upload document** | File picker opens; only allowed extensions |
| 3.2 | Select a small PDF (< 15 MB) | Button shows loading; success without error toast |
| 3.3 | Same category card | Status **Uploaded**; file name + version shown |
| 3.4 | Click **Upload new version** with another file | Version increments; history count ≥ 2 |
| 3.5 | Try file > 15 MB | API error shown in rose banner |
| 3.6 | API: POST presign with `category: KYC` as student | `403` Forbidden |

---

## 4. Journey integration

| # | Step | Expected |
|---|------|----------|
| 4.1 | After upload, open **My Journey** | New timeline row: type document, title e.g. "Other uploaded" |
| 4.2 | Dashboard | Documents count increases; recent journey may show upload event |
| 4.3 | Journey event description | Contains file name + status |

---

## 5. API smoke (curl)

```bash
# Login — save cookies
curl -s -c /tmp/stu.txt -X POST http://localhost:4005/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"student@example.com","password":"Demo@123"}'

# List document slots
curl -s -b /tmp/stu.txt http://localhost:4005/api/v1/students/me/documents | jq '.data.summary'

# Presign (dev)
curl -s -b /tmp/stu.txt -X POST http://localhost:4005/api/v1/students/me/documents/presign \
  -H 'Content-Type: application/json' \
  -d '{"category":"OTHER","fileName":"test.pdf","mimeType":"application/pdf","fileSize":1024}'

# Create metadata (use s3Key from presign)
# PUT to uploadUrl if not dev-upload mock
curl -s -b /tmp/stu.txt -X POST http://localhost:4005/api/v1/students/me/documents \
  -H 'Content-Type: application/json' \
  -d '{"category":"OTHER","fileName":"test.pdf","mimeType":"application/pdf","fileSize":1024,"s3Key":"<s3Key>"}'

# Journey includes new event
curl -s -b /tmp/stu.txt http://localhost:4005/api/v1/students/me/journey | jq '.data.events[0]'
```

---

## 6. Regression

| # | Area | Expected |
|---|------|----------|
| 6.1 | Agent `/agent/documents` | Still lists all agency docs |
| 6.2 | Agent student expand panel | Documents count still visible |
| 6.3 | Student profile | Loads without error |
| 6.4 | CSS on student pages | Tailwind applied (not raw HTML) |

---

## Pass criteria

- All sections 1–4 pass manually in browser  
- Section 5 presign + create return `200`  
- No student access to other students’ documents via `GET /documents/:id/download` without ownership (use `me/documents/:id/download` only)
