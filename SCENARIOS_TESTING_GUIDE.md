# WEMA-HMS Scenarios Testing Guide
**Version:** 2.0
**Last Updated:** October 1, 2025, 11:00 PM

---

## 🎯 OVERVIEW

This guide provides step-by-step instructions for testing all patient workflow scenarios in the WEMA Hospital Management System. Each scenario represents a real-world patient journey through the hospital.

---

## 📋 TEST CREDENTIALS

### Admin
- **Employee ID:** `ADM999`
- **Password:** `AdminSecure123!`

### Reception
- **Employee ID:** `REC002`
- **Password:** `BARAKA1234@`

### Doctor
- **Employee ID:** `DOC002`
- **Password:** `MALILA1234$`

### Finance
- **Employee ID:** `FIN002`
- **Password:** `JUMANJI1234%`

### Lab
- **Employee ID:** `LAB003`
- **Password:** `JAMES1239`

### Pharmacy
- **Employee ID:** `PHA001`
- **Password:** `JOHNPHARMACIST1239%`

### Nursing
- **Employee ID:** `NUR001`
- **Password:** `SARAH123$`

---

## ✅ SCENARIO A: CONSULTATION + MEDICATIONS (COMPLETE)

### **Flow:** Patient → Doctor → Finance → Pharmacy

### **Use Case:**
Patient with a condition that requires medication but no lab tests (e.g., headache, fever, simple infection)

---

### **Step 1: Patient Registration (Reception Portal)**

1. **Login as Reception** (`REC002` / `BARAKA1234@`)

2. **Register New Patient:**
   - Click "New Patient" button
   - Fill in patient details:
     ```
     Full Name: Sarah Johnson
     Phone: +255712345678
     Gender: Female
     Date of Birth: 1990-05-15
     Address: Dar es Salaam, Tanzania
     Patient Type: GENERAL (or NHIF if has card)
     Height: 165 cm
     Weight: 60 kg
     ```
   - Check "File Fee Paid" (2,000 TZS)
   - Click "Register Patient"
   - **Expected Result:** Patient created with ID (e.g., PAT19)

3. **Check-in Patient:**
   - Search for patient (PAT19 or "Sarah Johnson")
   - Click "Check In"
   - **Expected Result:** Patient status → `WAITING_DOCTOR`

---

### **Step 2: Consultation (Doctor Portal)**

1. **Login as Doctor** (`DOC002` / `MALILA1234$`)

2. **View Patient Queue:**
   - Navigate to "Queue" tab
   - **Expected Result:** See Sarah Johnson (PAT19) in waiting list

3. **Start Consultation:**
   - Click on patient row
   - Fill in consultation details:
     ```
     Chief Complaint: Severe headache for 3 days
     Symptoms: Persistent throbbing pain, sensitivity to light
     Examination Findings: Normal vital signs, no neurological deficits
     Diagnosis: Tension Headache
     Treatment Plan: Pain management with analgesics, rest recommended
     General Advice: Drink plenty of water, avoid stress, maintain regular sleep
     Priority: NORMAL
     Follow-up Date: (7 days from today)
     ```
   - Record vital signs (optional):
     ```
     Temperature: 37.0°C
     Blood Pressure: 120/80 mmHg
     Heart Rate: 72 bpm
     Respiratory Rate: 16 /min
     ```

4. **Add Prescriptions:**
   - Click "Prescriptions" tab
   - Click "Add Prescription"
   - **Prescription 1:**
     ```
     Medication: Paracetamol (search in dropdown)
     Strength: 500mg
     Dosage Form: Tablet
     Frequency: Three Times Daily
     Dosage Instructions: Take with food
     Duration: 5 days
     Quantity: 15 tablets (3 per day × 5 days)
     Special Instructions: Take after meals
     ```
   - **Prescription 2:**
     ```
     Medication: Ibuprofen (search in dropdown)
     Strength: 400mg
     Dosage Form: Tablet
     Frequency: Twice Daily
     Dosage Instructions: Take with meals
     Duration: 3 days
     Quantity: 6 tablets
     Special Instructions: Stop if stomach upset occurs
     ```

5. **Complete Consultation:**
   - Click "Complete Consultation & Proceed to Payment"
   - **Expected Results:**
     - Success message: "Consultation completed. Patient → FINANCE (pay consultation + medications)"
     - Patient disappears from queue
     - Patient status → `PENDING_CONSULTATION_PAYMENT`

---

### **Step 3: Payment Processing (Finance Portal)**

1. **Login as Finance** (`FIN002` / `JUMANJI1234%`)

2. **View Pending Payments:**
   - Dashboard should show 2 pending payments for PAT19:
     ```
     Payment 1:
     - Service: Doctor Consultation
     - Patient: Sarah Johnson (PAT19)
     - Amount: 5,000 TZS
     - Type: CONSULTATION

     Payment 2:
     - Service: Medication (Paracetamol + Ibuprofen)
     - Patient: Sarah Johnson (PAT19)
     - Amount: (calculated from medication prices)
     - Type: MEDICATION
     ```

3. **Process Payments:**
   - Click on **Consultation Payment** row
   - Modal opens with payment details
   - Select Payment Method: `CASH`
   - Click "Process Payment"
   - **Expected Result:** Success message, payment moves to history

   - Click on **Medication Payment** row
   - Select Payment Method: `CASH`
   - Click "Process Payment"
   - **Expected Result:** Success message, payment moves to history

4. **Verify Payment History:**
   - Navigate to "Payment History" tab
   - Search for PAT19
   - **Expected Result:** See both payments marked as PAID

---

### **Step 4: Medication Dispensing (Pharmacy Portal) - PENDING IMPLEMENTATION**

**Status:** ⚠️ Backend ready, frontend not yet built

**Expected Flow:**
1. Login as Pharmacy
2. See prescription queue with paid prescriptions
3. Dispense Paracetamol (15 tablets) and Ibuprofen (6 tablets)
4. Update stock
5. Patient status → `COMPLETED`

---

### ✅ **Scenario A Test Results:**

| Step | Status | Notes |
|------|--------|-------|
| Patient Registration | ✅ PASSED | Auto-ID generation works |
| Patient Check-in | ✅ PASSED | Status updates correctly |
| Doctor Consultation | ✅ PASSED | Full form functional |
| Prescription Creation | ✅ PASSED | Medication search works |
| Consultation Completion | ✅ PASSED | Payments auto-created |
| Finance Payment Processing | ✅ PASSED | Both payments visible |
| Payment Calculation | ✅ PASSED | Correct amounts |
| Pharmacy Dispensing | ⚠️ PENDING | Frontend not built |

**Overall:** ✅ **PASSED** (Payment flow complete, awaiting pharmacy UI)

---

## ✅ SCENARIO B: CONSULTATION + LAB TESTS (COMPLETE)

### **Flow:** Patient → Doctor → Finance → Lab

### **Use Case:**
Patient needs diagnostic tests before treatment (e.g., suspected malaria, urinary tract infection)

---

### **Step 1: Patient Registration (Reception Portal)**

1. **Login as Reception** (`REC002` / `BARAKA1234@`)

2. **Register New Patient:**
   ```
   Full Name: Michael Chen
   Phone: +255723456789
   Gender: Male
   Date of Birth: 1985-08-20
   Address: Mwanza, Tanzania
   Patient Type: GENERAL
   Height: 175 cm
   Weight: 75 kg
   File Fee Paid: YES (2,000 TZS)
   ```
   - **Expected Result:** Patient ID (e.g., PAT20)

3. **Check-in Patient**
   - Status → `WAITING_DOCTOR`

---

### **Step 2: Consultation with Lab Orders (Doctor Portal)**

1. **Login as Doctor** (`DOC002` / `MALILA1234$`)

2. **Start Consultation:**
   ```
   Chief Complaint: Fever and chills for 2 days
   Symptoms: High fever (39°C), sweating, body aches, fatigue
   Examination Findings: Elevated temperature, mild dehydration
   Diagnosis: Suspected Malaria
   Treatment Plan: Await lab results before prescribing antimalarials
   General Advice: Rest, stay hydrated, avoid cold environments
   Priority: URGENT
   Follow-up Date: (Tomorrow)
   ```

3. **Order Lab Tests:**
   - Click "Lab Requests" tab
   - Select tests from categories:

     **Parasitology:**
     - ☑ MRDT (Malaria Rapid Diagnostic Test) - 8,000 TZS
     - ☑ BS (Blood Smear) - 10,000 TZS

     **Hematology:**
     - ☑ HB (Hemoglobin) - 6,000 TZS

     **Clinical Chemistry (Urinalysis):**
     - ☑ Urinalysis (full panel) - 15,000 TZS

   - Set Urgency: `URGENT`
   - **Expected Total:** 39,000 TZS

4. **Complete Consultation:**
   - Click "Complete Consultation & Proceed to Payment"
   - **Expected Results:**
     - Success message: "Consultation completed. Patient → FINANCE (pay consultation + lab tests)"
     - Patient status → `PENDING_CONSULTATION_PAYMENT`

---

### **Step 3: Payment Processing (Finance Portal)**

1. **Login as Finance** (`FIN002` / `JUMANJI1234%`)

2. **View Pending Payments:**
   ```
   Payment 1:
   - Service: Doctor Consultation
   - Patient: Michael Chen (PAT20)
   - Amount: 5,000 TZS
   - Type: CONSULTATION

   Payment 2:
   - Service: Laboratory Tests (4 tests)
   - Patient: Michael Chen (PAT20)
   - Amount: 39,000 TZS
   - Type: LAB_TEST
   - Tests: MRDT, BS, HB, Urinalysis
   ```

3. **Process Payments:**
   - Process Consultation: 5,000 TZS (CASH)
   - Process Lab Tests: 39,000 TZS (CASH or MPESA)
   - **Expected Result:** Both payments marked as PAID

4. **Verify Calculation:**
   - Total should be: 44,000 TZS (5,000 + 39,000)
   - Individual test prices:
     - MRDT: 8,000 TZS ✓
     - BS: 10,000 TZS ✓
     - HB: 6,000 TZS ✓
     - Urinalysis: 15,000 TZS ✓
     - **Total:** 39,000 TZS ✓

---

### **Step 4: Lab Testing (Lab Portal) - PENDING IMPLEMENTATION**

**Status:** ⚠️ Backend ready, frontend not yet built

**Expected Flow:**
1. Login as Lab Technician
2. See test request queue with paid tests for PAT20
3. Perform tests and record results:
   - MRDT: Positive/Negative
   - BS: Parasite count
   - HB: Result in g/dL
   - Urinalysis: Multiple parameters
4. Submit results
5. Patient status → `LAB_COMPLETED`

---

### ✅ **Scenario B Test Results:**

| Step | Status | Notes |
|------|--------|-------|
| Patient Registration | ✅ PASSED | Works perfectly |
| Doctor Consultation | ✅ PASSED | Form complete |
| Lab Test Selection | ✅ PASSED | All 27 tests mapped |
| Lab Test ID Mapping | ✅ PASSED | Frontend → Backend mapping works |
| Consultation Completion | ✅ PASSED | No errors |
| Payment Creation | ✅ PASSED | Both payments created |
| Lab Payment Calculation | ✅ PASSED | Correct individual test prices |
| Finance Payment Processing | ✅ PASSED | Payments visible and processable |
| Lab Results Entry | ⚠️ PENDING | Frontend not built |

**Overall:** ✅ **PASSED** (Payment flow complete, awaiting lab UI)

---

## 🔄 SCENARIO C: FULL WORKFLOW (PENDING)

### **Flow:** Patient → Doctor → Finance → Lab → Doctor → Finance → Pharmacy

### **Use Case:**
Patient needs both lab tests and medications (e.g., infection requiring confirmation and treatment)

---

### **Step 1-3: Same as Scenario B**
(Patient registration, consultation with lab orders, lab payment)

---

### **Step 4: Lab Testing (Lab Portal) - NOT YET IMPLEMENTED**

**Expected Flow:**
1. Lab receives paid test requests
2. Performs tests
3. Records results
4. Patient returns to doctor

---

### **Step 5: Doctor Reviews Results**

**Expected Flow:**
1. Doctor sees patient with lab results
2. Reviews findings
3. Updates diagnosis
4. Prescribes medications based on results
5. Patient → Finance for medication payment

---

### **Step 6: Medication Payment (Finance Portal)**

**Expected Flow:**
1. Finance sees new medication payment
2. Processes payment
3. Patient → Pharmacy

---

### **Step 7: Medication Dispensing (Pharmacy Portal)**

**Expected Flow:**
1. Pharmacy receives paid prescription
2. Dispenses medications
3. Updates stock
4. Patient status → `COMPLETED`

---

### ⚠️ **Scenario C Test Results:**

| Step | Status | Notes |
|------|--------|-------|
| Steps 1-3 (Lab Request) | ✅ PASSED | Same as Scenario B |
| Lab Testing | ❌ NOT IMPLEMENTED | Frontend needed |
| Doctor Review Results | ❌ NOT IMPLEMENTED | Workflow needed |
| Medication Prescription | ✅ PASSED | Can add prescriptions |
| Medication Payment | ✅ PASSED | Payment created |
| Pharmacy Dispensing | ❌ NOT IMPLEMENTED | Frontend needed |

**Overall:** ⚠️ **PARTIALLY IMPLEMENTED** (50% complete)

---

## 🧪 ADDITIONAL TEST SCENARIOS

### Scenario D: NHIF Patient
**Test:** File fee exemption for NHIF patients

**Steps:**
1. Register patient with Patient Type = `NHIF`
2. Provide NHIF card number
3. **Expected:** File fee NOT charged, patient proceeds directly

---

### Scenario E: Multiple Services
**Test:** Patient needs consultation + lab + medications

**Steps:**
1. Complete consultation with both lab requests and prescriptions
2. **Expected:** 3 payments created:
   - Consultation: 5,000 TZS
   - Lab Tests: (calculated total)
   - Medications: (calculated total)

---

### Scenario F: Urgent Case
**Test:** Emergency patient priority handling

**Steps:**
1. Set Priority = `URGENT` during consultation
2. **Expected:** Patient appears at top of queues with red indicator

---

## 📊 TEST DATA SUMMARY

### Current Test Patients:
- PAT1-PAT18: Various test scenarios completed
- File fees paid: 16 patients
- Consultations completed: 15
- Lab requests: Multiple
- Prescriptions: Multiple

### Payment Data:
- Total payments processed: 45+
- Consultation payments: ~15 × 5,000 TZS = 75,000 TZS
- Lab payments: Variable (8,000 - 150,000+ TZS)
- Medication payments: Variable

---

## 🐛 KNOWN ISSUES & WORKAROUNDS

### Issue 1: Duplicate Consultation Error
**Status:** ✅ FIXED
**Solution:** Backend now returns existing consultation instead of error

### Issue 2: Lab Payment Always 25,000 TZS
**Status:** ✅ FIXED
**Solution:** Now calculates from individual test prices

### Issue 3: Clinical Chemistry Tests Not Mapped
**Status:** ✅ FIXED
**Solution:** All urinalysis sub-tests now map to `urinalysis_requested`

### Issue 4: Payment History Blinking
**Status:** ✅ FIXED
**Solution:** Implemented anti-blinking pattern with useMemo

---

## ✅ TESTING CHECKLIST

Before considering a scenario complete, verify:

- [ ] Patient registration works without errors
- [ ] Patient ID auto-generation is sequential
- [ ] Check-in updates patient status correctly
- [ ] Doctor queue shows patient immediately
- [ ] Consultation form saves all data
- [ ] Prescriptions/lab requests save correctly
- [ ] Payments are auto-created with correct amounts
- [ ] Finance sees all pending payments
- [ ] Payment processing updates status to PAID
- [ ] Payment history shows all transactions
- [ ] Patient status updates through workflow
- [ ] Real-time updates work (2-second refresh)
- [ ] No UI blinking or flickering
- [ ] Error messages are user-friendly

---

## 🚀 NEXT TESTING PHASE

### Phase 1: Complete Scenario C
**Required:**
1. Build Lab portal frontend
2. Build Pharmacy portal frontend
3. Test complete end-to-end workflow
4. Verify patient routing after payments

### Phase 2: Stress Testing
**Required:**
1. Test with 50+ patients
2. Test concurrent users
3. Test payment processing under load
4. Test database performance

### Phase 3: User Acceptance Testing
**Required:**
1. Real hospital staff testing
2. Feedback collection
3. UI/UX improvements
4. Training material creation

---

**Testing Status:** Scenarios A & B fully tested and working. Scenario C awaiting Lab and Pharmacy portal implementation.
