# Patient Management API Documentation

## Overview

The Patient Management System provides comprehensive APIs for managing patients across all hospital sectors. The system follows a hybrid architecture with core patient data centralized and sector-specific operations distributed.

## Architecture

### Core Patient APIs (`/api/patients/`)
- **Universal search**: Used by all sectors to find patients
- **Patient details**: Complete patient information retrieval  
- **Status updates**: Live tracking of patient movement through hospital

### Reception-Specific APIs (`/api/reception/`)
- **Patient registration**: New patient registration with file fee tracking
- **Detail updates**: Contact and personal information updates

## API Endpoints

### 1. Search Patients
**Endpoint**: `GET /api/patients/search/`

**Purpose**: Universal patient search used by all hospital sectors

**Parameters**:
- `q` (required): Search query (name, phone, or patient ID)
- `status` (optional): Filter by current status
- `limit` (optional): Limit results (default: 20, max: 100)

**Example Request**:
```http
GET /api/patients/search/?q=John&status=REGISTERED&limit=10
Authorization: Token your_auth_token
```

**Example Response**:
```json
{
  "results": [
    {
      "id": "uuid-here",
      "patient_id": "PAT001",
      "full_name": "John Doe",
      "phone_number": "+255123456789",
      "gender": "MALE",
      "current_status": "REGISTERED",
      "current_location": "Reception - Jane Smith",
      "age": 35,
      "created_at": "2025-09-04T10:30:00Z"
    }
  ],
  "count": 1,
  "query": "John",
  "status_filter": "REGISTERED",
  "limit": 10
}
```

### 2. Get Patient Details
**Endpoint**: `GET /api/patients/{patient_id}/`

**Purpose**: Retrieve complete patient information including status history

**Parameters**:
- `patient_id`: Either UUID or patient ID (e.g., "PAT001")

**Example Request**:
```http
GET /api/patients/PAT001/
Authorization: Token your_auth_token
```

**Example Response**:
```json
{
  "id": "uuid-here",
  "patient_id": "PAT001",
  "full_name": "John Doe",
  "phone_number": "+255123456789",
  "gender": "MALE",
  "date_of_birth": "1990-01-15",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+255987654321",
  "address": "123 Main St, Dar es Salaam",
  "tribe": "Chagga",
  "weight": 75.50,
  "height": 175.00,
  "blood_group": "O+",
  "allergies": "Penicillin",
  "chronic_conditions": "Hypertension",
  "file_fee_paid": true,
  "file_fee_amount": 2000.00,
  "file_fee_payment_date": "2025-09-04T10:30:00Z",
  "current_status": "REGISTERED",
  "current_location": "Reception - Jane Smith",
  "created_at": "2025-09-04T10:30:00Z",
  "updated_at": "2025-09-04T10:30:00Z",
  "created_by_name": "Jane Smith",
  "created_by_role": "RECEPTION",
  "last_updated_by_name": null,
  "age": 35,
  "bmi": 24.69,
  "is_new_patient": true,
  "recent_status_changes": [
    {
      "id": "uuid-here",
      "previous_status": null,
      "new_status": "REGISTERED",
      "previous_location": null,
      "new_location": "Reception - Jane Smith",
      "changed_at": "2025-09-04T10:30:00Z",
      "notes": "Patient registered by Jane Smith",
      "changed_by_name": "Jane Smith",
      "changed_by_role": "RECEPTION"
    }
  ]
}
```

### 3. Update Patient Status
**Endpoint**: `PATCH /api/patients/{patient_id}/status/`

**Purpose**: Update patient status and location with audit trail

**Request Body**:
```json
{
  "current_status": "WITH_DOCTOR",
  "current_location": "Consultation Room 1 - Dr. Smith",
  "notes": "Patient moved to doctor consultation"
}
```

**Example Response**:
```json
{
  "message": "Patient status updated successfully",
  "patient_id": "PAT001",
  "previous_status": "REGISTERED",
  "new_status": "WITH_DOCTOR",
  "previous_location": "Reception - Jane Smith",
  "new_location": "Consultation Room 1 - Dr. Smith",
  "updated_by": "Dr. Smith",
  "updated_at": "2025-09-04T11:00:00Z"
}
```

### 4. Register New Patient
**Endpoint**: `POST /api/reception/register-patient/`

**Purpose**: Register new patient with file fee tracking

**Request Body**:
```json
{
  "full_name": "John Doe",
  "phone_number": "+255123456789",
  "gender": "MALE",
  "date_of_birth": "1990-01-15",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+255987654321",
  "address": "123 Main St, Dar es Salaam",
  "tribe": "Chagga",
  "weight": 75.50,
  "height": 175.00,
  "blood_group": "O+",
  "allergies": "Penicillin",
  "chronic_conditions": "Hypertension",
  "file_fee_paid": true
}
```

**Example Response**:
```json
{
  "message": "Patient registered successfully",
  "patient_id": "PAT001",
  "patient_uuid": "uuid-here",
  "full_name": "John Doe",
  "phone_number": "+255123456789",
  "file_fee_required": false,
  "file_fee_amount": 2000.0,
  "current_status": "REGISTERED",
  "registered_by": "Jane Smith",
  "registered_at": "2025-09-04T10:30:00Z"
}
```

### 5. Update Patient Details
**Endpoint**: `PATCH /api/reception/patients/{patient_id}/details/`

**Purpose**: Update patient contact and personal information

**Request Body**:
```json
{
  "phone_number": "+255123456790",
  "address": "456 New St, Dar es Salaam",
  "weight": 76.00
}
```

**Example Response**:
```json
{
  "message": "Patient details updated successfully",
  "patient_id": "PAT001",
  "updated_fields": ["phone_number", "address", "weight"],
  "updated_by": "Jane Smith",
  "updated_at": "2025-09-04T11:30:00Z"
}
```

## Data Models

### Patient Status Options
```python
STATUS_CHOICES = [
    ('REGISTERED', 'Just Registered'),
    ('WAITING_DOCTOR', 'Waiting for Doctor'),
    ('WITH_DOCTOR', 'Currently with Doctor'),
    ('WAITING_LAB', 'Waiting for Lab Tests'),
    ('IN_LAB', 'Currently in Laboratory'),
    ('LAB_RESULTS_READY', 'Lab Results Ready'),
    ('WAITING_PHARMACY', 'Waiting for Pharmacy'),
    ('IN_PHARMACY', 'Currently in Pharmacy'),
    ('PAYMENT_PENDING', 'Payment Required'),
    ('COMPLETED', 'Visit Completed'),
    ('DISCHARGED', 'Discharged'),
]
```

### Required vs Optional Fields

**Required Fields** (cannot be null/empty):
- `full_name`
- `phone_number`
- `gender`
- `date_of_birth`

**Optional Fields** (can be null/empty):
- `emergency_contact_name`
- `emergency_contact_phone`
- `address`
- `tribe`
- `weight`
- `height`
- `blood_group`
- `allergies`
- `chronic_conditions`

### Calculated Fields
- `age`: Auto-calculated from date_of_birth
- `bmi`: Auto-calculated from height and weight (if both available)
- `is_new_patient`: True if registered today

## Authentication

All endpoints require authentication using Django Token Authentication:

```http
Authorization: Token your_auth_token
```

## Error Handling

### Common Error Responses

**400 Bad Request**:
```json
{
  "error": "Search query (q) is required"
}
```

**401 Unauthorized**:
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**404 Not Found**:
```json
{
  "error": "Patient not found: PAT999"
}
```

**Validation Errors**:
```json
{
  "phone_number": ["A patient with this phone number already exists."],
  "date_of_birth": ["Date of birth cannot be in the future."]
}
```

## Best Practices

### 1. Search Performance
- Use specific search terms to limit results
- Include status filters when appropriate
- Set reasonable limits (default 20, max 100)

### 2. Status Updates
- Always include meaningful location information
- Add notes for important status changes
- Update status immediately when patient moves

### 3. Data Validation
- Phone numbers are validated but flexible in format
- Date of birth cannot be in future
- Duplicate phone numbers are prevented

### 4. Audit Trail
- All status changes are automatically logged
- Patient creation and updates track responsible staff
- Status history provides complete timeline

## Integration Examples

### Frontend Patient Search Component
```javascript
const searchPatients = async (query, status = null) => {
  const params = new URLSearchParams({ q: query, limit: 20 });
  if (status) params.append('status', status);
  
  const response = await fetch(`/api/patients/search/?${params}`, {
    headers: {
      'Authorization': `Token ${authToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};
```

### Update Patient Status
```javascript
const updatePatientStatus = async (patientId, status, location, notes = '') => {
  const response = await fetch(`/api/patients/${patientId}/status/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Token ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      current_status: status,
      current_location: location,
      notes: notes
    })
  });
  
  return response.json();
};
```

## System Features

### Auto-Generated Patient IDs
- Format: PAT001, PAT002, PAT003, etc.
- Automatically assigned on patient creation
- Unique and sequential

### File Fee Tracking
- Default fee: 2000 TZS for new patients
- Payment date automatically recorded
- Boolean flag for payment status

### Live Status Tracking
- Real-time patient location and status
- Complete audit trail of all movements
- Staff accountability for all changes

### Flexible Data Entry
- Only 4 fields required (name, phone, gender, DOB)
- All other fields optional and can be filled later
- No data loss if partial information provided

This API documentation provides complete coverage of the patient management system, following best practices for robust, scalable hospital management.
