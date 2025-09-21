# WEMA Hospital Management System - Project Overview

## 🏗️ **Project Structure (3 Levels Deep)**

```
WEMA-HMS/
├── backend/                          # Django REST API (Python 3.x)
│   ├── core/                         # Django project settings & configuration
│   │   ├── settings.py               # Main configuration (DB, apps, middleware)
│   │   ├── urls.py                   # API route definitions
│   │   └── permissions.py            # Custom permission classes
│   ├── auth_portal/                  # Authentication & user management
│   │   ├── models.py                 # Custom User model with role-based system
│   │   ├── views.py                  # Login, registration, admin approval
│   │   └── urls.py                   # Auth endpoints (/api/auth/)
│   ├── patients/                     # Patient records & management
│   │   ├── models.py                 # Patient model with auto-ID generation (PAT1, PAT2...)
│   │   ├── views.py                  # Patient CRUD, search, status updates
│   │   └── urls.py                   # Patient endpoints (/api/patients/)
│   ├── doctor/                       # Medical consultations & prescriptions
│   │   ├── models.py                 # Consultation, Prescription, LabRequest models
│   │   ├── views.py                  # Queue management, consultation workflow
│   │   └── urls.py                   # Doctor endpoints (/api/doctor/)
│   ├── reception/                    # Patient registration & check-in
│   │   ├── models.py                 # Reception-specific operations
│   │   ├── views.py                  # Registration, file fee, check-in logic
│   │   └── urls.py                   # Reception endpoints (/api/reception/)
│   ├── pharmacy/                     # Medication inventory & dispensing
│   │   ├── models.py                 # Medication, Inventory, Prescription models
│   │   ├── views.py                  # Stock management, prescription processing
│   │   └── urls.py                   # Pharmacy endpoints (/api/pharmacy/)
│   ├── lab/                          # Laboratory tests & results
│   │   ├── models.py                 # LabTest, LabResult, SupplyOrder models
│   │   ├── views.py                  # Test processing, results management
│   │   └── urls.py                   # Lab endpoints (/api/lab/)
│   ├── nursing/                      # Patient care & ward management
│   │   ├── models.py                 # Ward, PatientCare, VitalSigns models
│   │   ├── views.py                  # Ward assignments, care documentation
│   │   └── urls.py                   # Nursing endpoints (/api/nursing/)
│   ├── finance/                      # Billing, pricing & payroll
│   │   ├── models.py                 # ServicePricing, Revenue, StaffSalary models
│   │   ├── views.py                  # Financial operations, expense tracking
│   │   └── urls.py                   # Finance endpoints (/api/pricing/, /api/expenses/, /api/payroll/)
│   ├── admin_portal/                 # System administration
│   │   ├── models.py                 # Admin-specific models
│   │   ├── views.py                  # User management, system monitoring
│   │   └── urls.py                   # Admin endpoints (/api/admin/)
│   ├── requirements.txt              # Python dependencies
│   └── Dockerfile                    # Backend containerization
├── frontend/                         # Next.js 15.5.2 (React 19, TypeScript)
│   ├── src/
│   │   ├── app/                      # App Router (Next.js 13+ structure)
│   │   │   ├── (auth)/               # Authentication pages
│   │   │   │   ├── login/            # Sign-in page
│   │   │   │   ├── register/         # Sign-up page
│   │   │   │   └── forgot-password/  # Password reset
│   │   │   ├── admin/                # Administrative portal
│   │   │   │   ├── dashboard/        # Admin overview
│   │   │   │   ├── staff/            # Staff management
│   │   │   │   └── patients/         # Patient administration
│   │   │   ├── reception/            # Front desk operations
│   │   │   │   ├── dashboard/        # Reception overview & patient management
│   │   │   │   ├── register/         # New patient registration
│   │   │   │   └── payments/         # Payment processing
│   │   │   ├── doctor/               # Medical practice portal
│   │   │   │   ├── dashboard/        # Doctor overview (monitoring only)
│   │   │   │   ├── queue/            # Patient queue (main workspace)
│   │   │   │   ├── prescriptions/    # Prescription management
│   │   │   │   ├── lab-requests/     # Lab test ordering
│   │   │   │   ├── diagnoses/        # Diagnosis tracking
│   │   │   │   └── history/          # Patient history
│   │   │   ├── pharmacy/             # Medication management
│   │   │   │   ├── dashboard/        # Pharmacy overview
│   │   │   │   ├── dispense/         # Prescription dispensing
│   │   │   │   └── stock/            # Inventory management
│   │   │   ├── lab/                  # Laboratory operations
│   │   │   │   ├── dashboard/        # Lab overview
│   │   │   │   ├── test-results/     # Results management
│   │   │   │   └── supply-orders/    # Equipment ordering
│   │   │   ├── nursing/              # Patient care portal
│   │   │   │   ├── dashboard/        # Nursing overview
│   │   │   │   ├── care/             # Patient care documentation
│   │   │   │   └── wards/            # Ward management
│   │   │   └── finance/              # Financial management
│   │   │       ├── dashboard/        # Financial overview
│   │   │       └── daily-ops/        # Daily financial operations
│   │   ├── components/               # Reusable React components
│   │   │   ├── auth/                 # Authentication components
│   │   │   ├── ui/                   # UI components (buttons, forms, tables)
│   │   │   ├── NewPatientModal.tsx   # Patient registration modal
│   │   │   ├── ExistingPatientModal.tsx  # Patient search & check-in
│   │   │   ├── PatientDetailsModal.tsx   # Patient information viewer
│   │   │   └── EditPatientModal.tsx  # Patient information editor
│   │   ├── lib/                      # Utility functions
│   │   └── types/                    # TypeScript type definitions
│   ├── package.json                  # Node.js dependencies
│   └── Dockerfile                    # Frontend containerization
├── DESIGNS/                          # UI/UX Design assets
│   ├── HOSPITAL-SCHEMA.sql           # Database schema documentation
│   └── frontend-designs/             # UI mockups and wireframes
├── docker-compose.yml                # Multi-container orchestration
└── *.md                              # Documentation files
```

---

## 🔧 **Django Backend Apps (Role Summary)**

### **1. auth_portal**
Custom authentication system with role-based access control. Manages user registration, login, admin approval workflow, and employee ID auto-generation (ADM001, DOC001, etc.).

### **2. patients** 
Core patient records management with auto-generated patient IDs (PAT1, PAT2...). Handles patient creation, updates, status tracking, and cross-portal patient data sharing.

### **3. reception**
Front desk operations including patient registration, file fee payment processing, patient check-in workflow, and reception dashboard statistics.

### **4. doctor**
Medical consultation workflow, patient queue management, prescription creation, lab test requests, and doctor dashboard with FIFO patient processing.

### **5. pharmacy**
Medication inventory management, prescription processing, stock alerts, medication dispensing, and pharmacy operations dashboard.

### **6. lab**
Laboratory test management, result recording, supply ordering, and lab workflow coordination with doctor requests.

### **7. nursing**
Patient care documentation, ward management, vital signs tracking, and nursing workflow coordination.

### **8. finance**
Service pricing management, revenue tracking, expense recording, staff payroll, and financial reporting across all hospital operations.

### **9. admin_portal**
System administration, user management, approval workflows, and hospital-wide monitoring and configuration.

---

## 🎨 **Next.js Frontend Portals**

### **Authentication Portal (`(auth)/`)**
- **login/** - Staff sign-in with role-based redirection
- **register/** - Self-registration with admin approval required  
- **forgot-password/** - Password reset workflow

### **Reception Portal (`reception/`)**
- **dashboard/** - ✅ **COMPLETED**: Patient management, search, registration, check-in, stats
- **register/** - Patient registration form
- **payments/** - Payment processing interface

### **Doctor Portal (`doctor/`)**
- **dashboard/** - ✅ **COMPLETED**: Overview monitoring (read-only queue view)
- **queue/** - ✅ **COMPLETED**: Main workspace (FIFO patient processing)
- **prescriptions/** - Prescription management
- **lab-requests/** - Lab test ordering
- **diagnoses/** - Diagnosis documentation
- **history/** - Patient medical history

### **Pharmacy Portal (`pharmacy/`)**
- **dashboard/** - Pharmacy overview and metrics
- **dispense/** - Prescription dispensing workflow
- **stock/** - Inventory management

### **Lab Portal (`lab/`)**
- **dashboard/** - Laboratory overview
- **test-results/** - Results entry and management
- **supply-orders/** - Equipment and supply ordering

### **Nursing Portal (`nursing/`)**
- **dashboard/** - Patient care overview
- **care/** - Care documentation
- **wards/** - Ward management

### **Finance Portal (`finance/`)**
- **dashboard/** - Financial overview and reporting
- **daily-ops/** - Daily financial operations

### **Admin Portal (`admin/`)**
- **dashboard/** - System overview and monitoring
- **staff/** - Employee management
- **patients/** - Patient administration

---

## 🔗 **Integration Notes**

### **Containerization & Infrastructure**
- **Docker Compose** orchestrates 4 services: PostgreSQL, Redis, Django Backend, Next.js Frontend
- **Database**: PostgreSQL 15 with persistent volumes
- **Caching**: Redis 7 for session management and API caching
- **Development**: Hot-reload enabled for both frontend and backend

### **Authentication & Authorization**
- **Token-based auth**: Django REST Framework tokens stored in localStorage
- **Role-based access**: Custom User model with roles (ADMIN, DOCTOR, RECEPTION, etc.)
- **Employee ID system**: Auto-generated IDs by role (DOC001, REC001, etc.)
- **Admin approval**: New registrations require admin approval before activation

### **API Architecture & Endpoints**

#### **Authentication APIs (`/api/auth/`)**
- `POST /login/` - Staff authentication with role-based redirection
- `POST /register/` - Self-registration (requires admin approval)
- `GET /profile/` - Current user information
- `GET /admin/pending-approvals/` - Admin approval workflow

#### **Patient Management APIs (`/api/patients/`)**
- `GET /search/` - ✅ **INTEGRATED**: Patient search across portals
- `GET /{id}/` - Patient details retrieval
- `PATCH /{id}/status/` - ✅ **INTEGRATED**: Status updates (WAITING_DOCTOR, WITH_DOCTOR, etc.)

#### **Reception APIs (`/api/reception/`)**
- `POST /register-patient/` - ✅ **INTEGRATED**: New patient registration with file fee
- `GET /dashboard/` - ✅ **INTEGRATED**: Reception dashboard statistics
- `POST /patients/{id}/check-in/` - ✅ **INTEGRATED**: Patient check-in workflow

#### **Doctor APIs (`/api/doctor/`)**
- `GET /waiting-patients/` - ✅ **INTEGRATED**: FIFO patient queue
- `POST /start-consultation/` - ✅ **INTEGRATED**: Begin patient consultation
- `GET /dashboard/` - ✅ **INTEGRATED**: Doctor dashboard statistics
- `POST /prescriptions/` - Prescription creation
- `POST /lab-requests/` - Lab test ordering

#### **Pharmacy APIs (`/api/pharmacy/`)**
- `GET /prescription-queue/` - Pending prescriptions
- `POST /scan/` - Medication scanning
- `GET /medications/` - Medication inventory
- `POST /stock/restock/` - Stock management

#### **Lab APIs (`/api/lab/`)**
- `GET /patients/` - Lab queue management
- `GET /results/` - Test results management
- `POST /orders/` - Supply ordering

#### **Finance APIs (`/api/pricing/`, `/api/expenses/`, `/api/payroll/`)**
- `GET /pricing/services/` - Service pricing management
- `POST /expenses/record/` - Expense tracking
- `GET /payroll/staff/` - Staff salary management

### **Data Flow & Patient Workflow**
1. **Registration**: Reception registers patient → File fee payment → Patient gets PAT{ID}
2. **Check-in**: Patient checked in → Status: `WAITING_DOCTOR` → Appears in doctor queue
3. **Consultation**: Doctor starts consultation → Status: `WITH_DOCTOR` → Medical workflow
4. **Prescription**: Doctor creates prescription → Appears in pharmacy queue
5. **Lab Tests**: Doctor orders tests → Appears in lab queue
6. **Completion**: All services completed → Patient status updated → Financial tracking

### **Component Reusability**
- **Shared Modals**: `PatientDetailsModal`, `NewPatientModal`, `ExistingPatientModal` used across portals
- **UI Components**: Consistent design system with Tailwind CSS and Lucide React icons
- **Type Safety**: Full TypeScript integration with shared type definitions

---

## 📊 **Project Status & Completion**

### **✅ Completed (70% Overall)**

#### **Backend (85% Complete)**
- ✅ **Authentication system** - Full role-based auth with admin approval
- ✅ **Patient management** - Auto-ID generation, status tracking, cross-portal sharing
- ✅ **Reception workflow** - Registration, file fee, check-in integration
- ✅ **Doctor workflow** - Queue management, consultation start/stop
- ✅ **Database models** - All core models implemented with relationships
- ✅ **API endpoints** - Core APIs functional and tested
- ✅ **Docker setup** - Full containerization with PostgreSQL and Redis

#### **Frontend (60% Complete)**
- ✅ **Reception portal** - Complete dashboard, patient management, modals
- ✅ **Doctor portal** - Dashboard and queue pages with proper workflow separation
- ✅ **Authentication** - Login/register with role-based routing
- ✅ **Component system** - Reusable modals and UI components
- ✅ **API integration** - Reception and doctor portals fully connected

### **🔄 In Progress (20%)**
- 🔄 **Pharmacy portal** - Backend complete, frontend needs integration
- 🔄 **Lab portal** - Backend complete, frontend needs integration  
- 🔄 **Doctor workflow** - Prescription/lab request pages need API integration
- 🔄 **Finance portal** - Backend complete, frontend dashboard needed

### **❌ Pending (10%)**
- ❌ **Admin portal** - System administration interface
- ❌ **Nursing portal** - Patient care documentation
- ❌ **Reports system** - Financial and operational reporting
- ❌ **Advanced features** - Notifications, real-time updates, mobile optimization

---

## 🎯 **Next Development Priorities**

### **Immediate (1-2 weeks)**
1. **Complete Doctor portal** - Prescription and lab request pages with API integration
2. **Pharmacy portal integration** - Connect frontend to existing backend APIs
3. **Lab portal integration** - Test results and supply order interfaces

### **Short term (2-4 weeks)**  
4. **Finance portal** - Dashboard and daily operations interface
5. **Admin portal** - User management and system monitoring
6. **Error handling** - Comprehensive error handling and validation

### **Medium term (1-2 months)**
7. **Advanced features** - Real-time notifications, dashboard analytics
8. **Mobile optimization** - Responsive design improvements
9. **Performance optimization** - Caching, database optimization
10. **Testing & QA** - Comprehensive testing suite and documentation

---

## 🏥 **Hospital Workflow Implementation**

The system successfully implements real hospital workflows with:
- **FIFO patient processing** in doctor queues
- **Role-based access control** ensuring data security
- **Real-time status tracking** across all departments  
- **Financial integration** for service pricing and revenue tracking
- **Cross-portal communication** enabling seamless patient care coordination

**Current state**: Core patient flow from registration to consultation is fully functional. Next phase focuses on completing medication/lab workflows and administrative features.
