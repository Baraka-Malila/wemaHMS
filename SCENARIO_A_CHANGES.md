# Scenario A Implementation Changes

## Date: October 1, 2025

## Summary of Changes

We've restructured the consultation and prescription workflow to better separate medication prescriptions from general lifestyle/behavioral advice.

---

## Backend Changes

### 1. Consultation Model (`backend/doctor/models.py`)
**Added Field:**
```python
general_advice = models.TextField(
    blank=True,
    default='',
    help_text='General lifestyle/behavioral advice (e.g., rest, exercise, diet, hydration) - separate from medication prescriptions'
)
```

**Migration:** `0005_alter_consultation_general_advice.py` (Applied ✓)

### 2. Consultation Serializer (`backend/doctor/serializers.py`)
**Updated Fields List:**
- Added `general_advice` to the serializer fields
- Added `respiratory_rate` to the serializer fields (was missing)

**Result:** API now returns and accepts `general_advice` and `respiratory_rate` in consultation endpoints

---

## Frontend Changes

### 3. Enhanced Diagnosis Modal (`frontend/src/components/EnhancedDiagnosisModal.tsx`)

#### Interface Updates:
```typescript
interface DiagnosisData {
  chief_complaint: string;
  symptoms: string;
  examination_findings: string;
  diagnosis: string;
  treatment_plan: string;
  general_advice: string;  // NEW: Non-medication recommendations
  follow_up_date: string;
  priority: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  doctor_notes: string;
}
```

#### Prescriptions Tab Restructure:
The Prescriptions tab now has **TWO clear sections**:

**Section 1: General Advice** (Blue section)
- For non-medication recommendations
- Examples: rest, exercise, diet, hydration, lifestyle changes
- Stored in `consultation.general_advice` field
- Displayed with blue background and numbered badge (1)

**Section 2: Medication Prescriptions** (Green section)
- For actual medications that need pharmacy dispensing
- Full prescription form: name, strength, form, frequency, duration, quantity, instructions
- Stored in separate `Prescription` model records
- Displayed with green background and numbered badge (2)

#### Visual Improvements:
- Color-coded sections (blue for advice, green for meds)
- Numbered badges (1, 2) for clear workflow
- Empty state with icon when no medications added
- Better separation between advice and prescriptions

---

## What This Solves

### Problem 1: Mixed Advice and Medications
**Before:** Doctors had to use treatment_plan or create fake prescriptions for advice like "drink water"
**After:** Separate `general_advice` section for non-medication recommendations

### Problem 2: Unclear Prescription Tab
**Before:** Single section called "Prescriptions" - confusing if you want to give advice without meds
**After:** Two clearly labeled sections with color coding and visual hierarchy

### Problem 3: Database Clutter
**Before:** Pharmacy would see "prescriptions" that aren't actual medications
**After:** Only real medications create Prescription records; advice stays in Consultation

---

## Testing Scenario A

### Prerequisites:
✅ Backend: Running and migration applied
✅ Frontend: Running with no TypeScript errors
✅ Database: Populated with medications, services, supplies

### Test Steps:

1. **Login as Doctor**
   - Navigate to `/doctor/queue`

2. **Start Consultation**
   - Click on a patient in the queue
   - Opens Enhanced Diagnosis Modal

3. **Fill Consultation Tab** (Tab 1)
   - Chief Complaint: "Fever and headache"
   - Patient Findings: "Temperature elevated, no other symptoms"
   - Diagnosis: "Viral fever"
   - Priority: "Normal"
   - Vitals: (auto-populated from reception, or enter manually)

4. **Fill Prescriptions Tab** (Tab 2)
   - **General Advice Section:**
     - Enter: "Rest for 3 days, drink plenty of water (2L/day), avoid cold drinks"
   
   - **Medication Prescriptions Section:**
     - Click "Add Medication"
     - Medication Name: "Paracetamol"
     - Strength: "500mg"
     - Form: "tablet"
     - Frequency: "Three Times Daily"
     - Duration: "5 days"
     - Quantity: 15
     - Instructions: "Take after meals with water"

5. **Skip Lab Requests Tab** (Tab 3)
   - Leave empty for Scenario A (no labs needed)

6. **Complete Consultation**
   - Click "Complete" button
   - Should create:
     - ✅ Consultation record with general_advice saved
     - ✅ Prescription record for Paracetamol
     - ✅ Patient status → "TREATMENT_PRESCRIBED" or "PENDING_CONSULTATION_PAYMENT"

7. **Verify Patient Flow**
   - Patient should appear in Finance queue for payment
   - After payment → Patient goes to Pharmacy
   - Pharmacy sees only the Paracetamol prescription (NOT the general advice)
   - General advice is viewable in consultation history

---

## Expected Results

### Consultation Record:
```json
{
  "chief_complaint": "Fever and headache",
  "symptoms": "Temperature elevated, no other symptoms",
  "diagnosis": "Viral fever",
  "general_advice": "Rest for 3 days, drink plenty of water (2L/day), avoid cold drinks",
  "status": "COMPLETED"
}
```

### Prescription Record:
```json
{
  "medication_name": "Paracetamol",
  "strength": "500mg",
  "dosage_form": "tablet",
  "frequency": "THREE_TIMES_DAILY",
  "duration": "5 days",
  "quantity_prescribed": 15,
  "dosage_instructions": "Take after meals with water",
  "status": "PRESCRIBED"
}
```

### Patient Status Flow:
1. IN_CONSULTATION → (Doctor completes) → TREATMENT_PRESCRIBED
2. TREATMENT_PRESCRIBED → (Finance payment) → AWAITING_PHARMACY
3. AWAITING_PHARMACY → (Pharmacy dispenses) → COMPLETED

---

## Next Steps for Full Scenario A

Still needed (from previous discussion):

1. **File Fee Integration**
   - Auto-create ServicePayment for file fee on patient registration
   - Show in finance queue before doctor consultation

2. **Bundled Payments**
   - When doctor completes consultation, create TWO payments:
     - Consultation fee (5,000 TZS)
     - Pharmacy fee (sum of all medications)
   - Finance processes both together in one transaction

3. **Calculator Icon in Finance**
   - Add calculator icon (🧮) next to total amount
   - Clicking opens popover: "Amount Received", "Change" (auto-calculated)
   - UI-only, no database storage

4. **Finance Dashboard Updates**
   - Make amounts read-only
   - Finance role: only update payment status (PENDING → PAID)
   - Remove ability to edit amounts

---

## Files Modified

### Backend:
- `backend/doctor/models.py` (added general_advice field)
- `backend/doctor/serializers.py` (added general_advice, respiratory_rate to fields)
- `backend/doctor/migrations/0005_alter_consultation_general_advice.py` (new migration)

### Frontend:
- `frontend/src/components/EnhancedDiagnosisModal.tsx` (restructured Prescriptions tab, added general_advice throughout)

---

## Status: ✅ Ready for Testing

The Prescriptions tab restructure is complete and TypeScript errors are resolved. You can now test the new two-section layout for prescriptions (General Advice + Medication Prescriptions).
