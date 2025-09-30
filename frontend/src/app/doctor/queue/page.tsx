'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  UserCheck,
  Eye,
  FileText,
  Phone,
  MapPin,
  Activity,
  User
} from 'lucide-react';
import auth from '@/lib/auth';
import PatientDetailsModal from '@/components/PatientDetailsModal';
import EnhancedDiagnosisModal from '@/components/EnhancedDiagnosisModal';
import PatientHistoryModal from '@/components/PatientHistoryModal';

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  phone_number?: string;
  age: number;
  gender: string;
  patient_type: string;
  current_status: string;
  current_location: string;
  created_at: string;
  consultation_info?: {
    chief_complaint: string;
    priority: string;
    doctor_assigned?: string;
  };
}

export default function PatientQueue() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startingConsultation, setStartingConsultation] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPatientId, setModalPatientId] = useState('');
  const [diagnosisModalOpen, setDiagnosisModalOpen] = useState(false);
  const [diagnosisPatientId, setDiagnosisPatientId] = useState('');
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyPatientId, setHistoryPatientId] = useState('');

  // Load waiting patients from API
  const loadWaitingPatients = async (isInitialLoad: boolean = false, priority?: string) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      const token = auth.getToken();

      const url = priority && priority !== 'all'
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/waiting-patients/?priority=${priority}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/waiting-patients/`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Waiting patients API response:', data);
        setPatients(data.waiting_patients || []);
        setError('');
      } else {
        setError('Failed to load waiting patients');
        console.error('API Error:', response.status, response.statusText);
      }
    } catch (error) {
      setError('Error loading patients');
      console.error('Error loading waiting patients:', error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  // Start consultation for a patient
  const handleStartConsultation = async (patient: Patient) => {
    try {
      setStartingConsultation(patient.patient_id);
      const token = auth.getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/start-consultation/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patient_id: patient.patient_id,
            chief_complaint: patient.consultation_info?.chief_complaint || 'General consultation',
            priority: patient.consultation_info?.priority || 'NORMAL'
          })
        }
      );

      if (response.ok) {
        // Open the diagnosis modal to record initial consultation details
        setDiagnosisPatientId(patient.patient_id);
        setDiagnosisModalOpen(true);
        // DON'T refresh queue here - only refresh when consultation is completed/saved
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to start consultation'}`);
      }
    } catch (error) {
      console.error('Error starting consultation:', error);
      alert('Error starting consultation. Please try again.');
    } finally {
      setStartingConsultation('');
    }
  };

  // View patient details (comprehensive view with all info)
  const handleViewPatient = (patient: Patient) => {
    setModalPatientId(patient.patient_id);
    setModalOpen(true);
  };

  // View patient history
  const handleViewHistory = (patient: Patient) => {
    setHistoryPatientId(patient.patient_id);
    setHistoryModalOpen(true);
  };

  // Format wait time to show hours and minutes
  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}hr${hours !== 1 ? 's' : ''}`;
    }
    return `${hours}hr${hours !== 1 ? 's' : ''} ${remainingMinutes}min`;
  };

  // Real-time updates
  useEffect(() => {
    loadWaitingPatients(true);

    // Auto-refresh every 10 seconds (fast for real-time queue monitoring)
    const refreshInterval = setInterval(() => {
      const priority = filterPriority !== 'all' ? filterPriority : undefined;
      loadWaitingPatients(false, priority);
    }, 10000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Handle priority filter changes
  useEffect(() => {
    const priority = filterPriority !== 'all' ? filterPriority : undefined;
    loadWaitingPatients(true, priority);
  }, [filterPriority]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'URGENT':
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'WITH_DOCTOR':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'WAITING_DOCTOR':
      case 'WAITING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
      case 'EMERGENCY':
      case 'HIGH':
        return 'text-red-600 bg-red-50';
      case 'NORMAL':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (patient.consultation_info?.chief_complaint || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.current_status === filterStatus;
    const matchesPriority = filterPriority === 'all' ||
                           (patient.consultation_info?.priority?.toUpperCase() === filterPriority.toUpperCase());
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const urgentCount = patients.filter(p =>
    p.consultation_info?.priority?.toUpperCase() === 'URGENT' ||
    p.consultation_info?.priority?.toUpperCase() === 'EMERGENCY'
  ).length;
  const waitingCount = patients.filter(p => p.current_status === 'WAITING_DOCTOR').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Queue</h1>
          <p className="text-sm text-gray-600">Manage patient appointments and consultations</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">{urgentCount} Urgent Cases</span>
          </div>
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">{waitingCount} Waiting</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name, ID, or complaint..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="WAITING_DOCTOR">Waiting Doctor</option>
                <option value="WITH_DOCTOR">With Doctor</option>
              </select>
            </div>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="URGENT">Urgent Priority</option>
              <option value="EMERGENCY">Emergency Priority</option>
              <option value="NORMAL">Normal Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-500">Loading patient queue...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700">{error}</div>
          <button
            onClick={() => loadWaitingPatients(true)}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredPatients.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients waiting</h3>
          <p className="text-gray-500">All patients have been seen or no patients are currently waiting.</p>
        </div>
      )}

      {/* Patient Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPatients.map((patient) => {
          const priority = patient.consultation_info?.priority || 'NORMAL';
          const isUrgent = priority.toUpperCase() === 'URGENT' || priority.toUpperCase() === 'EMERGENCY';
          const checkInTime = new Date(patient.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });
          const waitTime = Math.floor((Date.now() - new Date(patient.created_at).getTime()) / (1000 * 60));

          return (
            <div
              key={patient.id}
              className={`bg-white rounded-lg shadow-sm border-2 ${
                isUrgent ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
              } overflow-hidden`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-lg font-semibold text-green-600">
                        {patient.full_name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{patient.full_name}</h3>
                      <p className="text-sm text-gray-600">
                        {patient.patient_id} • {patient.age}y {patient.gender}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(patient.current_status)}`}>
                      {patient.current_status.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getPriorityColor(priority)}`}>
                      {priority} Priority
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-4">
                {/* Check-in Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Check-in: {checkInTime}</span>
                  </div>
                  <span className="text-orange-600 font-medium">
                    Wait: {formatWaitTime(waitTime)}
                  </span>
                </div>

                {/* Chief Complaint */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Chief Complaint</h4>
                  <p className="text-sm text-gray-700">
                    {patient.consultation_info?.chief_complaint || 'General consultation'}
                  </p>
                </div>

                {/* Patient Type */}
                <div className="flex items-center space-x-4 text-xs">
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className={`ml-1 px-2 py-1 rounded ${
                      patient.patient_type === 'NHIF' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {patient.patient_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-1 text-gray-900">{patient.current_location || 'Reception'}</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Phone className="h-3 w-3" />
                  <span>{patient.phone_number || 'No phone'}</span>
                </div>

                {/* Doctor Assignment */}
                {patient.consultation_info?.doctor_assigned && (
                  <div className="flex items-center space-x-2 text-xs">
                    <User className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="text-gray-900 font-medium">{patient.consultation_info.doctor_assigned}</span>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStartConsultation(patient)}
                    disabled={startingConsultation === patient.patient_id}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-md hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>
                      {startingConsultation === patient.patient_id ? 'Starting...' : 'Consult'}
                    </span>
                  </button>
                  <button
                    onClick={() => handleViewPatient(patient)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleViewHistory(patient)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>History</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Patient Details Modal */}
      <PatientDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        patientId={modalPatientId}
      />

      {/* Enhanced Diagnosis Modal */}
      <EnhancedDiagnosisModal
        isOpen={diagnosisModalOpen}
        onClose={() => setDiagnosisModalOpen(false)}
        patientId={diagnosisPatientId}
        onSave={() => {
          setDiagnosisModalOpen(false);
          const priority = filterPriority !== 'all' ? filterPriority : undefined;
          loadWaitingPatients(true, priority);
        }}
      />

      {/* Patient History Modal */}
      <PatientHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        patientId={historyPatientId}
      />
    </div>
  );
}
