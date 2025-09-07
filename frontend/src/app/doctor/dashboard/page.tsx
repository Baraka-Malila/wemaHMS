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
  UserCheck
} from 'lucide-react';

export default function DoctorDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with API calls
  const stats = [
    {
      title: 'Patients Today',
      value: '12',
      change: '+3 from yesterday',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Diagnoses',
      value: '5',
      change: '2 urgent cases',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Lab Requests',
      value: '8',
      change: '3 results pending',
      icon: TestTube,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Prescriptions',
      value: '15',
      change: 'Today\'s total',
      icon: Pill,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const patientQueue = [
    {
      id: 'PAT001',
      name: 'John Doe',
      age: 35,
      gender: 'Male',
      status: 'WAITING',
      priority: 'Normal',
      checkInTime: '09:30 AM',
      complaint: 'Chest pain and shortness of breath',
      lastVisit: '2 months ago'
    },
    {
      id: 'PAT002',
      name: 'Mary Johnson',
      age: 28,
      gender: 'Female',
      status: 'URGENT',
      priority: 'High',
      checkInTime: '10:15 AM',
      complaint: 'Severe headache with nausea',
      lastVisit: 'First visit'
    },
    {
      id: 'PAT003',
      name: 'David Smith',
      age: 42,
      gender: 'Male',
      status: 'IN_PROGRESS',
      priority: 'Normal',
      checkInTime: '08:45 AM',
      complaint: 'Follow-up hypertension check',
      lastVisit: '1 week ago'
    },
    {
      id: 'PAT004',
      name: 'Sarah Wilson',
      age: 55,
      gender: 'Female',
      status: 'WAITING',
      priority: 'Normal',
      checkInTime: '11:00 AM',
      complaint: 'Diabetes consultation',
      lastVisit: '3 weeks ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'WAITING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600';
      case 'Normal':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredPatients = patientQueue.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.complaint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Good Morning, Doctor!</h1>
            <p className="text-green-100">You have 5 patients waiting and 3 urgent cases requiring attention.</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-lg p-4">
              <Clock className="h-8 w-8 text-white mb-2" />
              <p className="text-sm text-green-100">Current Time</p>
              <p className="text-xl font-semibold">{new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</p>
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
              <span className="text-sm text-red-600 font-medium">2 Urgent Cases</span>
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
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">
                          {patient.id} • {patient.age}y {patient.gender}
                        </div>
                        <div className="text-xs text-gray-400">Last visit: {patient.lastVisit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                        {patient.status.replace('_', ' ')}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(patient.priority)}`}>
                        {patient.priority} Priority
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {patient.complaint}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.checkInTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-900 flex items-center space-x-1">
                        <UserCheck className="h-4 w-4" />
                        <span>Consult</span>
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
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
    </div>
  );
}
