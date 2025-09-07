'use client';

import { useState } from 'react';
import { 
  TestTube, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';

export default function LabRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [showNewRequest, setShowNewRequest] = useState(false);

  // Mock lab requests data
  const labRequests = [
    {
      id: 'LAB001',
      patientId: 'PAT001',
      patientName: 'John Doe',
      age: 35,
      gender: 'Male',
      requestDate: '2025-09-07',
      testType: 'Complete Blood Count',
      category: 'Hematology',
      urgency: 'Routine',
      status: 'PENDING',
      clinicalHistory: 'Chest pain, hypertension evaluation',
      instructions: 'Fasting not required. Patient on antihypertensive medication.',
      expectedDate: '2025-09-08',
      requestedBy: 'Dr. Smith',
      labNotes: '',
      results: null,
      createdAt: '2025-09-07T10:30:00Z'
    },
    {
      id: 'LAB002',
      patientId: 'PAT002',
      patientName: 'Mary Johnson',
      age: 28,
      gender: 'Female',
      requestDate: '2025-09-07',
      testType: 'CT Scan Brain',
      category: 'Radiology',
      urgency: 'URGENT',
      status: 'IN_PROGRESS',
      clinicalHistory: 'Severe headache with nausea, rule out intracranial pathology',
      instructions: 'Contrast study if indicated. Patient allergic to iodine - use alternative.',
      expectedDate: '2025-09-07',
      requestedBy: 'Dr. Smith',
      labNotes: 'Scan in progress, preliminary findings normal',
      results: null,
      createdAt: '2025-09-07T11:15:00Z'
    },
    {
      id: 'LAB003',
      patientId: 'PAT003',
      patientName: 'David Smith',
      age: 42,
      gender: 'Male',
      requestDate: '2025-09-06',
      testType: 'Lipid Profile',
      category: 'Biochemistry',
      urgency: 'Routine',
      status: 'COMPLETED',
      clinicalHistory: 'Hypertension follow-up, cardiovascular risk assessment',
      instructions: '12-hour fasting required. Morning collection preferred.',
      expectedDate: '2025-09-07',
      requestedBy: 'Dr. Smith',
      labNotes: 'Results within normal limits',
      results: {
        summary: 'Normal lipid profile',
        details: 'Total Cholesterol: 180 mg/dL, HDL: 45 mg/dL, LDL: 110 mg/dL, Triglycerides: 125 mg/dL',
        abnormal: false
      },
      createdAt: '2025-09-06T14:20:00Z'
    },
    {
      id: 'LAB004',
      patientId: 'PAT004',
      patientName: 'Sarah Wilson',
      age: 55,
      gender: 'Female',
      requestDate: '2025-09-05',
      testType: 'HbA1c',
      category: 'Biochemistry',
      urgency: 'Routine',
      status: 'COMPLETED',
      clinicalHistory: 'Type 2 diabetes monitoring',
      instructions: 'No fasting required. Patient on metformin.',
      expectedDate: '2025-09-06',
      requestedBy: 'Dr. Smith',
      labNotes: 'Elevated levels - medication adjustment recommended',
      results: {
        summary: 'Elevated HbA1c',
        details: 'HbA1c: 8.2% (Target: <7%)',
        abnormal: true
      },
      createdAt: '2025-09-05T09:45:00Z'
    },
    {
      id: 'LAB005',
      patientId: 'PAT005',
      patientName: 'Michael Brown',
      age: 67,
      gender: 'Male',
      requestDate: '2025-09-07',
      testType: 'Troponin I',
      category: 'Biochemistry',
      urgency: 'STAT',
      status: 'COMPLETED',
      clinicalHistory: 'Acute chest pain, rule out myocardial infarction',
      instructions: 'STAT collection and processing. Notify immediately if positive.',
      expectedDate: '2025-09-07',
      requestedBy: 'Dr. Smith',
      labNotes: 'CRITICAL: Elevated troponin levels - cardiology consulted',
      results: {
        summary: 'CRITICAL: Elevated Troponin',
        details: 'Troponin I: 2.5 ng/mL (Normal: <0.04 ng/mL)',
        abnormal: true,
        critical: true
      },
      createdAt: '2025-09-07T11:30:00Z'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'STAT':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'URGENT':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Routine':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'IN_PROGRESS':
        return <TestTube className="h-4 w-4 text-blue-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredRequests = labRequests.filter(request => {
    const matchesSearch = request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesUrgency = filterUrgency === 'all' || request.urgency === filterUrgency;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const pendingCount = labRequests.filter(r => r.status === 'PENDING').length;
  const urgentCount = labRequests.filter(r => r.urgency === 'URGENT' || r.urgency === 'STAT').length;
  const completedToday = labRequests.filter(r => 
    r.status === 'COMPLETED' && 
    new Date(r.requestDate).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lab Requests</h1>
          <p className="text-sm text-gray-600">Manage laboratory test requests and results</p>
        </div>
        <button
          onClick={() => setShowNewRequest(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Urgent/STAT</p>
              <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-green-600">{completedToday}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
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
              placeholder="Search by patient name, ID, test type, or request ID..."
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
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
            >
              <option value="all">All Urgency</option>
              <option value="STAT">STAT</option>
              <option value="URGENT">Urgent</option>
              <option value="Routine">Routine</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lab Requests Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden ${
              request.urgency === 'STAT' ? 'border-red-200 bg-red-50/30' : 
              request.urgency === 'URGENT' ? 'border-orange-200 bg-orange-50/30' : 
              'border-gray-200'
            }`}
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">
                      {request.patientName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{request.patientName}</h3>
                    <p className="text-sm text-gray-600">
                      {request.patientId} • {request.age}y {request.gender}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span>{request.status.replace('_', ' ')}</span>
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getUrgencyColor(request.urgency)}`}>
                    {request.urgency}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
              {/* Test Information */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{request.testType}</h4>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {request.category}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Request ID:</span> {request.id}</p>
                  <p><span className="font-medium">Requested by:</span> {request.requestedBy}</p>
                </div>
              </div>

              {/* Clinical History */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Clinical History</h4>
                <p className="text-sm text-gray-700">{request.clinicalHistory}</p>
              </div>

              {/* Instructions */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Instructions</h4>
                <p className="text-sm text-gray-700">{request.instructions}</p>
              </div>

              {/* Lab Notes */}
              {request.labNotes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Lab Notes</h4>
                  <p className={`text-sm ${request.results?.critical ? 'text-red-700 font-medium' : 'text-gray-700'}`}>
                    {request.labNotes}
                  </p>
                </div>
              )}

              {/* Results */}
              {request.results && (
                <div className={`p-3 rounded-lg ${request.results.critical ? 'bg-red-50 border border-red-200' : request.results.abnormal ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {request.results.critical ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : request.results.abnormal ? (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <h4 className={`text-sm font-medium ${request.results.critical ? 'text-red-900' : request.results.abnormal ? 'text-yellow-900' : 'text-green-900'}`}>
                      {request.results.summary}
                    </h4>
                  </div>
                  <p className={`text-sm ${request.results.critical ? 'text-red-800' : request.results.abnormal ? 'text-yellow-800' : 'text-green-800'}`}>
                    {request.results.details}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600">Requested</p>
                    <p className="font-medium">{new Date(request.requestDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600">Expected</p>
                    <p className="font-medium">{new Date(request.expectedDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors">
                    <Eye className="h-3 w-3" />
                    <span>View Details</span>
                  </button>
                  {request.status === 'COMPLETED' && request.results && (
                    <button className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-600 text-sm font-medium rounded-md hover:bg-green-100 transition-colors">
                      <TestTube className="h-3 w-3" />
                      <span>View Results</span>
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(request.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <TestTube className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lab requests found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' || filterUrgency !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'No lab requests have been created yet.'}
          </p>
        </div>
      )}

      {/* New Request Modal Placeholder */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Lab Request</h3>
            <p className="text-gray-600 mb-4">Lab request form will be implemented here.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewRequest(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
