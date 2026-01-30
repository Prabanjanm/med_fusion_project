# CSR Donation Workflow - Quick Reference

## 🎯 System Goal
**Ensure transparency, verification, and real-world validity in CSR donations**

---

## 👥 Actors
- **CSR** - Corporate Donors
- **NGO** - Central Verifiers & Allocators  
- **Clinic** - End Beneficiaries

---

## 📋 5-Step Workflow

### 1️⃣ CSR Product Declaration
**Route:** `/csr/declare-product`

**CSR submits:**
- Product details (name, category, quantity)
- Authenticity proof (invoice, batch ID, certifications)
- Availability window

**Result:** Immutable declaration with status `SUBMITTED`

---

### 2️⃣ NGO Product Verification
**Route:** `/ngo/verify-products`

**NGO verifies:**
- Product authenticity
- Quantity accuracy
- Compliance standards
- No duplication/misuse

**Actions:** Approve → `APPROVED_FOR_ALLOCATION` | Reject → `REJECTED`

---

### 3️⃣ Clinic Product Request
**Route:** `/clinic/catalog`

**Clinic can:**
- View ONLY verified products
- Request needed quantity
- Provide medical justification (50+ chars required)
- Set urgency level

**Result:** Request with status `PENDING_REVIEW`

---

### 4️⃣ NGO Request Validation
**Route:** `/ngo/validate-requests`

**NGO validates:**
- Medical need legitimacy
- Quantity reasonableness
- Clinic usage history
- Product availability

**Actions:** Approve | Adjust Quantity | Reject

---

### 5️⃣ Final Allocation
**Route:** `/ngo/allocate`

**NGO finalizes:**
- Allocation confirmation
- Multi-party notification
- Immutable record creation
- Blockchain proof generation

**Result:** `ALLOCATED` → `IN_TRANSIT` → `RECEIVED` → `COMPLETED`

---

## 🔒 Core Principles

✅ **No Direct CSR → Clinic** - NGO verification required  
✅ **Dual Verification** - Products AND requests verified  
✅ **Immutability** - Declarations locked after submission  
✅ **Transparency** - Full audit trail  
✅ **Proof Before Claims** - Verification before allocation  

---

## 🚀 Quick Start

### For CSR Organizations
1. Login at `/csr/login`
2. Go to "Declare Product"
3. Fill form with invoice proof
4. Submit (immutable)

### For NGOs
1. Login at `/ngo/login`
2. Verify products at "Product Verification"
3. Validate requests at "Request Validation"
4. Allocate at "Allocate to Clinic"

### For Clinics
1. Login at `/clinic/login`
2. Browse "Product Catalog"
3. Request with justification
4. Await NGO validation

---

## 📊 Status Flow

```
PRODUCT: SUBMITTED → APPROVED_FOR_ALLOCATION → (visible to clinics)
REQUEST: PENDING_REVIEW → APPROVED → ALLOCATED → COMPLETED
```

---

## 🎨 UI Components Created

| Component | Path | Purpose |
|-----------|------|---------|
| ProductDeclaration | `/csr/declare-product` | CSR product submission |
| ProductVerification | `/ngo/verify-products` | NGO product review |
| ProductCatalog | `/clinic/catalog` | Clinic product browsing |
| RequestValidation | `/ngo/validate-requests` | NGO request review |

---

## 🔐 Security Features

- **Immutable Declarations** - Cannot edit after submission
- **Invoice Verification** - Required for authenticity
- **Justification Enforcement** - Minimum 50 characters
- **Quantity Validation** - Cannot exceed available
- **Audit Trail** - All actions logged
- **Blockchain Proof** - Cryptographic verification

---

## 📈 Impact Metrics

The system ensures:
- ✅ Only genuine products donated
- ✅ Only real medical needs fulfilled
- ✅ NGOs as trusted verifiers (not just intermediaries)
- ✅ CSR impact is provable and traceable
- ✅ Misuse-resistant workflow

---

## 📖 Full Documentation

See `WORKFLOW_DOCUMENTATION.md` for complete details.
