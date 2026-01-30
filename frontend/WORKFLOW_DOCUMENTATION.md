# CSR Donation Verification Workflow

## System Overview

This platform implements a **transparent, verified, and misuse-resistant** donation workflow for CSR organizations, NGOs, and clinics. Every step is designed to ensure authenticity, prevent fraud, and create immutable proof of impact.

---

## Workflow Actors

1. **CSR (Corporate Donor)** - Submits product declarations
2. **NGO (Central Verifier & Allocator)** - Verifies products and validates clinic requests
3. **Clinic (End Beneficiary)** - Requests verified products with justification

---

## Complete Workflow (5 Steps)

### **STEP 1: CSR Product Declaration**

**Component:** `/csr/declare-product` (`ProductDeclaration.jsx`)

**Purpose:** CSR organizations submit products they wish to donate.

**Required Information:**
- Product name and category
- Quantity available and unit
- Expiry date (if applicable)
- Proof of authenticity:
  - Invoice number (required)
  - Batch ID (optional)
  - Certification reference (optional)
- Availability window (start and end dates)

**Key Features:**
- ✅ **Immutable Submission** - Once submitted, declarations cannot be edited or deleted
- ✅ **Locked Status** - Initial status: `SUBMITTED`
- ✅ **Authenticity Requirements** - Invoice number is mandatory for verification
- ✅ **Visual Confirmation** - Success screen with unique declaration ID

**Status Flow:**
```
SUBMITTED (locked, awaiting NGO verification)
```

---

### **STEP 2: NGO Product Verification**

**Component:** `/ngo/verify-products` (`ProductVerification.jsx`)

**Purpose:** NGOs review and verify the authenticity and compliance of CSR product declarations.

**Verification Criteria:**
- Product authenticity (invoice, batch ID, certifications)
- Quantity accuracy
- Compliance with donation standards
- Duplication or misuse prevention

**Actions Available:**
- **Approve for Allocation** - Product becomes visible to clinics
- **Reject** - Product is flagged and hidden from clinics
- **Add Verification Notes** - Document the verification decision

**Key Features:**
- ✅ **Filterable Dashboard** - View pending, approved, or rejected products
- ✅ **Detailed Product Review** - All submitted information visible
- ✅ **Verification Notes** - Required for rejections, optional for approvals
- ✅ **Stats Overview** - Real-time counts of pending/approved/rejected products

**Status Flow:**
```
SUBMITTED → APPROVED_FOR_ALLOCATION (visible to clinics)
         → REJECTED (hidden from clinics)
```

---

### **STEP 3: Clinic Product Catalog & Request**

**Component:** `/clinic/catalog` (`ProductCatalog.jsx`)

**Purpose:** Clinics browse ONLY verified products and submit requests with medical justification.

**Visibility Rules:**
- ✅ Only products with status `APPROVED_FOR_ALLOCATION` are visible
- ✅ Donor identities are hidden (unless explicitly permitted)
- ✅ Product details, quantities, and expiry dates are shown

**Request Requirements:**
- Requested quantity (cannot exceed available)
- Medical justification (minimum 50 characters)
- Urgency level (LOW, MEDIUM, HIGH, CRITICAL)
- Supporting evidence (optional)

**Key Features:**
- ✅ **Search & Filter** - By product name and category
- ✅ **Product Cards** - Visual catalog with availability info
- ✅ **Detailed Justification** - Enforced minimum character count
- ✅ **Request Validation** - Client-side checks before submission

**Status Flow:**
```
Request Created → PENDING_REVIEW (awaiting NGO validation)
```

---

### **STEP 4: NGO Request Validation**

**Component:** `/ngo/validate-requests` (`RequestValidation.jsx`)

**Purpose:** NGOs validate clinic requests for reasonableness, legitimacy, and medical necessity.

**Validation Criteria:**
- Medical need matches requested products
- Requested quantities are reasonable
- Clinic legitimacy and usage history
- Product availability across CSR donors

**Actions Available:**
- **Approve** - Accept request as-is
- **Adjust** - Modify requested quantity (e.g., reduce inflated requests)
- **Reject** - Deny request with explanation

**Key Features:**
- ✅ **Urgency-Based Prioritization** - Color-coded urgency levels
- ✅ **Justification Review** - Full visibility into clinic's medical need
- ✅ **Quantity Adjustment** - NGO can approve partial quantities
- ✅ **Validation Notes** - Document decision rationale
- ✅ **Stats Dashboard** - Track pending, approved, and rejected requests

**Status Flow:**
```
PENDING_REVIEW → APPROVED (with original or adjusted quantity)
              → REJECTED (with validation notes)
```

---

### **STEP 5: Final Allocation & Confirmation**

**Component:** `/ngo/allocate` (`AllocateToClinic.jsx` - existing)

**Purpose:** Once approved, NGO finalizes allocation and notifies all parties.

**Allocation Process:**
1. Approved requests are queued for allocation
2. NGO confirms final allocation details
3. Products are marked as allocated to specific clinic
4. CSR donors are notified of utilization
5. Clinics receive confirmation

**Key Features:**
- ✅ **Immutable Allocation Record** - Permanent, auditable record
- ✅ **Multi-Party Notification** - CSR, NGO, and Clinic all informed
- ✅ **Blockchain Hash** - Cryptographic proof of allocation
- ✅ **Status Tracking** - Full lifecycle visibility

**Status Flow:**
```
APPROVED → ALLOCATED → IN_TRANSIT → RECEIVED → COMPLETED
```

---

## Core Principles

### 1. **No Direct CSR → Clinic Allocation**
All allocations MUST go through NGO verification. This prevents:
- Fake or inflated donations
- Mismatched product-need pairs
- Favoritism or bias in allocation

### 2. **Dual Verification**
- **Product Verification** - NGO verifies CSR declarations
- **Request Validation** - NGO validates clinic requests

### 3. **Immutability**
- Product declarations cannot be edited after submission
- All actions are logged and timestamped
- Allocation records are permanent

### 4. **Transparency with Privacy**
- Clinics see verified products but not donor identities (by default)
- All stakeholders can audit the full chain
- Sensitive information is protected

### 5. **Proof Before Claims**
- Products must be verified before allocation
- Requests must be validated before approval
- No retroactive justifications allowed

---

## System Goals

### ✅ **Only Genuine Products are Donated**
- Invoice numbers required
- NGO verification mandatory
- Batch IDs and certifications tracked

### ✅ **Only Real Medical Needs are Fulfilled**
- Detailed justification required (50+ characters)
- Urgency levels prioritize critical needs
- NGO can adjust inflated requests

### ✅ **NGOs Act as Trusted Verifiers**
- Not just intermediaries
- Active validation at both ends
- Power to approve, reject, or adjust

### ✅ **CSR Impact is Provable**
- Immutable allocation records
- Blockchain hashes for verification
- Full audit trail from declaration to delivery

---

## Navigation Map

### CSR Dashboard
- `/csr/dashboard` - Overview & analytics
- `/csr/declare-product` - **NEW: Submit product declarations**
- `/csr/create-donation` - Legacy donation flow
- `/csr/history` - View past donations

### NGO Dashboard
- `/ngo/dashboard` - Overview & incoming resources
- `/ngo/verify-products` - **NEW: Verify CSR product declarations**
- `/ngo/validate-requests` - **NEW: Validate clinic requests**
- `/ngo/allocate` - Finalize allocations
- `/ngo/history` - View allocation history

### Clinic Dashboard
- `/clinic/dashboard` - Overview & received items
- `/clinic/catalog` - **NEW: Browse verified products & submit requests**
- `/clinic/receipts` - Confirm receipt of allocations

---

## Data Flow Diagram

```
CSR Product Declaration
        ↓
    SUBMITTED
        ↓
NGO Verification
        ↓
APPROVED_FOR_ALLOCATION ← (visible to clinics)
        ↓
Clinic Request Submission
        ↓
  PENDING_REVIEW
        ↓
NGO Request Validation
        ↓
    APPROVED
        ↓
NGO Final Allocation
        ↓
   ALLOCATED → IN_TRANSIT → RECEIVED → COMPLETED
```

---

## Status Definitions

### Product Declaration Statuses
- `SUBMITTED` - Awaiting NGO verification
- `UNDER_REVIEW` - NGO is actively reviewing
- `APPROVED_FOR_ALLOCATION` - Verified and visible to clinics
- `REJECTED` - Failed verification, hidden from clinics

### Clinic Request Statuses
- `PENDING_REVIEW` - Awaiting NGO validation
- `UNDER_VALIDATION` - NGO is actively validating
- `APPROVED` - Validated and ready for allocation
- `REJECTED` - Failed validation
- `ADJUSTED` - Approved with modified quantity

### Allocation Statuses (Existing)
- `ALLOCATED` - Assigned to clinic
- `IN_TRANSIT` - Being delivered
- `RECEIVED` - Confirmed by clinic
- `COMPLETED` - Fully processed

---

## Mock Data Structure

### Product Declaration
```javascript
{
  id: 'PROD-1738234567890',
  company_id: 123,
  product_name: 'N95 Respirator Masks',
  category: 'PPE (Personal Protective Equipment)',
  quantity_available: 500,
  unit: 'boxes',
  invoice_number: 'INV-2025-MT-1234',
  batch_id: 'BATCH-N95-2025-A',
  certification_ref: 'FDA-510K-2024',
  expiry_date: '2026-12-31',
  availability_start: '2025-02-01',
  availability_end: '2025-06-30',
  status: 'SUBMITTED',
  verified_by_ngo_id: null,
  verification_notes: null,
  created_at: '2025-01-29T10:30:00Z'
}
```

### Clinic Request
```javascript
{
  id: 'REQ-1738234567890',
  clinic_id: 456,
  product_declaration_id: 'PROD-1738234567890',
  requested_quantity: 100,
  urgency_level: 'HIGH',
  justification: 'We are experiencing a surge in respiratory illness cases...',
  supporting_evidence: 'Patient admission records show 40% increase...',
  status: 'PENDING_REVIEW',
  validated_by_ngo_id: null,
  approved_quantity: null,
  validation_notes: null,
  created_at: '2025-01-30T08:00:00Z'
}
```

---

## Future Enhancements

1. **Backend Integration**
   - Connect to FastAPI endpoints
   - Real-time status updates
   - Database persistence

2. **Blockchain Integration**
   - Hash product declarations
   - Hash clinic requests
   - Hash final allocations
   - Public verification portal

3. **Advanced Features**
   - Multi-NGO verification (consensus)
   - Automated compliance checks
   - AI-powered fraud detection
   - Real-time inventory tracking

4. **Notifications**
   - Email/SMS alerts for status changes
   - Dashboard notifications
   - Urgency-based prioritization

---

## Implementation Status

✅ **Completed (Frontend)**
- CSR Product Declaration Form
- NGO Product Verification Dashboard
- Clinic Product Catalog & Request Form
- NGO Request Validation Interface
- Routing integration
- Mock data for testing

⏳ **Pending (Backend)**
- Database models
- API endpoints
- Authentication integration
- Blockchain hashing

---

## Testing the Workflow

1. **As CSR:**
   - Navigate to `/csr/declare-product`
   - Fill out product declaration form
   - Submit and note the declaration ID

2. **As NGO:**
   - Navigate to `/ngo/verify-products`
   - Review pending declarations
   - Approve or reject with notes

3. **As Clinic:**
   - Navigate to `/clinic/catalog`
   - Browse verified products
   - Submit request with justification

4. **As NGO:**
   - Navigate to `/ngo/validate-requests`
   - Review clinic requests
   - Approve, adjust, or reject

5. **As NGO:**
   - Navigate to `/ngo/allocate`
   - Finalize allocation
   - Generate blockchain proof

---

## Contact & Support

For questions about this workflow, contact the development team or refer to the component-level documentation in each `.jsx` file.
