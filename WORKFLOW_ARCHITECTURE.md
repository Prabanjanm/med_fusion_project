# CSR Tracker - End-to-End Workflow Architecture

This document outlines the complete data flow, role-based access control, and API integration strategy for the CSR Tracker application, ensuring strict alignment with the existing Backend Architecture.

## 1. Architecture Overview

The system follows a strict hierarchical flow:
**CSR (Donor) → NGO (Aggregator) → Clinic (Beneficiary)**
**Auditor** oversees all transactions.

### Key Constraints Adhered To:
- No changes to Backend Code (Routers/Schemas).
- Frontend uses existing Backend Routes.
- Assumed Routes (where not visible in `ngo/router.py` etc.) are implemented based on Prompt Requirements.

---

## 2. Role-Based Workflows & API Mapping

### Role 1: CSR (Corporate Donor)
**Goal:** Create Donation Listings.

| UI Action | Backend Route (Method) | Payload Schema | Status Transition |
|-----------|------------------------|----------------|-------------------|
| Submit Donation | `/donations` (POST) | `DonationCreate` (item_name, quantity, purpose, board_resolution_ref, csr_policy_declared) | `PENDING` → `AUTHORIZED` (if auto-verified) |

**Frontend Component:** `CreateDonation.jsx`
- **Updates:** Now includes "Board Resolution" field and "CSR Policy Declaration" (Required by Backend).

---

### Role 2: NGO (Aggregator)
**Goal:** Accept Donations, Manage Inventory, Allocate to Clinics.

#### Step 2.1: Accept Donation from CSR
| UI Action | Backend Route (Method) | Notes | Status Transition |
|-----------|------------------------|-------|-------------------|
| View Available | `/ngo/donations/available` (GET) | Lists all donations with `AUTHORIZED` status. | N/A |
| Accept Donation | `/ngo/donations/{id}/accept` (POST) | Signals NGO acceptance. | `AUTHORIZED` → `ACCEPTED` |

**Frontend Component:** `NgoPendingDonations.jsx`

#### Step 2.2: Allocate to Clinic
| UI Action | Backend Route (Method) | Payload Schema | Status Transition |
|-----------|------------------------|----------------|-------------------|
| View Requests | `/ngo/dashboard/data` (GET) | Returns `clinic_requirements`. | N/A |
| **Allocate** | `/ngo/donations/allocate` (POST) | `AllocationCreate` (donation_id, clinic_requirement_id) | `ACCEPTED` → `ALLOCATED` |

**Frontend Component:** `NgoClinicRequests.jsx`
- **Logic:** User selects a specific `Donation Batch` to fulfill a `Clinic Requirement`. Allocation is 1-to-1 (Batch to Requirement).

---

### Role 3: Clinic (Receiver)
**Goal:** Request Products, Confirm Receipt.

| UI Action | Backend Route (Method) | Notes | Status Transition |
|-----------|------------------------|-------|-------------------|
| Request Item | `/clinic/requests` (POST) * | Assumed Endpoint. Maps to `ClinicNeedCreate`. | `PENDING` |
| View History | `/clinic/allocations` (GET) | | N/A |
| Confirm Receipt | `/clinic/allocations/{id}/confirm` (POST) | Confirms physical delivery. | `ALLOCATED` → `RECEIVED` |

**Frontend Component:** `ClinicProductRequest.jsx`
- *Note: Since `clinic/router.py` does not explicitly show a Request creation endpoint, we assume it exists as per Project Requirements involved in "Step 5".*

---

### Role 4: Auditor (Verifier)
**Goal:** Verify Transactions, Approve Allocations.

| UI Action | Backend Route (Method) | Notes |
|-----------|------------------------|-------|
| View Trail | `/audit/donations/{id}` (GET) | Full text trace. |
| Verify Donation | `/audit/verify/donation` (POST) | |
| Verify Allocation | `/audit/verify/allocation` (POST) | |

---

## 3. Data Flow & State Machine

1.  **Creation**: CSR POSTs Donation. Status: `PENDING` / `AUTHORIZED`.
2.  **Acceptance**: NGO GETs Available. POSTs Accept. Status: `AUTHORIZED` → `ACCEPTED`. **(Inventory Created)**
3.  **Need Identification**: Clinic POSTs Request. Status: `PENDING`.
4.  **Allocation**: NGO GETs Requests. Selects `Donation Batch`. POSTs Allocate. Status: `ALLOCATED`.
5.  **Audit**: Auditor Verifies. Status: `VERIFIED`.
6.  **Usage**: Clinic Confirms Receipt. Status: `RECEIVED`.

## 4. Implementation Details

- **Strict Mode**: `api.js` is configured to hit `http://localhost:8000`. Ensure Backend is running.
- **Error Handling**: 422 Validation Errors (e.g. missing `board_resolution_ref`) are now handled by detailed form inputs.
- **Authentication**: All routes use `Bearer Token`. `AuthContext` ensures Role redirects.

## 5. Deployment Readiness
This Frontend is now fully decoupled from Mock Data (LocalStorage) and ready for Integration Testing with the Real Backend.
