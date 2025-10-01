Patient Journey with Payment Gates:

  1. RECEPTION → DOCTOR (Consultation)
     ├─ Doctor examines patient
     ├─ Completes: Patient findings + Diagnosis
     │
     ├─ SCENARIO A: Direct Treatment (No labs needed)
     │  ├─ Doctor writes Treatment Plan...directly in patient findings & if Prescriptions
     │  ├─ Patient status: COMPLETED
     │  └─ Patient goes to: PHARMACY (if prescriptions) →
  EXIT
     │
     └─ SCENARIO B: Lab Tests Needed
        ├─ Doctor fills Lab Requests tab only
        ├─ Leaves patient findings & Prescriptions
        ├─ Patient status: PENDING_LAB_PAYMENT
        │
        ├─ FINANCE (Cashier) - Pay for lab tests
        │  ├─ Service: LAB_TESTS
        │  ├─ Status change: PENDING_LAB_PAYMENT → LAB_PAID
        │  └─ Patient can now proceed to lab
        │
        ├─ LAB - Perform tests
        │  ├─ Verify: status === LAB_PAID (bottleneck)
        │  ├─ Conduct tests, record results
        │  └─ Status change: LAB_PAID → LAB_COMPLETED
        │
        ├─ DOCTOR (Return for results)
        │  ├─ Reviews lab results
        │  ├─ Updates (just writes below on the section)..we'll auto append to existing findings or find a way to display the results and doc to write hist more clinical notes again and so on...
        │  └─ Status change: LAB_COMPLETED →
  TREATMENT_PRESCRIBED
        │
        ├─ FINANCE (Cashier) - Pay for prescriptions
        │  ├─ Service: PHARMACY
        │  ├─ Status change: TREATMENT_PRESCRIBED →
  PHARMACY_PAID
        │  └─ Patient can now get medications
        │
        └─ PHARMACY - Dispense medications
           ├─ Verify: status === PHARMACY_PAID (bottleneck)
           ├─ Dispense medications
           └─ Status change: PHARMACY_PAID → COMPLETED → EXIT(exit makes this patient an existing so from this moment he or she can be checked in again from the reception as an existing patient)
