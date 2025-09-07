'use client';

import { useState } from 'react';
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

export default function PatientQueue() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Mock patient queue data
  const patientQueue = [
    {
      id: 'PAT001',
      name: 'John Doe',
      age: 35,
      gender: 'Male',
      phone: '+255 123 456 789',
      status: 'WAITING',
      priority: 'Normal',
      checkInTime: '09:30 AM',
      waitTime: '45 mins',
      complaint: 'Chest pain and shortness of breath for the past 2 days',
      lastVisit: '2 months ago',
      vitalSigns: {
        bloodPressure: '140/90',
        temperature: '37.2°C',
        pulse: '85 bpm'
      },
      allergies: 'Penicillin',
      medicalHistory: 'Hypertension, Diabetes'
    },
    {
      id: 'PAT002',
      name: 'Mary Johnson',
      age: 28,
      gender: 'Female',
      phone: '+255 987 654 321',
      status: 'URGENT',
      priority: 'High',
      checkInTime: '10:15 AM',
      waitTime: '20 mins',
      complaint: 'Severe headache with nausea and vomiting',
      lastVisit: 'First visit',
      vitalSigns: {
        bloodPressure: '160/100',
        temperature: '38.5°C',
        pulse: '95 bpm'
      },
      allergies: 'None known',
      medicalHistory: 'None'
    },
    {
      id: 'PAT003',
      name: 'David Smith',
      age: 42,
      gender: 'Male',
      phone: '+255 456 789 123',
      status: 'IN_PROGRESS',
      priority: 'Normal',
      checkInTime: '08:45 AM',
      waitTime: '1hr 30mins',
      complaint: 'Follow-up consultation for hypertension management',
      lastVisit: '1 week ago',
      vitalSigns: {
        bloodPressure: '130/85',
        temperature: '36.8°C',
        pulse: '72 bpm'
      },
      allergies: 'Aspirin',
      medicalHistory: 'Hypertension, High cholesterol'
    },
    {
      id: 'PAT004',
      name: 'Sarah Wilson',
      age: 55,
      gender: 'Female',
      phone: '+255 789 123 456',
      status: 'WAITING',
      priority: 'Normal',
      checkInTime: '11:00 AM',
      waitTime: '15 mins',
      complaint: 'Diabetes routine check-up and medication review',
      lastVisit: '3 weeks ago',
      vitalSigns: {
        bloodPressure: '125/80',
        temperature: '36.5°C',
        pulse: '78 bpm'
      },
      allergies: 'None known',
      medicalHistory: 'Type 2 Diabetes, Arthritis'
    },
    {
      id: 'PAT005',
      name: 'Michael Brown',
      age: 67,
      gender: 'Male',
      phone: '+255 321 654 987',
      status: 'URGENT',
      priority: 'High',
      checkInTime: '11:30 AM',
      waitTime: '5 mins',
      complaint: 'Acute chest pain with difficulty breathing',
      lastVisit: '6 months ago',
      vitalSigns: {
        bloodPressure: '180/110',
        temperature: '37.0°C',
        pulse: '110 bpm'
      },
      allergies: 'Sulfa drugs',
      medicalHistory: 'Coronary artery disease, Previous MI'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'URGENT':
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
      case 'High':
        return 'text-red-600 bg-red-50';
      case 'Normal':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredPatients = patientQueue.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.complaint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || patient.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const urgentCount = patientQueue.filter(p => p.priority === 'High').length;
  const waitingCount = patientQueue.filter(p => p.status === 'WAITING').length;

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
              patient.priority === 'High' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
            } overflow-hidden`}
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-green-600">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                    <p className="text-sm text-gray-600">
                      {patient.id} • {patient.age}y {patient.gender}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(patient.status)}`}>
                    {patient.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getPriorityColor(patient.priority)}`}>
                    {patient.priority} Priority
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
                  <span className="text-gray-600">Check-in: {patient.checkInTime}</span>
                </div>
                <span className="text-orange-600 font-medium">Wait: {patient.waitTime}</span>
              </div>

              {/* Chief Complaint */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Chief Complaint</h4>
                <p className="text-sm text-gray-700">{patient.complaint}</p>
              </div>

              {/* Vital Signs */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Vital Signs</h4>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">BP</p>
                    <p className="font-medium">{patient.vitalSigns.bloodPressure}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Temp</p>
                    <p className="font-medium">{patient.vitalSigns.temperature}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">Pulse</p>
                    <p className="font-medium">{patient.vitalSigns.pulse}</p>
                  </div>
                </div>
              </div>

              {/* Medical Info */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-600">Last Visit:</span>
                  <span className="ml-1 text-gray-900">{patient.lastVisit}</span>
                </div>
                <div>
                  <span className="text-gray-600">Allergies:</span>
                  <span className="ml-1 text-gray-900">{patient.allergies}</span>
                </div>
                <div>
                  <span className="text-gray-600">Medical History:</span>
                  <span className="ml-1 text-gray-900">{patient.medicalHistory}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Phone className="h-3 w-3" />
                <span>{patient.phone}</span>
              </div>
            </div>

            {/* Card Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                  <UserCheck className="h-4 w-4" />
                  <span>Start Consultation</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors">
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                  <FileText className="h-4 w-4" />
                  <span>History</span>
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
    </div>
  );
}
