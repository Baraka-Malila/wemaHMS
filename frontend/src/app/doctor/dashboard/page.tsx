'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  TestTube,
  Pill,
  Clock,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Edit,
  UserCheck,
  History,
  RefreshCw
} from 'lucide-react';
import RealTimeClock from '@/components/ui/RealTimeClock';
import auth from '@/lib/auth';
import PatientQueueModal from '@/components/PatientQueueModal';
import DiagnosisModal from '@/components/DiagnosisModal';

interface DashboardStats {
  today_consultations: number;
  pending_consultations: number;
  patients_waiting: number;
  lab_requests_pending: number;
  prescriptions_today: number;
  recent_consultations: any[];
  urgent_cases: any[];
  doctor_name: string;
}

export default function DoctorDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load dashboard data from API
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = auth.getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/dashboard/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard API response:', data);
        setDashboardData(data);
        setError('');
      } else {
        setError('Failed to load dashboard data');
        console.error('Dashboard API Error:', response.status, response.statusText);
      }
    } catch (error) {
      setError('Error loading dashboard');
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get current user data using auth manager
    const user = auth.getUser();
    if (user) {
      setCurrentUser(user);
    }

    // Load dashboard data
    loadDashboardData();
    loadWaitingPatientsQueue();

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      loadDashboardData();
      loadWaitingPatientsQueue();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Generate stats from dashboard data
  const stats = dashboardData ? [
    {
      title: 'Patients Today',
      value: dashboardData.today_consultations.toString(),
      change: `${dashboardData.patients_waiting} waiting`,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Consultations',
      value: dashboardData.pending_consultations.toString(),
      change: `${dashboardData.urgent_cases.length} urgent cases`,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Lab Requests',
      value: dashboardData.lab_requests_pending.toString(),
      change: 'Pending results',
      icon: TestTube,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Prescriptions',
      value: dashboardData.prescriptions_today.toString(),
      change: 'Today\'s total',
      icon: Pill,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ] : [];

  // Load real waiting patients queue (same as queue page)
  const [waitingPatients, setWaitingPatients] = useState<any[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPatientId, setModalPatientId] = useState('');
  const [modalMode, setModalMode] = useState<'view' | 'history'>('view');
  const [diagnosisModalOpen, setDiagnosisModalOpen] = useState(false);
  const [diagnosisPatientId, setDiagnosisPatientId] = useState('');
  const [startingConsultation, setStartingConsultation] = useState<string>('');

  const loadWaitingPatientsQueue = async () => {
    try {
      setQueueLoading(true);
      const token = auth.getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/waiting-patients/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWaitingPatients(data.waiting_patients || []);
      }
    } catch (error) {
      console.error('Error loading waiting patients:', error);
    } finally {
      setQueueLoading(false);
    }
  };

  // Handler functions for dashboard actions
  const handleStartConsultation = async (patient: any) => {
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
        // Refresh the queue
        loadWaitingPatientsQueue();
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

  const handleViewPatient = (patient: any) => {
    setModalPatientId(patient.patient_id);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleViewHistory = (patient: any) => {
    setModalPatientId(patient.patient_id);
    setModalMode('history');
    setModalOpen(true);
  };

  // Use real waiting patients as the queue
  const patientQueue = waitingPatients.slice(0, 5); // Show top 5 in dashboard


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING_DOCTOR':
        return 'bg-yellow-100 text-yellow-800';
      case 'WITH_DOCTOR':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FOLLOW_UP_REQUIRED':
        return 'bg-orange-100 text-orange-800';
      case 'REFERRED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
      case 'EMERGENCY':
        return 'text-red-600';
      case 'NORMAL':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredPatients = patientQueue.filter(patient => {
    const matchesSearch = (patient.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (patient.patient_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (patient.consultation_info?.chief_complaint || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.current_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-gray-100 rounded-xl p-6 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-16 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-700">{error}</div>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}, {dashboardData?.doctor_name || currentUser?.full_name || 'Doctor'}!
            </h1>
            <p className="text-blue-100">
              You have {dashboardData?.patients_waiting || 0} patients waiting
              {dashboardData?.urgent_cases?.length ? ` and ${dashboardData.urgent_cases.length} urgent cases requiring attention` : ''}.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={loadDashboardData}
              className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
              title="Refresh dashboard"
            >
              <RefreshCw className="h-5 w-5 text-white" />
            </button>
            <div className="bg-white/10 rounded-lg p-4">
              <Clock className="h-8 w-8 text-white mb-2" />
              <p className="text-sm text-blue-100">Current Time</p>
              <RealTimeClock className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Patient Queue Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Patient Queue</h2>
              <p className="text-sm text-gray-600">Manage your patient appointments and consultations</p>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-600 font-medium">
                {dashboardData?.urgent_cases?.length || 0} Urgent Cases
              </span>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
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
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Patients</option>
                <option value="URGENT">Urgent Cases</option>
                <option value="WAITING">Waiting</option>
                <option value="IN_PROGRESS">In Progress</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chief Complaint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">
                          {(patient.full_name || 'N/A').split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{patient.full_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">
                          {patient.patient_id || 'N/A'} • {patient.age}y {patient.gender}
                        </div>
                        <div className="text-xs text-gray-400">Checked in: {new Date(patient.created_at).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.current_status || 'WAITING_DOCTOR')}`}>
                        {(patient.current_status || 'WAITING_DOCTOR').replace('_', ' ')}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(patient.consultation_info?.priority || 'NORMAL')}`}>
                        {patient.consultation_info?.priority || 'NORMAL'} Priority
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {patient.consultation_info?.chief_complaint || 'General consultation'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(patient.created_at).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStartConsultation(patient)}
                        disabled={startingConsultation === patient.patient_id}
                        className="text-green-700 hover:text-green-900 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>{startingConsultation === patient.patient_id ? 'Starting...' : 'Consult'}</span>
                      </button>
                      <button
                        onClick={() => handleViewPatient(patient)}
                        className="text-blue-700 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleViewHistory(patient)}
                        className="text-gray-700 hover:text-gray-900 flex items-center space-x-1"
                      >
                        <History className="h-4 w-4" />
                        <span>History</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search criteria.' 
                : 'No patients in queue at the moment.'}
            </p>
          </div>
        )}
      </div>

      {/* Patient Details/History Modal */}
      <PatientQueueModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        patientId={modalPatientId}
        mode={modalMode}
      />

      {/* Diagnosis Modal */}
      <DiagnosisModal
        isOpen={diagnosisModalOpen}
        onClose={() => setDiagnosisModalOpen(false)}
        patientId={diagnosisPatientId}
        onSave={() => {
          setDiagnosisModalOpen(false);
          loadWaitingPatientsQueue();
        }}
      />
    </div>
  );
}
