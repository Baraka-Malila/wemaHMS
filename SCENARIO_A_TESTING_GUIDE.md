# 🧪 WEMA HMS - Scenario A Testing Guide

**Date**: 2025-10-01  
**Test Type**: End-to-End Patient Workflow (No Lab Tests)  
**Status**: Ready to Execute

---

## 📋 Test Overview

### Scenario A: Direct Treatment Flow
Patient visits hospital, sees doctor, gets prescription, pays, and collects medication.

**Flow**: Reception → Doctor → Finance → Pharmacy  
**Duration**: ~15-20 minutes  
**Revenue Expected**: File fee + Consultation + Medications  

---

## 🚀 Pre-Test Setup

### 1. Start Frontend Server
```bash
cd /home/cyberpunk/WEMA-HMS/frontend
npm run dev
```

### 2. Verify Backend Running
```bash
docker compose ps
```
Should show: `wema_backend` and `wema_db` running

### 3. Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api

---

## 🎭 Test Credentials

```
RECEPTION: REC002 / BARAKA1234@
DOCTOR:    DOC002 / MALILA1234$
FINANCE:   FIN002 / JUMANJI1234%
PHARMACY:  PHA001 / JOHNPHARMACIST1239%
```

---

## 📝 Step-by-Step Test Script

### STEP 1: Reception - Register Patient ✅

**Login**: http://localhost:3000/auth/login
- Username: `REC002`
- Password: `BARAKA1234@`

**Actions**:
1. Navigate to: Reception Dashboard
2. Click: "Register New Patient"
3. Fill form:
   - First Name: John
   - Last Name: Mwangi
   - Date of Birth: 1990-05-15
   - Gender: Male
   - Phone: +255712345678
   - Address: Dar es Salaam, Tanzania
   - Email: john.mwangi@example.com
   - Emergency Contact: Jane Mwangi
   - Emergency Phone: +255798765432
4. Submit form
5. **Expected**: Patient registered with ID (e.g., PAT012)
6. **Expected**: File opening fee charged (2,000 TZS)
7. Click: "Send to Doctor Queue"

**Verification**:
- [ ] Patient ID generated (PAT###)
- [ ] File fee appears: 2,000 TZS
- [ ] Patient status: `WAITING_DOCTOR`
- [ ] Patient appears in doctor queue

---

### STEP 2: Doctor - Consultation & Prescription ✅

**Logout and Login**:
- Username: `DOC002`
- Password: `MALILA1234$`

**Actions**:
1. Navigate to: Doctor Dashboard
2. View: Patient Queue
3. Select: John Mwangi (PAT012)
4. Click: "Start Consultation"
5. Fill consultation form:
   - **Chief Complaint**: Fever and headache for 3 days
   - **History**: Patient reports high fever, body aches, no cough
   - **Physical Examination**: 
     - Temperature: 38.5°C
     - BP: 120/80
     - Pulse: 88 bpm
     - General condition: Mild distress
   - **Diagnosis**: Suspected Malaria
   - **Clinical Notes**: Patient advised rest and hydration

6. Write Prescription:
   - Click: "Add Medication"
   - Search: "Coartem" → Select "Coartem 80mg/480mg"
   - Dosage: "1 tablet"
   - Frequency: "Twice daily"
   - Duration: "3 days"
   - Instructions: "Take with food"
   
   - Click: "Add Medication" (again)
   - Search: "Panadol" → Select "Panadol 500mg"
   - Dosage: "2 tablets"
   - Frequency: "Three times daily"
   - Duration: "3 days"
   - Instructions: "Take after meals for fever"

7. Click: "Complete Consultation"
8. **Expected**: Prescription sent to finance for payment

**Verification**:
- [ ] Consultation saved with all details
- [ ] Patient status: `PENDING_CONSULTATION_PAYMENT`
- [ ] Prescription created with 2 medications
- [ ] Total calculated: Consultation (50,000) + Medications
- [ ] Patient appears in Finance queue

**Expected Calculation**:
```
Consultation Fee: 50,000 TZS
Coartem 80mg/480mg: 12,000 TZS
Panadol 500mg: 200 TZS
------------------------
TOTAL: 62,200 TZS
```

---

### STEP 3: Finance - Process Payment ✅

**Logout and Login**:
- Username: `FIN002`
- Password: `JUMANJI1234%`

**Actions**:
1. Navigate to: Finance Dashboard
2. Click: "Payment Processing"
3. View: Pending Payments
4. Select: John Mwangi (PAT012)
5. Review charges:
   - Consultation: 50,000 TZS
   - Medications: 12,200 TZS
   - **Total**: 62,200 TZS
6. Select payment method: "CASH"
7. Enter amount received: 70,000 TZS
8. **Expected**: Change calculated: 7,800 TZS
9. Click: "Process Payment"
10. Print receipt (optional)

**Verification**:
- [ ] Payment recorded: 62,200 TZS
- [ ] Change calculated correctly: 7,800 TZS
- [ ] Patient status: `CONSULTATION_PAID`
- [ ] Patient sent to Pharmacy queue
- [ ] Payment appears in Finance history
- [ ] Receipt generated

---

### STEP 4: Pharmacy - Dispense Medication ✅

**Logout and Login**:
- Username: `PHA001`
- Password: `JOHNPHARMACIST1239%`

**Actions**:
1. Navigate to: Pharmacy Dashboard
2. View: Prescription Queue
3. Select: John Mwangi (PAT012)
4. View prescription details:
   - Coartem 80mg/480mg x6 tablets
   - Panadol 500mg x18 tablets
5. Click: "Start Dispensing"
6. Scan medications (or manual entry):
   - Scan barcode: `MED-COAR-001` (Coartem)
   - Quantity: 6 tablets
   - Click "Add"
   
   - Scan barcode: `MED-PANA-001` (Panadol)
   - Quantity: 18 tablets
   - Click "Add"

7. Review running total: 12,200 TZS
8. Click: "Complete Dispensing"
9. **Expected**: Stock deducted automatically
10. Print medication labels (optional)

**Verification**:
- [ ] Coartem stock reduced by 6
- [ ] Panadol stock reduced by 18
- [ ] Dispense record created
- [ ] Patient status: `COMPLETED`
- [ ] Patient removed from all queues
- [ ] Low stock alert if needed

**Expected Stock Changes**:
```
BEFORE:
- Coartem: 200 units
- Panadol: 500 units

AFTER:
- Coartem: 194 units
- Panadol: 482 units
```

---

## ✅ Success Criteria

### Financial Tracking
- [ ] All charges recorded in payment history
- [ ] File fee: 2,000 TZS (patient registration)
- [ ] Consultation: 50,000 TZS (doctor visit)
- [ ] Medications: 12,200 TZS (pharmacy)
- [ ] **Grand Total**: 64,200 TZS revenue

### Inventory Management
- [ ] Medication stock automatically deducted
- [ ] Stock movement records created
- [ ] Reorder alerts triggered if below threshold

### Patient Status Transitions
```
INITIAL           → (Reception)  → WAITING_DOCTOR
WAITING_DOCTOR    → (Doctor)     → PENDING_CONSULTATION_PAYMENT
PENDING_...PAYMENT → (Finance)    → CONSULTATION_PAID
CONSULTATION_PAID  → (Pharmacy)   → COMPLETED
```

### Audit Trail
- [ ] Patient record complete with all visits
- [ ] Consultation notes saved
- [ ] Prescription archived
- [ ] Payment receipt available
- [ ] Stock movement logged

---

## 🐛 Common Issues & Solutions

### Issue 1: Patient not in queue
**Solution**: Check patient status in database, verify previous step completed

### Issue 2: Medication not found
**Solution**: Verify medication barcode, check stock levels

### Issue 3: Payment calculation wrong
**Solution**: Check ServicePricing table, verify medication prices

### Issue 4: Stock not deducting
**Solution**: Check pharmacy StockMovement model, verify dispense logic

### Issue 5: Status not updating
**Solution**: Check patient API endpoints, verify state transitions

---

## 📊 Post-Test Verification

### Run Database Queries:
```bash
docker compose exec backend python manage.py shell -c "
from patients.models import Patient
from doctor.models import Consultation, Prescription
from pharmacy.models import Medication, DispenseRecord
from finance.models import Payment

# Find test patient
patient = Patient.objects.get(patient_id='PAT012')
print(f'Patient: {patient.first_name} {patient.last_name}')
print(f'Status: {patient.status}')

# Check consultation
consultation = Consultation.objects.filter(patient=patient).first()
print(f'Consultation: {consultation.diagnosis}')

# Check prescription
prescription = Prescription.objects.filter(patient=patient).first()
print(f'Prescription items: {prescription.medications_list}')

# Check payment
payment = Payment.objects.filter(patient_id=patient.patient_id).first()
print(f'Payment: {payment.amount_paid} TZS')

# Check stock
coartem = Medication.objects.get(barcode='MED-COAR-001')
panadol = Medication.objects.get(barcode='MED-PANA-001')
print(f'Coartem stock: {coartem.current_stock}')
print(f'Panadol stock: {panadol.current_stock}')
"
```

---

## 🎉 Test Complete!

If all steps passed:
- ✅ Patient journey complete from registration to medication dispensing
- ✅ All payments recorded correctly
- ✅ Stock management working
- ✅ Patient status transitions correct
- ✅ Database integrity maintained

**Next**: Test Scenario B (with lab tests) for complete workflow validation.

---

## 📝 Notes During Testing

**Record any issues here:**
```
[Date] [Time] [Step] [Issue Description]
_____________________________________________





```

**Performance Observations:**
```
API Response Times:
- Patient Registration: ___ ms
- Consultation Save: ___ ms
- Payment Processing: ___ ms
- Medication Dispensing: ___ ms
```

**User Experience Notes:**
```
- Navigation clarity: ___
- Form validation: ___
- Error messages: ___
- Loading indicators: ___
```
