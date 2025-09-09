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
  MapPin
} from 'lucide-react';
import PatientDetailsModal from '@/components/PatientDetailsModal';

interface WaitingPatient {
  id: string;
  patient_id: string;
  full_name: string;
  age: number;
  gender: string;
  phone_number: string;
  current_status: string;
  current_location: string;
  created_at: string;
  consultation_info?: {
    chief_complaint: string;
    priority: string;
    doctor_assigned: string | null;
  };
}

export default function PatientQueue() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [patients, setPatients] = useState<WaitingPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<WaitingPatient | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  
  const fetchWaitingPatients = async () => {
    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch('http://localhost:8000/api/doctor/waiting-patients/', {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data.waiting_patients);
      } else {
        console.error('Failed to fetch patient queue:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching patient queue:', error);
    } finally {
      setLoading(false);
    }
  };

  // Start consultation
  const handleStartConsultation = async (patient: WaitingPatient) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/doctor/start-consultation/`, {
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
      });
      
      if (response.ok) {
        alert(`Consultation started with ${patient.full_name}`);
        fetchWaitingPatients(); // Refresh the queue
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to start consultation'}`);
      }
    } catch (error) {
      console.error('Error starting consultation:', error);
      alert('Error starting consultation. Please try again.');
    }
  };

  // View patient details
  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowPatientDetails(true);
  };

  useEffect(() => {
    fetchWaitingPatients();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'URGENT':
      case 'WAITING_DOCTOR':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'WAITING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
      case 'HIGH':
        return 'text-red-600 bg-red-50';
      case 'NORMAL':
      case 'LOW':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (patient.consultation_info?.chief_complaint || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.current_status === filterStatus;
    const matchesPriority = filterPriority === 'all' || (patient.consultation_info?.priority || 'NORMAL') === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const urgentCount = patients.filter(p => (p.consultation_info?.priority || 'NORMAL') === 'URGENT').length;
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
                <option value="URGENT">Urgent</option>
                <option value="WAITING">Waiting</option>
                <option value="IN_PROGRESS">In Progress</option>
              </select>
            </div>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="High">High Priority</option>
              <option value="Normal">Normal Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className={`bg-white rounded-lg shadow-sm border-2 ${
              (patient.consultation_info?.priority || 'NORMAL') === 'URGENT' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
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
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getPriorityColor(patient.consultation_info?.priority || 'NORMAL')}`}>
                    {patient.consultation_info?.priority || 'NORMAL'} Priority
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
                  <span className="text-gray-600">Check-in: {new Date(patient.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{patient.phone_number}</span>
                </div>
              </div>

              {/* Chief Complaint */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Chief Complaint</h4>
                <p className="text-sm text-gray-700">{patient.consultation_info?.chief_complaint || 'General consultation'}</p>
              </div>

              {/* Patient Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Patient Information</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Location</p>
                    <p className="font-medium">{patient.current_location || 'Waiting Area'}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Doctor</p>
                    <p className="font-medium">{patient.consultation_info?.doctor_assigned || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Phone className="h-3 w-3" />
                <span>{patient.phone_number}</span>
              </div>
            </div>

            {/* Card Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleStartConsultation(patient)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                  <UserCheck className="h-4 w-4" />
                  <span>Start Consultation</span>
                </button>
                <button 
                  onClick={() => handleViewPatient(patient.patient_id)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors">
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'No patients in queue at the moment.'}
          </p>
        </div>
      )}

      {/* Patient Details Modal */}
      {showPatientDetails && selectedPatientId && (
        <PatientDetailsModal
          patientId={selectedPatientId}
          isOpen={showPatientDetails}
          onClose={() => {
            setShowPatientDetails(false);
            setSelectedPatientId('');
          }}
        />
      )}
    </div>
  );
}
