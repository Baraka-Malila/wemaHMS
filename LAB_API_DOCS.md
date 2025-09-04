# LAB PORTAL API DOCUMENTATION

## Overview
The Lab Portal provides a streamlined interface for lab technicians to manage test results and supply orders. This portal focuses on essential laboratory operations without complex equipment or specimen tracking.

## Lab Portal Workflow
1. **Receive Test Requests**: From doctor portal via integration
2. **Process Tests**: Record results with status tracking  
3. **Report Results**: Send results back to doctors with priority flags
4. **Manage Supplies**: Order lab supplies through pharmacy system
5. **Monitor Performance**: Dashboard analytics and workload tracking

---

## LAB TEST RESULTS MANAGEMENT

### 1. List All Test Results
**GET** `/api/lab/test-results/`

Lists all lab test results with filtering options.

**Query Parameters:**
- `status` - Filter by result status (IN_PROGRESS, COMPLETED, ABNORMAL, CRITICAL)
- `urgent` - Filter urgent results only (true/false)
- `patient_id` - Filter by patient ID (PAT123, etc.)
- `date_from` - Filter from date (YYYY-MM-DD)
- `date_to` - Filter to date (YYYY-MM-DD)
- `test_type` - Filter by test type (Blood Test, X-Ray, etc.)

**Response:**
```json
[
  {
    "id": "uuid",
    "patient_id": "PAT123",
    "patient_name": "John Doe",
    "test_type": "Blood Test",
    "result_status": "COMPLETED",
    "status_display": "Test Completed",
    "urgent_flag": false,
    "test_completed_at": "2024-01-15T14:30:00Z",
    "processed_by_name": "Dr. Lab Tech",
    "doctor_notified": true,
    "doctor_viewed": false
  }
]
```

### 2. Create New Test Result
**POST** `/api/lab/test-results/`

Creates a new lab test result.

**Request Body:**
```json
{
  "lab_request_id": "uuid-from-doctor-app",
  "patient_id": "PAT123",
  "patient_name": "John Doe",
  "test_type": "Blood Test",
  "test_description": "Complete blood count",
  "result_summary": "All values within normal range",
  "result_details": "WBC: 7,000/µL, RBC: 4.5M/µL, Hemoglobin: 14g/dL",
  "normal_range": "WBC: 4,000-11,000/µL",
  "result_status": "COMPLETED",
  "urgent_flag": false,
  "technician_notes": "No abnormalities detected"
}
```

### 3. Get Test Result Details
**GET** `/api/lab/test-results/{id}/`

Retrieves full details of a specific test result.

**Response:**
```json
{
  "id": "uuid",
  "lab_request_id": "uuid",
  "patient_id": "PAT123",
  "patient_name": "John Doe",
  "test_type": "Blood Test",
  "test_description": "Complete blood count",
  "result_summary": "All values within normal range",
  "result_details": "WBC: 7,000/µL, RBC: 4.5M/µL, Hemoglobin: 14g/dL",
  "normal_range": "WBC: 4,000-11,000/µL",
  "result_status": "COMPLETED",
  "urgent_flag": false,
  "technician_notes": "No abnormalities detected",
  "result_image": null,
  "test_started_at": "2024-01-15T13:00:00Z",
  "test_completed_at": "2024-01-15T14:30:00Z",
  "processed_by": "uuid",
  "processed_by_name": "Dr. Lab Tech",
  "doctor_notified": true,
  "doctor_viewed": false,
  "processing_time_display": "1h 30m"
}
```

### 4. Update Test Result
**PATCH** `/api/lab/test-results/{id}/`

Updates an existing test result (restricted fields).

**Request Body:**
```json
{
  "result_summary": "Updated results",
  "result_status": "ABNORMAL",
  "urgent_flag": true,
  "technician_notes": "Requires immediate attention"
}
```

### 5. Get Results by Request ID
**GET** `/api/lab/test-results/by-request/{request_id}/`

Gets all test results for a specific lab request (used by doctors).

**Response:**
```json
{
  "success": true,
  "request_id": "uuid",
  "results_count": 2,
  "results": [...]
}
```

### 6. Mark Result as Urgent
**POST** `/api/lab/test-results/{result_id}/mark-urgent/`

Marks a test result as urgent requiring immediate doctor attention.

**Request Body:**
```json
{
  "technician_notes": "Abnormal values detected - requires immediate review"
}
```

### 7. Notify Doctor of Results
**POST** `/api/lab/test-results/{result_id}/notify-doctor/`

Marks that doctor has been notified of test results.

**Response:**
```json
{
  "success": true,
  "message": "Doctor notification sent successfully.",
  "result_id": "uuid",
  "patient_id": "PAT123"
}
```

---

## LAB SUPPLY ORDERS MANAGEMENT

### 1. List All Lab Orders
**GET** `/api/lab/orders/`

Lists all lab supply orders with filtering options.

**Query Parameters:**
- `status` - Filter by order status (DRAFT, SUBMITTED, APPROVED, COMPLETED, CANCELLED)
- `priority` - Filter by priority (LOW, NORMAL, HIGH, URGENT)

**Response:**
```json
[
  {
    "id": "uuid",
    "order_title": "Blood Test Reagents",
    "priority": "NORMAL",
    "priority_display": "Normal Priority",
    "status": "SUBMITTED",
    "status_display": "Submitted to Pharmacy",
    "estimated_cost": "50000.00",
    "requested_by_name": "Dr. Lab Tech",
    "created_at": "2024-01-15T10:00:00Z",
    "submitted_at": "2024-01-15T10:15:00Z"
  }
]
```

### 2. Create New Lab Order
**POST** `/api/lab/orders/`

Creates a new lab supply order.

**Request Body:**
```json
{
  "order_title": "Blood Test Reagents",
  "items_list": "- CBC reagent kit (5 units)\n- Blood collection tubes (100 pieces)\n- Alcohol swabs (200 pieces)",
  "justification": "Running low on blood test supplies, need restock for next week",
  "priority": "NORMAL",
  "estimated_cost": "50000.00"
}
```

### 3. Get Order Details
**GET** `/api/lab/orders/{id}/`

Retrieves full details of a specific lab order.

### 4. Submit Order to Pharmacy
**POST** `/api/lab/orders/{order_id}/submit/`

Submits a draft order to pharmacy for approval.

**Response:**
```json
{
  "success": true,
  "message": "Order submitted to pharmacy successfully.",
  "order": {...}
}
```

---

## DASHBOARD AND ANALYTICS

### 1. Lab Dashboard Statistics
**GET** `/api/lab/dashboard/stats/`

Gets comprehensive statistics for lab dashboard.

**Response:**
```json
{
  "success": true,
  "dashboard_stats": {
    "pending_tests": 15,
    "completed_today": 23,
    "urgent_results": 3,
    "critical_results": 1,
    "average_processing_time": 45.5,
    "pending_orders": 2,
    "recent_completions": [
      {
        "id": "uuid",
        "patient_id": "PAT123",
        "test_type": "Blood Test",
        "result_status": "COMPLETED",
        "test_completed_at": "2024-01-15T14:30:00Z"
      }
    ],
    "urgent_cases": [
      {
        "id": "uuid",
        "patient_id": "PAT456",
        "test_type": "X-Ray",
        "urgent_flag": true,
        "doctor_notified": false
      }
    ]
  },
  "last_updated": "2024-01-15T15:00:00Z"
}
```

### 2. Lab Workload Analysis
**GET** `/api/lab/dashboard/workload/?days=7`

Gets detailed workload analysis for lab management.

**Query Parameters:**
- `days` - Number of days to analyze (default: 7)

**Response:**
```json
{
  "success": true,
  "analysis_period": "2024-01-08 to 2024-01-15",
  "workload_analysis": {
    "total_tests_this_week": 156,
    "tests_by_type": {
      "Blood Test": 89,
      "X-Ray": 34,
      "Urine Test": 23,
      "ECG": 10
    },
    "tests_by_day": {
      "2024-01-08": 20,
      "2024-01-09": 25,
      "2024-01-10": 18,
      "2024-01-11": 22,
      "2024-01-12": 24,
      "2024-01-13": 28,
      "2024-01-14": 19
    },
    "technician_performance": [
      {
        "processed_by__first_name": "John",
        "processed_by__last_name": "Tech",
        "tests_completed": 45,
        "avg_processing_time": "0:42:30"
      }
    ],
    "busiest_hours": {
      "08:00": 12,
      "09:00": 18,
      "10:00": 22,
      "11:00": 19
    }
  }
}
```

### 3. Test Queue (Integration Point)
**GET** `/api/lab/test-queue/`

Gets the current test queue from doctor app (integration pending).

**Response:**
```json
{
  "success": true,
  "message": "Test queue endpoint ready - needs integration with doctor app",
  "queue_summary": {
    "urgent_requests": 0,
    "normal_requests": 0,
    "total_pending": 0
  },
  "pending_requests": []
}
```

---

## DATA MODELS

### LabTestResult Model
```json
{
  "id": "UUID (auto-generated)",
  "lab_request_id": "string (UUID from doctor app)",
  "patient_id": "string (PAT123 format)",
  "patient_name": "string",
  "test_type": "string",
  "test_description": "text",
  "result_summary": "text (required)",
  "result_details": "text (optional)",
  "normal_range": "string (optional)",
  "result_status": "choice (IN_PROGRESS, COMPLETED, ABNORMAL, CRITICAL)",
  "urgent_flag": "boolean",
  "technician_notes": "text (optional)",
  "result_image": "image (optional)",
  "test_started_at": "datetime (auto)",
  "test_completed_at": "datetime (auto)",
  "processed_by": "ForeignKey to User",
  "doctor_notified": "boolean",
  "doctor_viewed": "boolean"
}
```

### LabOrder Model
```json
{
  "id": "UUID (auto-generated)",
  "order_title": "string",
  "items_list": "text",
  "justification": "text",
  "priority": "choice (LOW, NORMAL, HIGH, URGENT)",
  "status": "choice (DRAFT, SUBMITTED, APPROVED, COMPLETED, CANCELLED)",
  "estimated_cost": "decimal (optional)",
  "requested_by": "ForeignKey to User",
  "approved_by": "ForeignKey to User (optional)",
  "created_at": "datetime (auto)",
  "updated_at": "datetime (auto)",
  "submitted_at": "datetime (optional)",
  "approved_at": "datetime (optional)"
}
```

---

## PERMISSIONS

### IsLabStaff
- **Description**: Lab technicians and lab managers
- **Access**: Full CRUD on test results and orders
- **Restrictions**: Cannot view other departments' private data

### IsLabStaffOrDoctor  
- **Description**: Lab staff + doctors for result viewing
- **Access**: Lab staff + doctors can view test results
- **Use Case**: Doctors checking results of their requests

---

## INTEGRATION POINTS

### Doctor App Integration
- **Lab Request Creation**: Doctor creates LabTestRequest
- **Result Linking**: Lab creates LabTestResult with lab_request_id
- **Notification**: Lab notifies doctor when results ready
- **Status Updates**: Bidirectional status updates

### Pharmacy Integration
- **Supply Orders**: Lab submits orders to pharmacy
- **Approval Workflow**: Pharmacy approves/rejects lab orders
- **Inventory Updates**: Pharmacy updates lab supply levels

### Patient App Integration
- **Shared Access**: All staff can view patient records
- **Status Updates**: Lab updates patient test status
- **History Tracking**: Lab results in patient timeline

---

## ERROR HANDLING

### Common Error Responses
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Validation Errors
```json
{
  "technician_notes": ["Technician notes are required for urgent results."],
  "result_details": ["Detailed results are required for abnormal findings."]
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request / Validation Error
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

---

## USAGE EXAMPLES

### Creating a Test Result
```javascript
const testResult = await fetch('/api/lab/test-results/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Token your-auth-token'
  },
  body: JSON.stringify({
    lab_request_id: 'uuid-from-doctor',
    patient_id: 'PAT123',
    patient_name: 'John Doe',
    test_type: 'Blood Test',
    test_description: 'Complete blood count',
    result_summary: 'Normal values',
    result_status: 'COMPLETED'
  })
});
```

### Marking Result as Urgent
```javascript
const urgentResult = await fetch('/api/lab/test-results/uuid/mark-urgent/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Token your-auth-token'
  },
  body: JSON.stringify({
    technician_notes: 'Critical values detected - immediate attention required'
  })
});
```

### Getting Dashboard Stats
```javascript
const dashboardStats = await fetch('/api/lab/dashboard/stats/', {
  headers: {
    'Authorization': 'Token your-auth-token'
  }
});
const stats = await dashboardStats.json();
```

---

## NEXT STEPS

1. **Frontend Integration**: Build React components for lab portal
2. **Doctor App Integration**: Connect with LabTestRequest model
3. **Pharmacy Integration**: Link lab orders with pharmacy system
4. **Notification System**: Real-time alerts for urgent results
5. **Report Generation**: PDF reports for test results
6. **Mobile App**: Lab technician mobile interface
