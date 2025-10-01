# Payment Flow Architecture - WEMA HMS

## Current Finance Portal Structure (Existing UI)

### Pages Already Built:
1. **Dashboard** (`/finance/dashboard`) - Overview with stats cards and charts
2. **Payment Queue** (`/finance/payment-queue`) - Two tabs: "Pending Payments" & "Recent Payments"
3. **Daily Operations** (`/finance/daily-ops`) - Daily balance, expenses, outstanding bills

### Current Payment Queue Features:
- ✅ Two tabs: Pending (Clock icon) and Recent (CheckCircle icon)
- ✅ Search by patient ID/name/service
- ✅ Filter by service type (Consultation, Lab, Medication, File Fee, Other)
- ✅ Card-based layout showing payment details
- ✅ Real-time polling every 3 seconds
- ✅ Total amount calculation in header

---

## Current Issues
1. ❌ Payments created directly as PAID (file fees bypass queue)
2. ❌ No auto-creation of payments from doctor/lab/pharmacy services
3. ❌ Daily Ops page shows mock data
4. ❌ No payment ledger/history export
5. ❌ Missing payment method auto-detection for NHIF patients

## Proposed Unified Payment Flow (Minimal UI Changes)

### Core Principle
**Auto-create PENDING payments at each service point → Finance approves via existing Payment Queue**

---

## Payment Journey (Using Existing UI)

```
Service Completed → Auto-create PENDING Payment → Shows in Payment Queue "Pending" tab
  ↓
Finance staff clicks payment card → PaymentRecordModal opens
  ↓
Selects payment method → Clicks "Record Payment"
  ↓
Payment marked PAID → Moves to "Recent Payments" tab → Service unlocked
```

### Detailed Flow

#### 1. **FILE FEE (Registration)**
**Current**: Reception marks as paid immediately
**New**:
- Reception creates **PENDING** ServicePayment
- Patient gets temporary access to doctor queue
- Finance reviews and marks as **PAID**
- OR: Keep current flow (paid immediately) since it's a gate-keeping fee

**Recommendation**: Keep file fee as immediate payment (it's a prerequisite)

---

#### 2. **CONSULTATION FEE**
```
Doctor completes consultation
  ↓
System creates PENDING payment for consultation
  ↓
Patient status: PENDING_CONSULTATION_PAYMENT
  ↓
Finance marks payment as PAID
  ↓
Patient status changes to: TREATMENT_PRESCRIBED or PENDING_LAB_PAYMENT
```

---

#### 3. **LAB TESTS**
```
Doctor orders lab tests
  ↓
System creates PENDING payment for lab tests
  ↓
Patient status: PENDING_LAB_PAYMENT
  ↓
Finance marks payment as PAID → status: LAB_PAID
  ↓
Lab processes tests → status: LAB_COMPLETED
  ↓
Results sent back to doctor
```

---

#### 4. **PHARMACY/MEDICATION**
```
Doctor prescribes medication
  ↓
System creates PENDING payment for prescriptions
  ↓
Patient status: TREATMENT_PRESCRIBED
  ↓
Finance marks payment as PAID → status: PHARMACY_PAID
  ↓
Pharmacy dispenses medication
  ↓
Patient status: COMPLETED
```

---

## Database Changes Needed

### ServicePayment Model (Already Exists)
```python
status = 'PENDING'  # Default for all new payments
status = 'PAID'     # After finance approval
status = 'WAIVED'   # If payment is waived (NHIF, charity, etc.)
status = 'REFUNDED' # If refund issued
```

### Auto-Create Payments (Backend Changes)

#### When Doctor Completes Consultation:
```python
# backend/doctor/views.py - save_consultation endpoint
ServicePayment.objects.create(
    patient_id=patient.patient_id,
    patient_name=patient.full_name,
    service_type='CONSULTATION',
    service_name='Doctor Consultation Fee',
    reference_id=consultation.id,
    amount=get_service_price('CONSULTATION'),  # From ServicePricing
    status='PENDING',  # KEY CHANGE
    processed_by=None  # Not yet processed
)
```

#### When Doctor Orders Lab Tests:
```python
# backend/doctor/views.py - create_lab_request endpoint
total_amount = sum([test.price for test in lab_tests])
ServicePayment.objects.create(
    patient_id=patient.patient_id,
    patient_name=patient.full_name,
    service_type='LAB_TEST',
    service_name=f'Laboratory Tests ({len(lab_tests)} tests)',
    reference_id=lab_request.id,
    amount=total_amount,
    status='PENDING'
)
```

#### When Doctor Prescribes Medication:
```python
# backend/doctor/views.py - create_prescription endpoint
total_amount = sum([med.price * med.quantity for med in medications])
ServicePayment.objects.create(
    patient_id=patient.patient_id,
    patient_name=patient.full_name,
    service_type='MEDICATION',
    service_name=f'Prescription ({len(medications)} items)',
    reference_id=prescription.id,
    amount=total_amount,
    status='PENDING'
)
```

---

## Finance Portal Enhancements (Minimal Breaking Changes)

### 1. Payment Queue Page ✅ (Already Exists - Just Connect to API)
**Current State**: Has UI structure with tabs, filters, search
**Changes Needed**:
- ✅ Connect to real API (already done)
- ✅ PaymentRecordModal already functional
- 🔄 Add "Waive Payment" option in modal (small addition)
- 🔄 Add date range filter (Today, This Week, This Month)

**NO MAJOR UI CHANGES NEEDED**

### 2. Daily Operations Page 🔄 (Exists but needs API connection)
**Current State**: Shows mock data for daily balance, expenses, outstanding bills
**Changes Needed**:
- 🔄 Connect to real ServicePayment API for revenue calculations
- 🔄 Add payment ledger table (replace mock outstanding bills section)
- 🔄 Calculate closing balance from ServicePayment records

**UI Structure to Keep**:
- Three tabs: "Daily Balance", "Expenses", "Outstanding Bills"
- Stats cards at top
- Date selector

**Modifications**:
- Add "Payment Ledger" as 4th tab OR
- Replace "Outstanding Bills" tab with "Payment Ledger"
- Add export button (Excel/PDF)

### 3. Dashboard Page ✅ (Keep As Is - Just Update Data Source)
**Current State**: Shows revenue breakdown, payment methods, stats cards
**Changes Needed**:
- 🔄 Connect charts to real ServicePayment data
- 🔄 Update stats cards with live calculations

**NO UI CHANGES**

---

## Implementation Priority (Minimal UI Disruption)

### Phase 1: Backend Payment Auto-Creation (2-3 days)
1. ✅ Update ServicePayment PAYMENT_METHODS (add NHIF) - **DONE**
2. ✅ Remove notes field from payment modal - **DONE**
3. ⏳ Create helper function to auto-create payments with NHIF detection
4. ⏳ Modify doctor consultation endpoint to create PENDING payment
5. ⏳ Modify doctor lab request endpoint to create PENDING payment
6. ⏳ Modify doctor prescription endpoint to create PENDING payment
7. ⏳ Update patient status workflow to check payment status

**UI Impact**: NONE - Just backend changes

### Phase 2: Finance Portal API Connections (2-3 days)
8. ✅ Payment Queue already working - **DONE**
9. ⏳ Add waive payment button to PaymentRecordModal
10. ⏳ Connect Dashboard charts to real ServicePayment API
11. ⏳ Update Daily Ops to show real revenue calculations
12. ⏳ Add date range filter to Payment Queue tabs

**UI Impact**: MINIMAL - Just adding a button and connecting existing UI to APIs

### Phase 3: Payment Ledger in Daily Ops (1-2 days)
13. ⏳ Add "Payment Ledger" tab to Daily Ops page (or replace Outstanding Bills)
14. ⏳ Create table showing all payments with filters
15. ⏳ Add daily summary section at bottom (closing balance)
16. ⏳ Add export to Excel button

**UI Impact**: LOW - Adding one new tab to existing page

### Phase 4: Polish & Testing (1 day)
17. ⏳ Test complete patient flow: Registration → Doctor → Lab → Pharmacy
18. ⏳ Test NHIF auto-detection
19. ⏳ Test payment queue real-time updates
20. ⏳ Verify closing balance calculations

**Total Time**: 6-9 days (1-2 weeks)
**UI Breaking Changes**: NONE - Only enhancements to existing pages

---

## NHIF Auto-Selection Logic

### At Payment Creation:
```python
# Check if patient is NHIF type
payment_method = 'NHIF' if patient.patient_type == 'NHIF' else 'CASH'

ServicePayment.objects.create(
    ...
    payment_method=payment_method,
    status='PENDING'  # Finance still needs to verify NHIF coverage
)
```

### At Finance Approval:
- If NHIF patient, finance verifies card/coverage
- If covered → mark as PAID with method=NHIF
- If not covered → patient must pay cash (update method)

---

## Vital Signs Display Issue - RESOLVED ✅

### Issue: Only 4 vital signs showing (BP missing)
**Root Cause Found**: `PatientDetailSerializer` was missing `respiratory_rate` field in line 133

**Fix Applied**:
- ✅ Added `respiratory_rate` to `PatientDetailSerializer.Meta.fields`
- ✅ Added `patient_category` to same serializer
- ✅ Added console logging to `PatientDetailsModal.tsx:86-97`

**Expected Result**: All 5 vital signs now returned by API:
1. Temperature
2. Blood Pressure (Systolic/Diastolic)
3. Pulse Rate
4. Respiratory Rate ← **NOW INCLUDED**

**Test Instructions**:
1. Login and view patient PAT69
2. Open browser console (F12)
3. Look for log: `Patient data received: {respiratory_rate: 56, blood_pressure_systolic: 119...}`
4. All 5 vital signs should display in modal

**If still not showing**: Check console for actual API response structure

---

## Next Steps

1. **Test Current Fixes**:
   - Login and test finance portal access
   - View patient details to confirm all 5 vital signs show
   - Register new patient to test file fee flow

2. **Implement Phase 1** (if approved):
   - Modify doctor endpoints to create PENDING payments
   - Update patient status workflow
   - Test complete flow: Registration → Doctor → Lab → Pharmacy

3. **Build Payment Ledger** (Phase 2):
   - Create new page with filters
   - Add daily summary
   - Test closing balance calculations

---

## Questions for Discussion

1. **File Fee**: Should it remain immediate payment or go through finance?
   - **Recommendation**: Keep immediate (it's a gate-keeping fee)

2. **Consultation Fee**: When should it be created?
   - **Option A**: When doctor starts consultation (before completing)
   - **Option B**: When doctor completes consultation ✅ **RECOMMENDED**

3. **NHIF Verification**: Should NHIF payments auto-approve or still need finance verification?
   - **Recommendation**: Still need verification (to check card validity/coverage)

4. **Waived Payments**: Who can waive payments?
   - **Recommendation**: Finance and Admin only

5. **Refunds**: Do we need refund functionality?
   - **Recommendation**: Yes, add in Phase 2

---

**Status**: Ready for implementation pending approval
**Created**: 2025-10-01
**Last Updated**: 2025-10-01
