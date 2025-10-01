# 🧪 WEMA HMS - Comprehensive Scenario A Test Script

**Date**: 2025-10-01  
**Test Type**: End-to-End Patient Workflow (Direct Treatment - No Lab Tests)  
**Tester**: Manual Testing Required  
**Status**: Ready for Execution

---

## 📋 Test Overview

### Scenario A Flow
**Complete patient journey from registration to medication dispensing**

```
RECEPTION → DOCTOR → FINANCE → PHARMACY
   (Register & File Fee) → (Consultation & Prescription) → (Payment Processing) → (Medication Dispensing)
```

**Expected Duration**: 20-30 minutes  
**Expected Revenue**: File Fee (2,000) + Consultation (50,000) + Medications (~12,000) = **~64,000 TZS**

---

## 🚀 Pre-Test Checklist

### 1. Verify Services Running
```bash
# Check backend status
docker compose ps

# Expected output:
# wema_backend - running
# wema_db - running
```

### 2. Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Database**: PostgreSQL (port 5434)

### 3. Test Credentials (From CLAUDE.md)
```
RECEPTION:  REC002 / BARAKA1234@
DOCTOR:     DOC002 / MALILA1234$
FINANCE:    FIN002 / JUMANJI1234%
PHARMACY:   PHA001 / JOHNPHARMACIST1239%
ADMIN:      ADM999 / AdminSecure123!
```

---

## 📝 STEP 1: RECEPTION - New Patient Registration

### 1.1 Login as Reception
- Navigate to: http://localhost:3000/auth/login
- **Username**: `REC002`
- **Password**: `BARAKA1234@`
- Click: "Sign In"

### 1.2 Register New Patient
- Navigate to: Reception Dashboard
- Click: "Register New Patient" or "+ New Patient"

### 1.3 Fill Patient Registration Form

#### **REQUIRED FIELDS** (Cannot be empty):

**Personal Information:**
- **First Name**: `JOHN`
- **Middle Name**: `MOSES`
- **Last Name**: `MWANGI`
- **Date of Birth**: `1990-05-15` (Use date picker or format: YYYY-MM-DD)
- **Gender**: Select `Male`
- **Phone Number**: `+255712345678` (Format: +255XXXXXXXXX)

**Patient Type:**
- **Patient Type**: Select `NORMAL` (not NHIF)
- **Patient Category**: Select `OUTPATIENT`
- **NHIF Card Number**: Leave empty (only for NHIF patients)

**Emergency Contact:**
- **Emergency Contact Name**: `JANE MWANGI`
- **Emergency Contact Phone**: `+255798765432`

**Address Information:**
- **Address**: `123 Kariakoo Street, Dar es Salaam, Tanzania`

#### **OPTIONAL FIELDS** (Can be filled or left blank):

**Additional Personal Details:**
- **Tribe**: `Chagga` (or leave blank)
- **Occupation**: `Teacher` (or leave blank)

**Medical Information:**
- **Weight (kg)**: `75.5` (or leave blank)
- **Height (cm)**: `175` (or leave blank)
- **Blood Group**: Select `A+` or leave as `UNKNOWN`
- **Allergies**: `Penicillin` (or leave blank)
- **Chronic Conditions**: `None known` (or leave blank)

**Vital Signs at Registration:**
- **Temperature (°C)**: `37.2` (or leave blank)
- **Blood Pressure (Systolic)**: `120` (or leave blank)
- **Blood Pressure (Diastolic)**: `80` (or leave blank)
- **Pulse Rate (bpm)**: `75` (or leave blank)
- **Respiratory Rate (per min)**: `16` (or leave blank)

### 1.4 Submit Registration
- Review all fields
- Click: "Register Patient" or "Submit"

### 1.5 Expected Results ✅
```
✅ Patient successfully registered
✅ Patient ID auto-generated: PAT{number} (e.g., PAT64)
✅ Full name auto-formatted: JOHN MOSES MWANGI
✅ Age calculated automatically from DOB (34 years)
✅ BMI calculated if height/weight provided (24.65)
✅ Patient status: REGISTERED
✅ File fee: 2,000 TZS (for NORMAL patients)
✅ File fee status: UNPAID (or auto-paid for NHIF)
```

### 1.6 Process File Fee Payment
- Patient appears in "Pending File Fee" list
- Click on patient: "JOHN MOSES MWANGI (PAT64)"
- Click: "Process File Fee" or "Pay File Fee"
- **Amount**: 2,000 TZS (pre-filled)
- **Payment Method**: Select `CASH`
- **Amount Received**: Enter `5,000`
- **Change**: Automatically calculated: `3,000 TZS`
- Click: "Confirm Payment"

### 1.7 Expected Results After File Fee ✅
```
✅ File fee marked as PAID
✅ File fee payment date recorded
✅ Patient status: REGISTERED → (still REGISTERED until sent to doctor)
✅ Receipt generated with payment details
✅ Patient now eligible to see doctor
```

### 1.8 Send Patient to Doctor Queue
- Click: "Send to Doctor" or "Check-in to Doctor Queue"
- Confirm action

### 1.9 Expected Results ✅
```
✅ Patient status: REGISTERED → WAITING_DOCTOR
✅ Patient location: Doctor Queue
✅ Patient appears in Doctor's queue (FIFO order)
✅ Queue entry time recorded
✅ Status history updated
```

---

## 📝 STEP 2: DOCTOR - Consultation & Prescription

### 2.1 Logout and Login as Doctor
- Logout from Reception
- Login with:
  - **Username**: `DOC002`
  - **Password**: `MALILA1234$`

### 2.2 View Patient Queue
- Navigate to: Doctor Dashboard
- Click: "Patient Queue" or "View Queue"
- Patient should appear: **JOHN MOSES MWANGI (PAT64)**
- **Queue Position**: Should be in FIFO order (first-in-first-out)
- **Wait Time**: Should show time since added to queue

### 2.3 Start Consultation
- Click on patient: **JOHN MOSES MWANGI (PAT64)**
- Click: "Start Consultation" or "Begin Consultation"

### 2.4 Expected Results ✅
```
✅ Patient status: WAITING_DOCTOR → WITH_DOCTOR
✅ Patient location: Dr. {Doctor Name}'s Office
✅ Consultation form opens
✅ Patient removed from waiting queue
✅ Consultation timer starts
```

### 2.5 Fill Consultation Form

#### **REQUIRED CONSULTATION FIELDS:**

**Chief Complaint:**
- **Chief Complaint**: `Fever and headache for 3 days`

**Patient History & Symptoms:**
- **Symptoms**: 
```
Patient reports:
- High fever (started 3 days ago)
- Severe headache
- Body aches and joint pain
- Loss of appetite
- No cough or respiratory symptoms
- No vomiting or diarrhea
```

**Physical Examination:**
- **Examination Findings**:
```
General appearance: Patient in mild distress
Temperature: 38.5°C (elevated)
Blood Pressure: 120/80 mmHg (normal)
Heart Rate: 88 bpm (slightly elevated)
Respiratory Rate: 18 per minute (normal)
No signs of dehydration
No rash or skin abnormalities
Chest clear on auscultation
Abdomen soft, non-tender
```

**Vital Signs** (Fill in consultation form):
- **Temperature**: `38.5` °C
- **Blood Pressure Systolic**: `120` mmHg
- **Blood Pressure Diastolic**: `80` mmHg
- **Heart Rate**: `88` bpm
- **Respiratory Rate**: `18` per minute

**Diagnosis:**
- **Diagnosis**: `Suspected Malaria - Plasmodium falciparum infection`
- **Possible Diagnosis** (if field exists): `Viral fever, Typhoid fever (rule out)`

**Treatment Plan:**
- **Treatment Plan**:
```
1. Antimalarial therapy - Coartem (Artemether/Lumefantrine)
2. Symptomatic relief - Paracetamol for fever and pain
3. Rest and adequate hydration
4. Follow-up in 3 days if symptoms persist
5. Return immediately if symptoms worsen
```

**Clinical Notes:**
- **Clinical Notes**:
```
Patient presents with classic malaria symptoms. Lives in endemic area.
No recent travel history. No previous severe reactions to antimalarials.
Patient educated on medication compliance and warning signs.
Advised to complete full course of Coartem even if feeling better.
```

**Priority & Follow-up:**
- **Priority**: Select `NORMAL` (not emergency)
- **Follow-up Date**: `2025-10-04` (3 days from now)

**Doctor's Private Notes** (optional):
- **Doctor Notes**: `Monitor for signs of severe malaria. Patient counselled on prevention.`

### 2.6 Create Prescription

Click: "Add Prescription" or "Prescribe Medications"

#### **MEDICATION 1: Antimalarial**
- Click: "Add Medication" or "+"
- **Search Medication**: Type `Coartem`
- **Select**: `Coartem 80mg/480mg` (from dropdown)
- **Dosage**: `1 tablet`
- **Frequency**: `Twice daily` or `BD (bis in die)`
- **Duration**: `3 days` or `3 days`
- **Quantity**: `6 tablets` (auto-calculated: 1 tablet × 2 times × 3 days)
- **Instructions**: `Take with food. Complete full course. Do not skip doses.`
- Click: "Add to Prescription"

#### **MEDICATION 2: Pain Relief/Fever**
- Click: "Add Medication" or "+"
- **Search Medication**: Type `Panadol`
- **Select**: `Panadol 500mg` (Paracetamol)
- **Dosage**: `2 tablets`
- **Frequency**: `Three times daily` or `TDS (ter die sumendum)`
- **Duration**: `3 days`
- **Quantity**: `18 tablets` (auto-calculated: 2 tablets × 3 times × 3 days)
- **Instructions**: `Take after meals for fever and pain. Do not exceed 8 tablets per day.`
- Click: "Add to Prescription"

### 2.7 Review Prescription Summary
```
Prescription for: JOHN MOSES MWANGI (PAT64)

1. Coartem 80mg/480mg
   - Dosage: 1 tablet
   - Frequency: Twice daily (BD)
   - Duration: 3 days
   - Quantity: 6 tablets
   - Instructions: Take with food. Complete full course.
   - Unit Price: 12,000 TZS
   - Line Total: 12,000 TZS

2. Panadol 500mg (Paracetamol)
   - Dosage: 2 tablets
   - Frequency: Three times daily (TDS)
   - Duration: 3 days
   - Quantity: 18 tablets
   - Instructions: Take after meals for fever and pain
   - Unit Price: 200 TZS (calculated from stock)
   - Line Total: 200 TZS

TOTAL MEDICATION COST: 12,200 TZS
```

### 2.8 Complete Consultation
- Review all fields are filled
- Click: "Complete Consultation" or "Finish Consultation"

### 2.9 Expected Results ✅
```
✅ Consultation status: IN_PROGRESS → COMPLETED
✅ Consultation completion time recorded
✅ Prescription created and linked to consultation
✅ Patient status: WITH_DOCTOR → PENDING_CONSULTATION_PAYMENT
✅ Patient location: Finance - Consultation Payment
✅ ServicePayment record created:
    - Service Type: CONSULTATION
    - Service Name: Doctor Consultation - Suspected Malaria
    - Amount: 50,000 TZS (consultation fee)
    - Status: PENDING
    - Payment Method: CASH (for NORMAL patient) or NHIF (for NHIF patient)
✅ Patient removed from doctor's active list
✅ Patient appears in Finance queue
✅ Status history updated
```

**Expected Payment Breakdown:**
```
Consultation Fee: 50,000 TZS (from ServicePricing table)
Medication Cost: 12,200 TZS (Coartem + Panadol)
-----------------------------------
TOTAL TO PAY: 62,200 TZS
```

---

## 📝 STEP 3: FINANCE - Payment Processing

### 3.1 Logout and Login as Finance
- Logout from Doctor portal
- Login with:
  - **Username**: `FIN002`
  - **Password**: `JUMANJI1234%`

### 3.2 View Pending Payments
- Navigate to: Finance Dashboard
- Click: "Pending Payments" or "Payment Processing"
- Patient should appear: **JOHN MOSES MWANGI (PAT64)**
- **Status**: PENDING_CONSULTATION_PAYMENT

### 3.3 Select Patient for Payment
- Click on patient: **JOHN MOSES MWANGI (PAT64)**
- View payment details

### 3.4 Review Payment Breakdown
```
Patient: JOHN MOSES MWANGI (PAT64)
Patient Type: NORMAL (Cash Payment)

SERVICES:
1. Doctor Consultation - Suspected Malaria: 50,000 TZS

MEDICATIONS:
1. Coartem 80mg/480mg (6 tablets): 12,000 TZS
2. Panadol 500mg (18 tablets): 200 TZS

SUBTOTAL: 62,200 TZS
DISCOUNT: 0 TZS
TOTAL AMOUNT DUE: 62,200 TZS
```

### 3.5 Process Payment
- **Payment Method**: Select `CASH`
- **Amount Received**: Enter `70,000` TZS
- **Change Calculated**: Should auto-calculate: `7,800 TZS`
- Optional: Add payment notes: `Paid in full. Change given.`
- Click: "Process Payment" or "Confirm Payment"

### 3.6 Expected Results ✅
```
✅ Payment status: PENDING → PAID
✅ Payment date/time recorded
✅ Change calculated correctly: 7,800 TZS
✅ Patient status: PENDING_CONSULTATION_PAYMENT → CONSULTATION_PAID
✅ Patient location: Pharmacy Queue
✅ Receipt generated with:
    - Patient details
    - Itemized charges
    - Payment method
    - Amount received
    - Change given
    - Receipt number
    - Date/time
✅ Patient appears in Pharmacy queue
✅ Status history updated
✅ Finance daily operations updated (revenue tracking)
```

### 3.7 Print/Download Receipt (Optional)
- Click: "Print Receipt" or "Download Receipt"
- Verify receipt contains all payment details

---

## 📝 STEP 4: PHARMACY - Medication Dispensing

### 4.1 Logout and Login as Pharmacy
- Logout from Finance portal
- Login with:
  - **Username**: `PHA001`
  - **Password**: `JOHNPHARMACIST1239%`

### 4.2 View Prescription Queue
- Navigate to: Pharmacy Dashboard
- Click: "Prescription Queue" or "Pending Prescriptions"
- Patient should appear: **JOHN MOSES MWANGI (PAT64)**
- **Status**: CONSULTATION_PAID (payment verified)

### 4.3 Select Patient for Dispensing
- Click on patient: **JOHN MOSES MWANGI (PAT64)**
- View prescription details

### 4.4 Review Prescription
```
Prescription for: JOHN MOSES MWANGI (PAT64)
Prescribed by: Dr. {Doctor Name}
Date: 2025-10-01
Diagnosis: Suspected Malaria

MEDICATIONS TO DISPENSE:

1. Coartem 80mg/480mg
   - Quantity: 6 tablets
   - Dosage: 1 tablet twice daily
   - Duration: 3 days
   - Instructions: Take with food. Complete full course.
   - Stock Available: {Check stock level}
   - Barcode: MED-COAR-001

2. Panadol 500mg
   - Quantity: 18 tablets
   - Dosage: 2 tablets three times daily
   - Duration: 3 days
   - Instructions: Take after meals for fever and pain
   - Stock Available: {Check stock level}
   - Barcode: MED-PANA-001
```

### 4.5 Start Dispensing Process
- Click: "Start Dispensing" or "Begin Dispensing"

### 4.6 Scan/Add Medications

#### **MEDICATION 1: Coartem**
- **Method 1 - Barcode Scan**:
  - Click: "Scan Barcode"
  - Scan barcode: `MED-COAR-001`
  - Enter quantity: `6`
  - Click: "Add"

- **Method 2 - Manual Search** (if scanner not available):
  - Click: "Add Medication" or "Search Medication"
  - Search: `Coartem`
  - Select: `Coartem 80mg/480mg`
  - Enter quantity: `6`
  - Click: "Add"

**Expected After Adding:**
```
✅ Medication added to dispense list
✅ Running total updated: 12,000 TZS
✅ Stock check performed
✅ Dispense record created
```

#### **MEDICATION 2: Panadol**
- **Method 1 - Barcode Scan**:
  - Click: "Scan Barcode"
  - Scan barcode: `MED-PANA-001`
  - Enter quantity: `18`
  - Click: "Add"

- **Method 2 - Manual Search**:
  - Click: "Add Medication"
  - Search: `Panadol`
  - Select: `Panadol 500mg`
  - Enter quantity: `18`
  - Click: "Add"

**Expected After Adding:**
```
✅ Medication added to dispense list
✅ Running total updated: 12,200 TZS (12,000 + 200)
✅ Stock check performed
✅ Dispense record created
```

### 4.7 Review Dispense Summary
```
Dispensing for: JOHN MOSES MWANGI (PAT64)

ITEMS TO DISPENSE:
1. Coartem 80mg/480mg × 6 tablets: 12,000 TZS
2. Panadol 500mg × 18 tablets: 200 TZS

RUNNING TOTAL: 12,200 TZS
PAYMENT STATUS: PAID ✓

STOCK CHANGES:
Before Dispensing:
- Coartem: 200 units → After: 194 units
- Panadol: 500 units → After: 482 units

LOW STOCK ALERTS:
- None (all items above reorder level)
```

### 4.8 Patient Counseling (Record)
- Optional field: "Counseling Notes"
- Enter: `Patient educated on medication usage, side effects, and importance of completing malaria treatment course.`

### 4.9 Complete Dispensing
- Review all medications added
- Verify quantities correct
- Click: "Complete Dispensing" or "Finish Dispensing"

### 4.10 Expected Results ✅
```
✅ Prescription status: PENDING → DISPENSED
✅ Patient status: CONSULTATION_PAID → COMPLETED
✅ Patient location: Discharged/Completed
✅ Stock automatically deducted:
    - Coartem: 200 → 194 units
    - Panadol: 500 → 482 units
✅ StockMovement records created:
    - Type: DISPENSE
    - Reference: Prescription ID
    - Quantity: -6 (Coartem), -18 (Panadol)
✅ DispenseRecord created for audit trail
✅ Low stock alerts generated if below reorder level
✅ Patient removed from all queues
✅ Status history final entry created
✅ Medication labels printed (optional)
```

### 4.11 Print Medication Labels (Optional)
- Click: "Print Labels"
- Labels should include:
  - Patient name
  - Medication name & strength
  - Dosage instructions
  - Frequency
  - Duration
  - Prescriber name
  - Dispensing date
  - Pharmacy stamp

---

## ✅ FINAL VERIFICATION - Post-Test Checks

### 1. Database Verification
Run these queries to verify data integrity:

```bash
docker compose exec backend python manage.py shell -c "
from patients.models import Patient, PatientStatusHistory
from doctor.models import Consultation, Prescription
from pharmacy.models import Medication, DispenseRecord, StockMovement
from finance.models import ServicePayment

# Find test patient
patient = Patient.objects.filter(first_name='JOHN', last_name='MWANGI').first()

if patient:
    print('=' * 70)
    print(f'PATIENT VERIFICATION')
    print('=' * 70)
    print(f'Patient ID: {patient.patient_id}')
    print(f'Full Name: {patient.full_name}')
    print(f'Age: {patient.age} years')
    print(f'BMI: {patient.bmi}')
    print(f'Phone: {patient.phone_number}')
    print(f'Patient Type: {patient.patient_type}')
    print(f'Current Status: {patient.current_status}')
    print(f'File Fee Paid: {patient.file_fee_paid}')
    print(f'File Fee Amount: {patient.file_fee_amount} TZS')
    
    print(f'\nCONSULTATION VERIFICATION')
    print('=' * 70)
    consultation = Consultation.objects.filter(patient_id=patient.patient_id).first()
    if consultation:
        print(f'Diagnosis: {consultation.diagnosis}')
        print(f'Status: {consultation.status}')
        print(f'Doctor: {consultation.doctor.full_name}')
        print(f'Consultation Fee: {consultation.consultation_fee_amount} TZS')
    
    print(f'\nPRESCRIPTION VERIFICATION')
    print('=' * 70)
    prescription = Prescription.objects.filter(patient_id=patient.patient_id).first()
    if prescription:
        print(f'Status: {prescription.status}')
        print(f'Total Cost: {prescription.total_cost} TZS')
        print(f'Medications: {len(prescription.medications_list)} items')
        for med in prescription.medications_list:
            print(f'  - {med.get(\"medication_name\")}: {med.get(\"quantity\")} units')
    
    print(f'\nPAYMENT VERIFICATION')
    print('=' * 70)
    payments = ServicePayment.objects.filter(patient_id=patient.patient_id)
    print(f'Total Payments: {payments.count()}')
    for payment in payments:
        print(f'  - {payment.service_name}: {payment.amount} TZS ({payment.status})')
    
    print(f'\nSTOCK MOVEMENT VERIFICATION')
    print('=' * 70)
    movements = StockMovement.objects.filter(reference_id=str(prescription.id))
    for movement in movements:
        print(f'  - {movement.medication.name}: {movement.quantity} units ({movement.movement_type})')
    
    print(f'\nSTATUS HISTORY')
    print('=' * 70)
    history = PatientStatusHistory.objects.filter(patient=patient).order_by('changed_at')
    for h in history:
        print(f'  {h.changed_at.strftime(\"%Y-%m-%d %H:%M\")} - {h.previous_status} → {h.new_status} ({h.changed_by.full_name})')
    
    print('\n' + '=' * 70)
    print('✅ SCENARIO A TEST COMPLETED SUCCESSFULLY')
    print('=' * 70)
else:
    print('❌ Patient not found')
"
```

### 2. Financial Verification

**Expected Financial Summary:**
```
REVENUE GENERATED:
- File Fee: 2,000 TZS
- Consultation: 50,000 TZS
- Medications: 12,200 TZS
--------------------------
TOTAL REVENUE: 64,200 TZS

EXPENSES (Hospital Costs):
- None directly tracked in this scenario
- (Consumables like syringes, gloves would be expenses)

NET REVENUE: 64,200 TZS
```

### 3. Stock Verification

**Expected Stock Changes:**
```
BEFORE TEST:
- Coartem 80mg/480mg: 200 units
- Panadol 500mg: 500 units

AFTER TEST:
- Coartem 80mg/480mg: 194 units (-6)
- Panadol 500mg: 482 units (-18)

STOCK MOVEMENT RECORDS: 2 entries (DISPENSE type)
```

### 4. Patient Status Flow Verification

**Complete Status Journey:**
```
1. REGISTERED (Reception - Initial registration)
   ↓
2. REGISTERED (Reception - File fee paid)
   ↓
3. WAITING_DOCTOR (Reception - Sent to queue)
   ↓
4. WITH_DOCTOR (Doctor - Consultation started)
   ↓
5. PENDING_CONSULTATION_PAYMENT (Doctor - Consultation completed)
   ↓
6. CONSULTATION_PAID (Finance - Payment processed)
   ↓
7. COMPLETED (Pharmacy - Medications dispensed)
```

---

## 🐛 Common Issues & Troubleshooting

### Issue 1: Patient Registration Fails
**Symptoms**: Form submission error, patient not created

**Possible Causes & Solutions:**
- **Missing required fields**: Check first_name, last_name, DOB, gender, phone are filled
- **Invalid phone format**: Use format +255XXXXXXXXX
- **Date of birth in future**: Ensure DOB is in the past
- **NHIF without card number**: If Patient Type=NHIF, NHIF card number is required
- **Database connection**: Check `docker compose ps` - ensure backend and db are running

**Fix**:
```bash
# Check backend logs
docker compose logs backend --tail=50

# Verify database connection
docker compose exec backend python manage.py check
```

### Issue 2: Patient Not in Doctor Queue
**Symptoms**: Patient registered but doesn't appear in doctor's queue

**Possible Causes & Solutions:**
- **File fee not paid**: Check file_fee_paid=True
- **Status not updated**: Verify status=WAITING_DOCTOR
- **Not sent to queue**: Click "Send to Doctor" in reception
- **Queue not refreshing**: Refresh page or check FIFO logic

**Fix**:
```bash
# Check patient status
docker compose exec backend python manage.py shell -c "
from patients.models import Patient
patient = Patient.objects.filter(patient_id='PAT64').first()
print(f'Status: {patient.current_status}')
print(f'File Fee Paid: {patient.file_fee_paid}')
"
```

### Issue 3: Consultation Won't Complete
**Symptoms**: "Complete Consultation" button errors or doesn't work

**Possible Causes & Solutions:**
- **Missing required fields**: Chief complaint, symptoms, diagnosis must be filled
- **No prescription added**: Must add at least one medication
- **Invalid medication data**: Check dosage, frequency, duration are filled
- **Prescription calculation error**: Verify medication prices in database

**Fix**:
```bash
# Verify ServicePricing has consultation fee
docker compose exec backend python manage.py shell -c "
from finance.models import ServicePricing
consultation = ServicePricing.objects.filter(service_category='CONSULTATION').first()
print(f'Consultation Price: {consultation.standard_price if consultation else \"NOT FOUND\"}')
"
```

### Issue 4: Payment Processing Fails
**Symptoms**: Cannot process payment, amount calculations wrong

**Possible Causes & Solutions:**
- **ServicePayment not created**: Check if pending payment exists
- **Price mismatch**: Verify medication prices in database
- **Patient type mismatch**: NHIF vs NORMAL payment methods
- **Change calculation error**: Verify amount_received >= total_amount

**Fix**:
```bash
# Check pending payments
docker compose exec backend python manage.py shell -c "
from finance.models import ServicePayment
payments = ServicePayment.objects.filter(status='PENDING')
for p in payments:
    print(f'{p.patient_name} - {p.amount} TZS')
"
```

### Issue 5: Stock Not Deducting
**Symptoms**: Medications dispensed but stock levels unchanged

**Possible Causes & Solutions:**
- **Dispense not completed**: Ensure "Complete Dispensing" was clicked
- **Stock movement not created**: Check StockMovement records
- **Barcode mismatch**: Verify correct medication barcodes used
- **Quantity zero**: Check dispense quantities are positive

**Fix**:
```bash
# Check stock levels
docker compose exec backend python manage.py shell -c "
from pharmacy.models import Medication
coartem = Medication.objects.get(barcode='MED-COAR-001')
panadol = Medication.objects.get(barcode='MED-PANA-001')
print(f'Coartem stock: {coartem.current_stock}')
print(f'Panadol stock: {panadol.current_stock}')
"
```

### Issue 6: Status Not Updating
**Symptoms**: Patient stuck in one status, won't progress

**Possible Causes & Solutions:**
- **Status transition logic error**: Check backend views for status update code
- **Permission denied**: Verify user role has permission for action
- **Database lock**: Restart backend container
- **Frontend cache**: Hard refresh (Ctrl+Shift+R)

**Fix**:
```bash
# Manually update patient status (if needed for testing)
docker compose exec backend python manage.py shell -c "
from patients.models import Patient
patient = Patient.objects.get(patient_id='PAT64')
patient.current_status = 'WAITING_DOCTOR'
patient.save()
print(f'Updated to: {patient.current_status}')
"
```

---

## 📊 Success Criteria Checklist

### Patient Management ✅
- [ ] Patient registered with auto-generated ID (PAT{number})
- [ ] Full name auto-formatted to uppercase
- [ ] Age calculated correctly from DOB
- [ ] BMI calculated if height/weight provided
- [ ] File fee processed (2,000 TZS for NORMAL patients)
- [ ] Patient status transitions correct (7 transitions total)
- [ ] Patient appears in correct queues at correct times

### Clinical Workflow ✅
- [ ] Patient queue follows FIFO logic
- [ ] Consultation form saves all required data
- [ ] Prescription created with correct medications
- [ ] Vital signs recorded during consultation
- [ ] Diagnosis and treatment plan documented
- [ ] Follow-up date set correctly

### Financial Management ✅
- [ ] Consultation fee charged (50,000 TZS)
- [ ] Medication costs calculated correctly (12,200 TZS)
- [ ] Payment method selected (CASH/NHIF)
- [ ] Change calculated correctly (Amount received - Total)
- [ ] Receipt generated with all details
- [ ] Revenue tracked in finance system
- [ ] Grand total: 64,200 TZS (File + Consultation + Meds)

### Pharmacy Operations ✅
- [ ] Prescription appears in pharmacy queue
- [ ] Medications scanned/added correctly
- [ ] Stock levels deducted automatically
- [ ] StockMovement records created
- [ ] DispenseRecord created for audit
- [ ] Low stock alerts if below reorder level
- [ ] Patient status updated to COMPLETED

### Audit Trail ✅
- [ ] PatientStatusHistory records all transitions
- [ ] Each status change has timestamp
- [ ] Changed_by field populated with staff member
- [ ] Location tracked at each stage
- [ ] Complete patient journey documented

---

## 📝 Test Execution Log

**Fill this in during testing:**

| Step | Status | Time | Issues Encountered | Notes |
|------|--------|------|-------------------|-------|
| 1. Reception - Register | ⏳ | __:__ | | |
| 2. Reception - File Fee | ⏳ | __:__ | | |
| 3. Reception - Send to Queue | ⏳ | __:__ | | |
| 4. Doctor - Start Consultation | ⏳ | __:__ | | |
| 5. Doctor - Fill Form | ⏳ | __:__ | | |
| 6. Doctor - Create Prescription | ⏳ | __:__ | | |
| 7. Doctor - Complete | ⏳ | __:__ | | |
| 8. Finance - Review Payment | ⏳ | __:__ | | |
| 9. Finance - Process Payment | ⏳ | __:__ | | |
| 10. Pharmacy - View Queue | ⏳ | __:__ | | |
| 11. Pharmacy - Scan Meds | ⏳ | __:__ | | |
| 12. Pharmacy - Complete Dispensing | ⏳ | __:__ | | |
| 13. Database Verification | ⏳ | __:__ | | |

**Legend**: ⏳ Pending | ✅ Passed | ❌ Failed

---

## 🎉 Test Completion

**If all steps passed:**
- ✅ Scenario A workflow complete
- ✅ Patient journey from registration to discharge successful
- ✅ All payments recorded correctly
- ✅ Stock management working
- ✅ Audit trail complete
- ✅ Financial tracking accurate

**Total Test Time**: _____ minutes  
**Issues Found**: _____  
**Issues Fixed**: _____  

**Next Step**: Proceed to Scenario B (with Lab Tests) after all Scenario A bugs are fixed.

---

**🚀 Ready to test! Follow each step carefully and document any issues encountered.**
