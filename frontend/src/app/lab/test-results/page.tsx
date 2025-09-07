'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Calendar,
  User,
  TestTube
} from 'lucide-react';

export default function TestResults() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('today');

  // Mock data - replace with API calls
  const testResults = [
    {
      id: 'LAB001',
      patientId: 'PAT001',
      patientName: 'John Doe',
      testType: 'Complete Blood Count',
      status: 'COMPLETED',
      result: 'Normal',
      resultType: 'NORMAL',
      completedDate: '2024-01-15',
      completedTime: '14:30',
      requestedBy: 'Dr. Smith',
      technicianName: 'Sarah Johnson',
      reportUrl: '/reports/lab001.pdf',
      criticalValues: [],
      notes: 'All parameters within normal range. Patient can continue current medication.'
    },
    {
      id: 'LAB002',
      patientId: 'PAT002',
      patientName: 'Mary Johnson',
      testType: 'Troponin I',
      status: 'COMPLETED',
      result: 'CRITICAL - Elevated',
      resultType: 'CRITICAL',
      completedDate: '2024-01-15',
      completedTime: '11:45',
      requestedBy: 'Dr. Smith',
      technicianName: 'Michael Chen',
      reportUrl: '/reports/lab002.pdf',
      criticalValues: ['Troponin I: 2.5 ng/mL (Normal: <0.04 ng/mL)'],
      notes: 'URGENT: Significantly elevated troponin levels indicate cardiac injury. Immediate cardiology consultation required.'
    },
    {
      id: 'LAB003',
      patientId: 'PAT003',
      patientName: 'David Smith',
      testType: 'Lipid Profile',
      status: 'COMPLETED',
      result: 'Abnormal - High Cholesterol',
      resultType: 'ABNORMAL',
      completedDate: '2024-01-15',
      completedTime: '09:15',
      requestedBy: 'Dr. Smith',
      technicianName: 'Sarah Johnson',
      reportUrl: '/reports/lab003.pdf',
      criticalValues: ['Total Cholesterol: 285 mg/dL (Normal: <200 mg/dL)', 'LDL: 195 mg/dL (Normal: <100 mg/dL)'],
      notes: 'Elevated cholesterol levels. Recommend dietary modifications and statin therapy consideration.'
    },
    {
      id: 'LAB004',
      patientId: 'PAT004',
      patientName: 'Lisa Brown',
      testType: 'HbA1c',
      status: 'COMPLETED',
      result: 'Borderline',
      resultType: 'ABNORMAL',
      completedDate: '2024-01-15',
      completedTime: '08:30',
      requestedBy: 'Dr. Smith',
      technicianName: 'Michael Chen',
      reportUrl: '/reports/lab004.pdf',
      criticalValues: ['HbA1c: 6.2% (Normal: <5.7%)'],
      notes: 'Prediabetic range. Recommend lifestyle modifications and glucose monitoring.'
    },
    {
      id: 'LAB005',
      patientId: 'PAT005',
      patientName: 'Robert Wilson',
      testType: 'CT Scan Brain',
      status: 'COMPLETED',
      result: 'Normal',
      resultType: 'NORMAL',
      completedDate: '2024-01-15',
      completedTime: '16:20',
      requestedBy: 'Dr. Smith',
      technicianName: 'Dr. Martinez',
      reportUrl: '/reports/lab005.pdf',
      criticalValues: [],
      notes: 'No acute intracranial abnormalities. Brain parenchyma appears normal for age.'
    }
  ];

  const getResultColor = (resultType: string) => {
    switch (resultType) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ABNORMAL':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NORMAL':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResultIcon = (resultType: string) => {
    switch (resultType) {
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'ABNORMAL':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'NORMAL':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredResults = testResults.filter(result => {
    const matchesSearch = result.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || result.resultType === filterStatus;
    const matchesType = filterType === 'all' || result.testType.toLowerCase().includes(filterType.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = [
    {
      title: 'Total Results Today',
      value: testResults.length.toString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Critical Results',
      value: testResults.filter(r => r.resultType === 'CRITICAL').length.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Normal Results',
      value: testResults.filter(r => r.resultType === 'NORMAL').length.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Review',
      value: '2',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
            <p className="text-gray-600 mt-1">View and manage laboratory test results</p>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-600 font-medium">
              {testResults.filter(r => r.resultType === 'CRITICAL').length} Critical Results
            </span>
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
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search results..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Results</option>
              <option value="CRITICAL">Critical</option>
              <option value="ABNORMAL">Abnormal</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>

          {/* Test Type Filter */}
          <div>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Test Types</option>
              <option value="blood">Blood Tests</option>
              <option value="imaging">Imaging</option>
              <option value="chemistry">Chemistry</option>
              <option value="hematology">Hematology</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Test Results ({filteredResults.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredResults.map((result) => (
            <div key={result.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getResultColor(result.resultType)}`}>
                    <div className="flex items-center space-x-1">
                      {getResultIcon(result.resultType)}
                      <span>{result.resultType}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{result.testType}</h3>
                </div>
                <div className="text-sm text-gray-500">
                  {result.completedDate} at {result.completedTime}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{result.patientName}</p>
                    <p className="text-xs text-gray-500">{result.patientId}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requested by</p>
                  <p className="text-sm font-medium text-gray-900">{result.requestedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Technician</p>
                  <p className="text-sm font-medium text-gray-900">{result.technicianName}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Result Summary</p>
                <p className={`text-sm ${
                  result.resultType === 'CRITICAL' ? 'text-red-700' :
                  result.resultType === 'ABNORMAL' ? 'text-orange-700' :
                  'text-green-700'
                }`}>
                  {result.result}
                </p>
              </div>

              {result.criticalValues.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-900 mb-2">Critical/Abnormal Values</p>
                  <ul className="text-sm text-red-800 space-y-1">
                    {result.criticalValues.map((value, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        <span>{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-1">Clinical Notes</p>
                <p className="text-sm text-gray-700">{result.notes}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Lab ID: {result.id}
                </div>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors">
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-md hover:bg-green-100 transition-colors">
                    <Download className="h-4 w-4" />
                    <span>Download Report</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <TestTube className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search criteria.' 
                : 'No test results available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
