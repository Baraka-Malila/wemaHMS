# 🩺 WEMA HMS Doctor Portal - Complete Development Guide

## 🎯 Mission: Complete Doctor Portal for Seamless Patient Care

You are tasked with finalizing the **Doctor Portal**—the heart of patient care in our government hospital workflow. This portal manages patient queue, consultations, diagnoses, lab requests, prescriptions, and handoffs to other departments.

---

## 🏥 Doctor Portal Workflow (Business Logic)

### Patient Journey & Doctor’s Role
```
1. Patient arrives (status: WAITING_DOCTOR) → Doctor picks from queue
2. Doctor reviews history, complaints, vitals
3. Doctor records consultation, diagnosis, and treatment plan
4. Doctor orders lab tests (if needed) → Lab requests tracked
5. Doctor prescribes medication → Prescription sent to Pharmacy
6. Doctor updates patient status (COMPLETED, FOLLOW_UP_REQUIRED, REFERRED)
7. All actions are auditable and linked to patient record
```

### Queue Management
- **FIFO Queue**: Patients appear in order of arrival, filtered by priority (Normal, Urgent, Emergency)
- **Live Updates**: Queue updates as patients are seen or status changes
- **No Assignment**: Any doctor can pick any waiting patient

---

## 📋 Current Doctor Portal Status

### ✅ What’s Working
- Patient queue display and filtering
- Consultation record creation and editing
- Diagnosis management (ICD codes, severity, notes)
- Lab test request workflow
- Prescription management and handoff to Pharmacy
- Patient history and visit details
- Dashboard statistics (patients today, pending diagnoses, lab requests, prescriptions)

### 🔧 What Needs Completion

#### 1. Real API Integration
- Replace mock data with live API calls for queue, consultations, diagnoses, labs, prescriptions

#### 2. Persistent Queue Logic
- Ensure queue is always FIFO and reflects real patient status
- Add priority filtering and live updates

#### 3. Consultation Workflow
- Link consultation to patient and doctor
- Support status transitions (IN_PROGRESS, COMPLETED, FOLLOW_UP_REQUIRED, REFERRED)
- Record vitals, complaints, findings, diagnosis, treatment plan

#### 4. Lab & Prescription Integration
- Lab requests: Create, track, and update status/results
- Prescriptions: Create, track, and handoff to Pharmacy

#### 5. History & Audit Trail
- Display full patient visit history, diagnoses, prescriptions, lab results
- Ensure all actions are auditable

---

## 🔌 Backend API Status

### ✅ Available APIs
```python
# Doctor Portal (doctor app)
- GET /api/doctor/queue/ → Patients waiting for doctor
- POST /api/doctor/consultation/ → Create consultation
- GET /api/doctor/consultation/{id}/ → Consultation details
- PUT /api/doctor/consultation/{id}/ → Update consultation
- POST /api/doctor/lab-request/ → Create lab request
- GET /api/doctor/lab-request/{id}/ → Lab request details
- POST /api/doctor/prescription/ → Create prescription
- GET /api/doctor/prescription/{id}/ → Prescription details

# Shared APIs
- GET /api/patients/{id}/history/ → Patient history
```

### 🏗️ Database Models
```python
# doctor.Consultation → Consultation record
# doctor.LabTestRequest → Lab test request
# doctor.Prescription → Prescription record
```

---

## 🚀 Development Tasks for Claude

### Phase 1: Queue & Consultation Management
1. **Live FIFO Queue**
   - Display patients in order of arrival, filter by priority
   - Real-time updates as patients are seen
2. **Consultation Workflow**
   - Create/edit consultation records
   - Record vitals, complaints, findings, diagnosis, treatment plan
   - Status transitions (IN_PROGRESS, COMPLETED, etc.)

### Phase 2: Lab & Prescription Integration
1. **Lab Requests**
   - Create lab requests from consultation
   - Track status/results, display in patient history
2. **Prescriptions**
   - Create prescriptions, link to diagnosis
   - Handoff to Pharmacy, track dispensing status

### Phase 3: History & Audit Trail
1. **Patient History**
   - Display all past visits, diagnoses, prescriptions, lab results
   - Ensure audit trail for all doctor actions

---

## 💡 Recommendations & Technical Insights

### Queue Management
- Use backend status field for queue logic
- Filter by priority, support live updates

### Consultation & Diagnosis
- Link all records to patient and doctor
- Use ICD codes for diagnoses, severity, notes

### Lab & Prescription
- Integrate with lab and pharmacy portals via API
- Track status and results for full workflow

### Component Reuse
- Dashboard, queue, consultation, diagnosis, lab, prescription, history components

---

## 🎯 Starting Point for Claude

### Immediate Tasks
1. Replace mock data with API calls in all doctor portal pages
2. Implement persistent FIFO queue with priority filtering
3. Complete consultation workflow with status transitions
4. Integrate lab and prescription creation/tracking
5. Display full patient history and audit trail

### Key Files to Focus On
```
📁 Frontend:
- /app/doctor/dashboard/page.tsx → Main dashboard
- /app/doctor/queue/page.tsx → Patient queue
- /app/doctor/diagnoses/page.tsx → Diagnoses
- /app/doctor/history/page.tsx → Patient history
- /app/doctor/prescriptions/page.tsx → Prescriptions
- /app/doctor/lab-requests/page.tsx → Lab requests

📁 Backend APIs:
- doctor/views.py → All doctor portal endpoints
- doctor/models.py → Consultation, LabTestRequest, Prescription models
- doctor/serializers.py → API serializers
```

### Success Criteria
- ✅ Live FIFO queue with priority filtering
- ✅ Complete consultation workflow
- ✅ Lab and prescription integration
- ✅ Full patient history and audit trail

---

## 🔥 Critical Business Rules

1. **Patients are seen in FIFO order, with priority override**
2. **All consultations, diagnoses, labs, and prescriptions are auditable**
3. **Lab and prescription handoffs are tracked and status updated**
4. **Patient history is complete and accessible to all doctors**

---

**Ready to complete the Doctor Portal? Let’s build the core of our hospital management system! 🚀**
