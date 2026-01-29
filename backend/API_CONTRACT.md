# CSR HealthTrace – Backend API Contract

This document defines all backend APIs, request/response formats,
and authorization rules for frontend integration.

This file is the **single source of truth** for frontend development.
Swagger is for testing; this file is for implementation.

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Authorization Header (Required for protected APIs)

Authorization: Bearer <JWT_ACCESS_TOKEN>


Frontend must store the token securely after login and attach it to every protected request.

---

## 🔑 AUTH MODULE

### 1️⃣ Login (CSR / NGO / Clinic)

POST `/auth/login`

Auth: ❌ No token required

Request:
```json
{
  "email": "user1@example.com",
  "password": "1234"
}
Response:

json

{
  "access_token": "JWT_TOKEN",
  "token_type": "bearer"
}
2️⃣ Set Password (After Verification)
POST /auth/set-password

Auth: ❌ No token required

Request:

json

{
  "email": "user1@example.com",
  "new_password": "1234"
}
Notes:

Allowed only if entity (Company / NGO) is verified

One-time operation

🏢 CSR (COMPANY) MODULE
3️⃣ Register Company (CSR Onboarding)
POST /companies/register

Auth: ❌ No token

Request:

json
{
  "company_name": "ABC Healthcare Ltd",
  "cin": "L12345TN2020PLC000001",
  "pan": "ABCDE1234F",
  "official_email": "user1@example.com"
}
Response:

json
{
  "message": "Company verified successfully. Please set password."
}
4️⃣ Create Donation (CSR)
POST /donations

Auth: ✅ CSR only

Request:

json
{
  "item_name": "Medical Kits",
  "quantity": 100,
  "purpose": "Rural healthcare support",
  "board_resolution_ref": "BR-CSR-2026-007"
}
Response:

json
{
  "donation_id": 12,
  "status": "AUTHORIZED"
}
5️⃣ CSR Donation History
GET /donations/my

Auth: ✅ CSR only

Response:

json
[
  {
    "donation_id": 12,
    "item_name": "Medical Kits",
    "quantity": 100,
    "status": "AUTHORIZED",
    "created_at": "2026-01-23T10:30:00Z"
  }
]
🏥 NGO MODULE
6️⃣ Register NGO
POST /ngo/register

Auth: ❌ No token

Request:

json
{
  "ngo_name": "Health Reach Foundation",
  "csr_1_number": "CSR00012345",
  "has_80g": true,
  "official_email": "contact@healthreach.org"
}
Response:

json
{
  "message": "NGO verified successfully. Please set password."
}
7️⃣ View Pending Donations
GET /ngo/donations/pending

Auth: ✅ NGO only

Response:

json
[
  {
    "donation_id": 12,
    "company_name": "ABC Healthcare Ltd",
    "item_name": "Medical Kits",
    "quantity": 100,
    "status": "AUTHORIZED"
  }
]
8️⃣ Accept Donation
POST /ngo/donations/{donation_id}/accept

Auth: ✅ NGO only

Response:

json
{
  "donation_id": 12,
  "status": "ACCEPTED"
}
9️⃣ Allocate Donation to Clinic
POST /ngo/donations/{donation_id}/allocate

Auth: ✅ NGO only

Request:

json
{
  "clinic_id": 3,
  "quantity": 40
}
Response:

json
{
  "allocation_id": 7,
  "status": "ALLOCATED"
}
🏥 CLINIC MODULE
🔟 Register Clinic (By NGO)
POST /ngo/clinics

Auth: ✅ NGO only

Request:

json
{
  "clinic_name": "Village Health Center",
  "official_email": "clinic@vhc.org"
}
1️⃣1️⃣ Confirm Allocation Receipt
POST /clinic/allocations/{allocation_id}/confirm

Auth: ✅ Clinic only

Response:

json
{
  "allocation_id": 7,
  "status": "RECEIVED"
}
🔍 AUDITOR MODULE (READ-ONLY)
1️⃣2️⃣ Donation Trace (End-to-End)
GET /audit/donations/{donation_id}

Auth: ✅ Auditor only

Response:

json
{
  "donation_id": 12,
  "company": {
    "name": "ABC Healthcare Ltd",
    "cin": "L12345TN2020PLC000001"
  },
  "ngo": {
    "name": "Health Reach Foundation"
  },
  "allocations": [
    {
      "clinic_name": "Village Health Center",
      "quantity": 40,
      "status": "RECEIVED"
    }
  ]
}