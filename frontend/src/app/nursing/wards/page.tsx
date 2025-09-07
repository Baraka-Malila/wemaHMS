'use client';

import { useState, useEffect } from 'react';
import { 
  Users,
  Bed,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  UserMinus,
  Settings,
  Eye,
  Edit,
  Search,
  Filter,
  Calendar,
  MapPin,
  Activity,
  Heart,
  FileText
} from 'lucide-react';

export default function WardManagement() {
  const [activeWard, setActiveWard] = useState('ward-a');
  const [viewMode, setViewMode] = useState('overview'); // overview, bed-assignment, staff-schedule
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with API calls
  const wards = [
    {
      id: 'ward-a',
      name: 'Ward A - General Medicine',
      capacity: 20,
      occupied: 16,
      available: 4,
      nursing_staff: 4,
      support_staff: 2,
      status: 'NORMAL',
      alerts: 2
    },
    {
      id: 'ward-b',
      name: 'Ward B - Surgery',
      capacity: 15,
      occupied: 12,
      available: 3,
      nursing_staff: 5,
      support_staff: 2,
      status: 'BUSY',
      alerts: 1
    },
    {
      id: 'ward-c',
      name: 'Ward C - Pediatrics',
      capacity: 10,
      occupied: 8,
      available: 2,
      nursing_staff: 3,
      support_staff: 1,
      status: 'NORMAL',
      alerts: 0
    }
  ];

  const beds = [
    {
      id: 'A101',
      wardId: 'ward-a',
      number: 'A101',
      status: 'OCCUPIED',
      patient: {
        id: 'PAT001',
        name: 'John Doe',
        age: 45,
        condition: 'Post-operative care',
        admissionDate: '2024-09-05',
        vitalsStatus: 'STABLE',
        alerts: ['Medication due in 30 min']
      },
      assignedNurse: 'Sarah Johnson',
      lastCleaned: '2024-09-07 06:00:00',
      equipment: ['IV Stand', 'Monitor']
    },
    {
      id: 'A102',
      wardId: 'ward-a',
      number: 'A102',
      status: 'OCCUPIED',
      patient: {
        id: 'PAT002',
        name: 'Mary Johnson',
        age: 62,
        condition: 'Cardiac monitoring',
        admissionDate: '2024-09-06',
        vitalsStatus: 'CRITICAL',
        alerts: ['BP elevated', 'Heart rate irregular']
      },
      assignedNurse: 'Sarah Johnson',
      lastCleaned: '2024-09-07 05:30:00',
      equipment: ['Cardiac Monitor', 'IV Stand', 'Oxygen']
    },
    {
      id: 'A103',
      wardId: 'ward-a',
      number: 'A103',
      status: 'MAINTENANCE',
      patient: null,
      assignedNurse: null,
      lastCleaned: '2024-09-07 04:00:00',
      equipment: ['IV Stand'],
      maintenanceReason: 'Bed frame repair needed'
    },
    {
      id: 'A104',
      wardId: 'ward-a',
      number: 'A104',
      status: 'AVAILABLE',
      patient: null,
      assignedNurse: null,
      lastCleaned: '2024-09-07 07:00:00',
      equipment: ['IV Stand', 'Monitor']
    }
  ];

  const nursingStaff = [
    {
      id: 'NS001',
      name: 'Sarah Johnson',
      role: 'Senior Nurse',
      shift: 'Day (7AM-7PM)',
      wardAssignment: 'ward-a',
      patientsAssigned: 8,
      status: 'ON_DUTY',
      specializations: ['Post-op care', 'Wound care']
    },
    {
      id: 'NS002',
      name: 'Mike Davis',
      role: 'Registered Nurse',
      shift: 'Night (7PM-7AM)',
      wardAssignment: 'ward-a',
      patientsAssigned: 6,
      status: 'OFF_DUTY',
      specializations: ['Critical care', 'Emergency response']
    },
    {
      id: 'NS003',
      name: 'Lisa Brown',
      role: 'Licensed Practical Nurse',
      shift: 'Day (7AM-7PM)',
      wardAssignment: 'ward-a',
      patientsAssigned: 4,
      status: 'ON_DUTY',
      specializations: ['Medication administration', 'Patient education']
    }
  ];

  const getWardStatusColor = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'BUSY':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case 'OCCUPIED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MAINTENANCE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CLEANING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVitalsStatusColor = (status: string) => {
    switch (status) {
      case 'STABLE':
        return 'text-green-600';
      case 'CRITICAL':
        return 'text-red-600';
      case 'MONITORING':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStaffStatusColor = (status: string) => {
    switch (status) {
      case 'ON_DUTY':
        return 'bg-green-100 text-green-800';
      case 'OFF_DUTY':
        return 'bg-gray-100 text-gray-800';
      case 'BREAK':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activeWardData = wards.find(w => w.id === activeWard);
  const wardBeds = beds.filter(b => b.wardId === activeWard);
  const wardStaff = nursingStaff.filter(s => s.wardAssignment === activeWard);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ward Management</h1>
            <p className="text-gray-600 mt-1">Monitor ward capacity, bed assignments, and staff scheduling</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
              <UserPlus className="h-4 w-4" />
              <span>Admit Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ward Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wards.map((ward) => (
          <div
            key={ward.id}
            onClick={() => setActiveWard(ward.id)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-colors ${
              activeWard === ward.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{ward.name}</h3>
              <div className="flex items-center space-x-2">
                {ward.alerts > 0 && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-medium">{ward.alerts}</span>
                  </div>
                )}
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getWardStatusColor(ward.status)}`}>
                  {ward.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Occupancy</span>
                <span className="text-sm font-medium text-gray-900">
                  {ward.occupied}/{ward.capacity} beds
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(ward.occupied / ward.capacity) * 100}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Available:</span>
                  <span className="ml-1 font-medium text-green-600">{ward.available}</span>
                </div>
                <div>
                  <span className="text-gray-600">Staff:</span>
                  <span className="ml-1 font-medium text-gray-900">{ward.nursing_staff + ward.support_staff}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ward Details */}
      {activeWardData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{activeWardData.name}</h2>
                <p className="text-gray-600">
                  {activeWardData.occupied} occupied • {activeWardData.available} available • {activeWardData.nursing_staff + activeWardData.support_staff} staff
                </p>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getWardStatusColor(activeWardData.status)}`}>
                {activeWardData.status}
              </span>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setViewMode('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bed Status
              </button>
              <button
                onClick={() => setViewMode('staff-schedule')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'staff-schedule'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Staff Schedule
              </button>
            </nav>
          </div>

          {/* Bed Status View */}
          {viewMode === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wardBeds.map((bed) => (
                  <div key={bed.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Bed className="h-5 w-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{bed.number}</span>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getBedStatusColor(bed.status)}`}>
                        {bed.status}
                      </span>
                    </div>

                    {bed.patient ? (
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-gray-900">{bed.patient.name}</p>
                          <p className="text-sm text-gray-600">{bed.patient.condition}</p>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Activity className={`h-4 w-4 ${getVitalsStatusColor(bed.patient.vitalsStatus)}`} />
                          <span className={`text-sm font-medium ${getVitalsStatusColor(bed.patient.vitalsStatus)}`}>
                            {bed.patient.vitalsStatus}
                          </span>
                        </div>

                        {bed.patient.alerts && bed.patient.alerts.length > 0 && (
                          <div className="space-y-1">
                            {bed.patient.alerts.map((alert, index) => (
                              <div key={index} className="flex items-center space-x-1 text-red-600">
                                <AlertTriangle className="h-3 w-3" />
                                <span className="text-xs">{alert}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          <p>Nurse: {bed.assignedNurse}</p>
                          <p>Admitted: {bed.patient.admissionDate}</p>
                        </div>
                      </div>
                    ) : bed.status === 'MAINTENANCE' ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1 text-red-600">
                          <Settings className="h-4 w-4" />
                          <span className="text-sm font-medium">Under Maintenance</span>
                        </div>
                        <p className="text-xs text-gray-600">{bed.maintenanceReason}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Available</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Last cleaned: {new Date(bed.lastCleaned).toLocaleString()}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">Equipment:</span>
                          <span className="text-xs text-gray-700">{bed.equipment.length}</span>
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <Eye className="h-3 w-3" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <Edit className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staff Schedule View */}
          {viewMode === 'staff-schedule' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Nursing Staff Schedule</h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                  <Calendar className="h-4 w-4" />
                  <span>Manage Schedule</span>
                </button>
              </div>

              <div className="space-y-4">
                {wardStaff.map((staff) => (
                  <div key={staff.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{staff.name}</h4>
                          <p className="text-sm text-gray-600">{staff.role}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStaffStatusColor(staff.status)}`}>
                        {staff.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Shift</p>
                        <p className="text-sm font-medium text-gray-900">{staff.shift}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Patients Assigned</p>
                        <p className="text-sm font-medium text-gray-900">{staff.patientsAssigned}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Specializations</p>
                        <p className="text-sm font-medium text-gray-900">{staff.specializations.join(', ')}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-md hover:bg-green-100 transition-colors">
                        <Edit className="h-4 w-4" />
                        <span>Edit Assignment</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
