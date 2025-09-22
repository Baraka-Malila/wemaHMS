# 📚 WEMA HMS - Consolidated API Documentation

**Last Updated**: September 22, 2025  
**Status**: Reference for deep development phase  

---

## 🎯 **Backend Status Overview**

### **✅ COMPLETED MODULES**

#### **1. Auth Portal** - 11 endpoints ✅
- User authentication & authorization
- Role-based access control  
- Password reset system
- Admin user management

#### **2. Patient Management** - Core APIs ✅  
- Universal patient search
- Patient registration & details
- Cross-portal patient data sharing

#### **3. Pharmacy Portal** - 2 main sections ✅
- Prescription queue & dispensing
- Medication inventory management

#### **4. Lab Portal** - Test & Supply Management ✅
- Test request processing
- Result recording & reporting  
- Lab supply ordering

---

## 🔄 **Patient Workflow Integration**

### **Reception → Doctor → Lab/Pharmacy Flow**
1. **Reception**: Patient registration & appointment scheduling
2. **Doctor**: Consultation, diagnosis, test/prescription orders
3. **Lab**: Test processing & results reporting
4. **Pharmacy**: Prescription dispensing & inventory

### **Cross-Portal Data Sharing**
- Patient data accessible across all portals
- Real-time status updates
- Integrated workflow notifications

---

## 📋 **API Summary by Portal**

### **Auth Portal APIs**
```
POST /api/auth/login/              - User authentication
POST /api/auth/logout/             - User logout  
POST /api/auth/register/           - Self registration
GET  /api/auth/profile/            - User profile
GET  /api/auth/users/              - All users (admin)
POST /api/auth/admin/create-user/  - Admin create user
POST /api/auth/password-reset-request/ - Reset token
POST /api/auth/password-reset-confirm/ - Confirm reset
```

### **Patient Management APIs**
```
GET  /api/patients/search/         - Universal patient search
POST /api/patients/register/       - New patient registration
GET  /api/patients/{id}/           - Patient details
PUT  /api/patients/{id}/           - Update patient info
```

### **Pharmacy Portal APIs**
```
GET  /api/pharmacy/prescription-queue/ - Pending prescriptions
POST /api/pharmacy/scan/               - Barcode scanning
POST /api/pharmacy/prescriptions/{id}/complete/ - Complete dispensing
GET  /api/pharmacy/medications/        - Medication inventory
```

### **Lab Portal APIs**
```
GET  /api/lab/test-requests/       - Incoming test requests
POST /api/lab/results/{id}/        - Record test results
GET  /api/lab/supply-orders/       - Lab supply management
POST /api/lab/supply-orders/       - Create supply order
```

---

## 🛡️ **Security & Authentication**

### **Role-Based Access**
- **ADMIN**: Full system access
- **DOCTOR**: Patient consultation, orders
- **LAB**: Test processing, results
- **PHARMACY**: Prescription dispensing
- **RECEPTION**: Patient registration, scheduling
- **NURSING**: Patient care, monitoring
- **FINANCE**: Billing, payments

### **Token Authentication**
```
Authorization: Token <user_auth_token>
```

---

## 🔧 **Development Notes**

### **Database Design**
- PostgreSQL with proper relationships
- UUID primary keys for security
- Audit trails for critical operations

### **API Standards**
- RESTful endpoints
- JSON request/response
- Proper HTTP status codes
- Comprehensive error handling

### **Integration Points**
- Cross-portal patient data sharing
- Real-time workflow notifications
- Barcode/QR scanning support

---

**For detailed API specifications, refer to individual portal documentation files.**
