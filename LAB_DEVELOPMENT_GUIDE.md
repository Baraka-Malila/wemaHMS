# 🧪 WEMA HMS Lab Portal - Complete Development Guide

## 🎯 Mission: Complete Lab Portal for Efficient Test Management

You are tasked with finalizing the **Lab Portal**—the backbone of diagnostics in our hospital workflow. This portal manages lab test requests, result entry, supply orders, and communication with doctors and patients.

---

## 🏥 Lab Portal Workflow (Business Logic)

### Lab Journey & Lab Staff Role
```
1. Patient arrives with lab request (from Doctor Portal)
2. Lab staff views pending requests, prioritizes by urgency
3. Lab staff processes test, enters results, marks status (IN_PROGRESS, COMPLETED, ABNORMAL, CRITICAL)
4. Results sent to Doctor Portal, flagged if urgent/critical
5. Lab staff manages supply orders for reagents/equipment
6. All actions are auditable and linked to patient/test record
```

### Queue Management
- **Pending Requests**: Display all lab requests not yet completed
- **Priority Handling**: Filter and highlight urgent/critical cases
- **Live Updates**: Queue updates as tests are processed

---

## 📋 Current Lab Portal Status

### ✅ What’s Working
- Dashboard with test stats (pending, completed, critical, processing time)
- Test queue display and filtering
- Test result entry and status management
- Supply order management (reagents, equipment, consumables)
- Modal for lab request details
- Test results display with critical/abnormal flagging

### 🔧 What Needs Completion

#### 1. Real API Integration
- Replace mock data with live API calls for queue, test results, supply orders

#### 2. Persistent Queue Logic
- Ensure queue always reflects real pending requests
- Add priority filtering and live updates

#### 3. Result Entry Workflow
- Link results to lab requests and patients
- Support status transitions (IN_PROGRESS, COMPLETED, ABNORMAL, CRITICAL)
- Require technician notes for urgent/critical results

#### 4. Supply Order Integration
- Create, track, and update supply orders
- Link orders to inventory management (future integration)

#### 5. History & Audit Trail
- Display full test history for each patient
- Ensure all actions are auditable

---

## 🔌 Backend API Status

### ✅ Available APIs
```python
# Lab Portal (lab app)
- GET /api/lab/queue/ → Pending lab requests
- POST /api/lab/result/ → Enter test result
- GET /api/lab/result/{id}/ → Test result details
- GET /api/lab/results/ → All test results
- POST /api/lab/supply-order/ → Create supply order
- GET /api/lab/supply-order/{id}/ → Supply order details

# Shared APIs
- GET /api/doctor/lab-request/{id}/ → Lab request details
- GET /api/patients/{id}/history/ → Patient test history
```

### 🏗️ Database Models
```python
# lab.LabTestResult → Test result record
# lab.LabOrder → Supply order record
```

---

## 🚀 Development Tasks for Claude

### Phase 1: Queue & Result Management
1. **Live Pending Queue**
   - Display all pending lab requests, filter by urgency
   - Real-time updates as tests are processed
2. **Result Entry Workflow**
   - Enter results, link to requests and patients
   - Status transitions (IN_PROGRESS, COMPLETED, etc.)
   - Require notes for urgent/critical results

### Phase 2: Supply Order Management
1. **Supply Orders**
   - Create, track, and update supply orders
   - Display order status, items, and delivery info

### Phase 3: History & Audit Trail
1. **Test History**
   - Display all past tests/results for each patient
   - Ensure audit trail for all lab actions

---

## 💡 Recommendations & Technical Insights

### Queue Management
- Use backend status field for queue logic
- Filter by urgency, support live updates

### Result Entry
- Link all results to lab requests and patients
- Require technician notes for urgent/critical results

### Supply Orders
- Integrate with inventory management (future)
- Track status and delivery for all orders

### Component Reuse
- Dashboard, queue, result entry, supply orders, history components

---

## 🎯 Starting Point for Claude

### Immediate Tasks
1. Replace mock data with API calls in all lab portal pages
2. Implement persistent pending queue with urgency filtering
3. Complete result entry workflow with status transitions
4. Integrate supply order creation/tracking
5. Display full test history and audit trail

### Key Files to Focus On
```
📁 Frontend:
- /app/lab/dashboard/page.tsx → Main dashboard
- /app/lab/test-results/page.tsx → Test results
- /app/lab/supply-orders/page.tsx → Supply orders
- /components/LabRequestDetailsModal.tsx → Lab request details modal

📁 Backend APIs:
- lab/views.py → All lab portal endpoints
- lab/models.py → LabTestResult, LabOrder models
- lab/serializers.py → API serializers
```

### Success Criteria
- ✅ Live pending queue with urgency filtering
- ✅ Complete result entry workflow
- ✅ Supply order management
- ✅ Full test history and audit trail

---

## 🔥 Critical Business Rules

1. **Pending lab requests are processed in order, with priority for urgent/critical**
2. **All test results are auditable and linked to requests/patients**
3. **Technician notes required for urgent/critical results**
4. **Supply orders are tracked and status updated**
5. **Test history is complete and accessible to lab staff and doctors**

---

**Ready to complete the Lab Portal? Let’s build the diagnostic backbone of our hospital management system! 🚀**
