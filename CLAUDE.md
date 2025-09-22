# CLAUDE.md - Critical Development Context & Rules

## 🎯 **Project Overview**

**WEMA Hospital Management System** - A comprehensive, role-based hospital management platform built with modern technologies and real-world workflow implementation.

**Tech Stack**: Django REST + Next.js 15 + PostgreSQL + Redis + Docker
**Architecture**: Containerized microservices with role-based authentication
**Current Status**: 70% complete - Core patient workflow functional, ready for intensive development

---

## 🚨 **CRITICAL STATUS UPDATE - September 22, 2025**

### **⚠️ KNOWN CRITICAL BUGS (Documented in CRITICAL_BUGS.md)**
1. **Multi-Tab Authentication Confusion** - When multiple tabs open, user context gets mixed between roles
2. **Static Time Display** - Dashboard clocks don't update in real-time

**🔒 RESOLUTION STATUS**: Bugs documented and deferred. DO NOT ATTEMPT TO FIX during heavy development phase.
**🎯 PRIORITY**: Complete core functionality first, address bugs in dedicated bug-fix session.

---

## 🚨 **CRITICAL DEVELOPMENT RULES** (The "Songs" You Keep Singing)

### **1. API Integration First, Always!**
- **"We use REAL APIs, not mock data!"** - Always integrate with backend endpoints
- Replace mock data immediately with actual API calls
- Test API integration before considering a feature "complete"
- If backend API doesn't exist, create it first, then integrate

### **2. Reuse Components, Don't Duplicate**
- **"We already have modals - REUSE them!"** - Use existing `PatientDetailsModal`, `NewPatientModal`, `ExistingPatientModal`
- Check `/components/` before creating new components
- Maintain design consistency across all portals
- Share UI components between similar workflows

### **3. Real Hospital Workflow Logic**
- **"Hospitals work FIFO, not random!"** - Implement proper patient queue logic
- Separate monitoring (Dashboard) from workspace (Queue/Operations)
- Follow actual medical workflow: Registration → Check-in → Queue → Consultation → Services
- Patient status flow: `REGISTERED` → `FILE_FEE_PAID` → `WAITING_DOCTOR` → `WITH_DOCTOR` → `COMPLETED`

### **4. Fix Errors Immediately**
- **"TypeScript errors? Fix them NOW!"** - Never ignore compilation errors
- Use `git checkout HEAD -- file.tsx` to restore when in doubt
- Check error logs before adding new features
- Test changes before moving to next task

### **5. Docker & Backend Dependencies**
- **"Check the package name!"** - It's `django-filter`, not `django_filters`
- Always check if packages are installed correctly
- Use Docker logs to debug backend issues
- Keep containers running during development

### **🔒 6. Bug Avoidance Rules (Critical)**
- **DO NOT** modify authentication/session management during heavy development
- **DO NOT** attempt to fix multi-tab authentication issues yet
- **IGNORE** time display bugs unless specifically requested  
- **FOCUS** on core patient workflow completion

---

## 🎯 **IMMEDIATE DEVELOPMENT PRIORITIES**

### **Phase 1: Complete Patient Workflow (Current Focus)**
1. **Reception Portal** - Patient registration, appointment scheduling
2. **Doctor Portal** - Consultation management, diagnosis, prescriptions
3. **Lab Portal** - Test processing, results management
4. **Pharmacy Portal** - Prescription dispensing, inventory
5. **Nursing Portal** - Patient monitoring, ward management

### **Phase 2: Financial & Administrative**
1. **Finance Portal** - Billing, payments, reports
2. **Admin Portal** - User management, system settings
3. **Reports & Analytics** - Cross-portal reporting

### **Phase 3: Bug Resolution & Polish**
1. Fix multi-tab authentication issues
2. Implement real-time clock components
3. Performance optimization
4. Security enhancements

---

## 💻 **Development Standards**

### **Code Quality**
- Follow clean, modular coding practices with clear separation of concerns
- Write descriptive variable names (no single letters except loops)
- Use TypeScript properly - define interfaces for all data structures
- Implement proper error handling with user-friendly messages
- Add loading states for all async operations

### **Component Structure**
```tsx
// Always follow this pattern:
const [loading, setLoading] = useState(false);
const [data, setData] = useState<DataType[]>([]);
const [error, setError] = useState('');

const fetchData = async () => {
  try {
    setLoading(true);
    const response = await fetch(`${API_URL}/endpoint/`);
    if (response.ok) {
      const result = await response.json();
      setData(result);
    }
  } catch (error) {
    setError('Failed to load data');
  } finally {
    setLoading(false);
  }
};
```

### **API Integration Standards**
- Always use `localStorage.getItem('auth_token')` for authentication
- Include proper headers: `Authorization: Token ${token}`, `Content-Type: application/json`
- Handle 401 (unauthorized), 403 (forbidden), 404 (not found) responses
- Use consistent error messaging across components
- Implement proper loading and error states

### **File Organization**
- Keep related functionality in same directory
- Use descriptive file names (`PatientDetailsModal.tsx`, not `Modal.tsx`)
- Place shared types in `/types/index.ts`
- Keep API calls in component files (don't over-abstract)

---

## 🤝 **Collaboration Guidelines**

### **Before Making Changes**
- **Read CLAUDE.md first** - Always reference this file for context
- Check existing implementations before creating new solutions
- Review recent git commits to understand current work
- Ask for clarification if workflow or requirements are unclear

### **When Editing Files**
- Provide clear context about what you're changing and why
- Use `replace_string_in_file` with 3-5 lines of context before/after
- Test changes immediately after implementation
- Explain any complex logic or architectural decisions

### **Error Resolution Process**
1. Check terminal/browser errors first
2. Review recent changes that might have caused the issue
3. Use git to revert problematic changes if needed
4. Fix root cause, not just symptoms
5. Test fix thoroughly before proceeding

### **Communication Style**
- Be concise but complete in explanations
- Show what was changed, not just what will be changed
- Suggest improvements before applying large refactors
- Always explain reasoning for significant architectural decisions

---

## 🐳 **Docker & Deployment**

### **Container Management**
- Keep Dockerfiles minimal and focused
- Use multi-stage builds for production
- Ensure all containers start successfully with `docker-compose up`
- Monitor container logs for errors: `docker-compose logs backend --tail=10`

### **Development Environment**
- Frontend runs on `http://localhost:3000`
- Backend API on `http://localhost:8000`
- Database: PostgreSQL on port 5434
- Redis cache on port 6379

### **Environment Variables**
```bash
# Backend (.env)
DEBUG=1
DB_HOST=db
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,192.168.180.*

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📊 **Current Implementation Status**

### **✅ Completed & Tested**
- **Reception Portal**: Full patient workflow with real API integration
- **Doctor Portal**: Dashboard (monitoring) + Queue (workspace) with proper FIFO logic
- **Authentication**: Role-based login with employee ID auto-generation
- **Patient Management**: Auto-ID (PAT1, PAT2...), status tracking, cross-portal sharing
- **Modals**: Reusable patient components across all portals

### **🔄 Next Priorities**
1. **Doctor Workflow**: Complete prescription/lab request pages with API integration
2. **Pharmacy Portal**: Connect existing backend APIs to frontend interface
3. **Lab Portal**: Test results and supply order management
4. **Finance Portal**: Daily operations and billing dashboard

### **⚠️ Common Issues & Solutions**
- **TypeScript errors**: Use proper typing, check for null values
- **API connection issues**: Verify Docker containers are running
- **Component duplication**: Always check existing components first
- **State management**: Use proper loading/error states for all async operations

---

## 🏥 **Hospital Workflow Context**

### **Patient Flow Implementation**
```
Registration (Reception) → File Fee → Check-in → Queue (Doctor) 
    ↓                       ↓           ↓           ↓
   PAT{ID}            Payment Record  WAITING    WITH_DOCTOR
                                      
Consultation (Doctor) → Prescription → Lab Tests → Completion
        ↓                    ↓            ↓          ↓
   Medical Record      Pharmacy Queue  Lab Queue  COMPLETED
```

### **Role-Based Portal Access**
- **Reception**: Patient registration, check-in, file fee processing
- **Doctor**: Patient queue (FIFO), consultations, prescriptions, lab orders
- **Pharmacy**: Medication dispensing, inventory management
- **Lab**: Test processing, results entry, supply orders
- **Admin**: User management, system monitoring, approvals
- **Finance**: Billing, expenses, payroll, reporting

---

## 📝 **Special Notes & Reminders**

### **The Golden Rules**
- **"Always check if it exists first!"** - Components, APIs, functions
- **"Real hospitals use FIFO!"** - Patient processing order matters
- **"Integration over isolation!"** - Connect systems, don't build silos
- **"Test immediately!"** - Don't stack untested changes
- **"Backend first, frontend second!"** - Ensure API exists before frontend

### **When in Doubt**
1. Check this CLAUDE.md file for guidance
2. Look at existing working implementations (Reception portal)
3. Review backend API documentation in `*_API_DOCS.md` files
4. Ask for clarification rather than guessing
5. Use git to revert when things break

### **Success Metrics**
- All features use real API integration (no mock data)
- Patient workflow follows real hospital logic
- Components are reused across portals
- No TypeScript compilation errors
- Docker containers run without issues
- User experience matches actual medical workflows

---

**Remember: We're building a real hospital system, not a demo. Every decision should reflect actual medical practice and real-world workflows.**

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
