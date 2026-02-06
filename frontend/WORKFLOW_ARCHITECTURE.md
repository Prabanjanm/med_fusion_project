# End-to-End Workflow & Architecture Guide

This document outlines the frontend implementation of the CSR → NGO → Clinic → Auditor workflow, ensuring strict alignment with backend roles and state transitions.

## 1. Role-Based Page Structure

| Role | Dashboard route | Key Actions |
|---|---|---|
| **CSR** | `/csr` | Create Donation, View Status (Listed/Utilized), manage approvals (if applicable). |
| **NGO** | `/ngo` | View CSR Listings, Request Items, View Inventory, Allocate to Clinics. |
| **Clinic** | `/clinic` | View NGO Inventory, Request Supplies, Confirm Receipt. |
| **Auditor** | `/auditor` | Verify CSR-NGO transactions, Approve NGO-Clinic Allocations, View Audit Trail. |

## 2. API Integration Mapping

All interactions are routed through `src/services/api.js`.

| Step | Action | Endpoint (Assumed) | Payload | Status Change |
|---|---|---|---|---|
| **Step 1** | CSR Creates Donation | `POST /companies/donations` | `{ item, qty, category }` | `LISTED` |
| **Step 2** | NGO Requests Donation | `POST /ngo/requests/csr` | `{ donationId }` | `NGO_REQUESTED` |
| **Step 3** | Auditor Verifies CSR-NGO | `POST /audit/verify/donation` | `{ donationId, decision }` | `CSR_APPROVED` / `REJECTED` |
| **Step 4** | NGO Inventory | `GET /ngo/inventory` | - | (Derived from Approved Donations) |
| **Step 5** | Clinic Requests Items | `POST /clinic/requests` | `{ item, qty, reason }` | `CLINIC_REQUESTED` |
| **Step 6** | NGO Allocates | `POST /ngo/allocate` | `{ requestId, qty }` | `ALLOCATED_PENDING_AUDIT` |
| **Step 7** | Auditor Approves Allocation | `POST /audit/verify/allocation` | `{ allocationId, decision }` | `DELIVERED_APPROVED` / `ALLOCATION_REJECTED` |
| **Step 8** | Final Visibility | `GET /donations/history` | - | `UTILIZED` (when delivered) |

## 3. State Transition Table

| Current Status | Role | Allowed Action | Next Status (Success) | Next Status (Failure) |
|---|---|---|---|---|
| `LISTED` | NGO | Request Donation | `NGO_REQUESTED` | - |
| `NGO_REQUESTED` | Auditor | Verify (Accept/Reject) | `CSR_APPROVED` | `REJECTED` |
| `CSR_APPROVED` | Clinic | Request from Inventory | `CLINIC_REQUESTED` | - |
| `CLINIC_REQUESTED` | NGO | Allocate | `ALLOCATED_PENDING_AUDIT` | `REJECTED` |
| `ALLOCATED_PENDING_AUDIT` | Auditor | Final Approval | `DELIVERED_APPROVED` | `ALLOCATION_REJECTED` |
| `DELIVERED_APPROVED` | Clinic | Confirm Receipt | `UTILIZED` / `COMPLETED` | - |

## 4. UI Logic & Access Control

- **Status Chips**: We map specific colors to the strict status codes.
- **Action Buttons**: Buttons are strictly conditional:
  - `Request Donation` visible ONLY to **NGO** when status is `LISTED`.
  - `Verify` visible ONLY to **Auditor** when status is `NGO_REQUESTED` or `ALLOCATED_PENDING_AUDIT`.
  - `Allocate` visible ONLY to **NGO** when status is `CLINIC_REQUESTED`.
- **Validation**:
  - Forms prevent submission of invalid quantities (Frontend validation).
  - Error messages from Backend are displayed via toast notifications.

## 5. Error Handling

- **401 Unauthorized**: Redirect to Login.
- **403 Forbidden**: "Access Denied" page.
- **400 Bad Request**: Display specific error message from `error.detail`.
- **Network Error**: Retry mechanism or "Service Unavailable" alert.

---
**Note:** This implementation assumes the backend is the source of truth. The Frontend purely reflects the state returned by API.
