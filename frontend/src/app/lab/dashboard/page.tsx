'use client';

import { useState, useEffect } from 'react';
import { 
  TestTube, 
  ClipboardList, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Microscope,
  FlaskConical
} from 'lucide-react';

export default function LabDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get current user data
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Mock data - replace with API calls
  const stats = [
    {
      title: 'Pending Tests',
      value: '15',
      change: '3 urgent cases',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Completed Today',
      value: '23',
      change: '+8 from yesterday',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Critical Results',
      value: '2',
      change: 'Requires attention',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Processing Time',
      value: '45m',
      change: 'Average today',
      icon: TestTube,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  const testQueue = [
    {
      id: 'LAB001',
      patientId: 'PAT001',
      patientName: 'John Doe',
      testType: 'Complete Blood Count',
      priority: 'Routine',
      status: 'PENDING',
      requestedBy: 'Dr. Smith',
      requestTime: '09:30 AM',
      expectedTime: '2 hours',
      instructions: 'Fasting not required. Patient on medication.'
    },
    {
      id: 'LAB002',
      patientId: 'PAT002',
      patientName: 'Mary Johnson',
      testType: 'CT Scan Brain',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      requestedBy: 'Dr. Smith',
      requestTime: '10:15 AM',
      expectedTime: '1 hour',
      instructions: 'Patient allergic to iodine - use alternative contrast.'
    },
    {
      id: 'LAB003',
      patientId: 'PAT005',
      patientName: 'Michael Brown',
      testType: 'Troponin I',
      priority: 'STAT',
      status: 'COMPLETED',
      requestedBy: 'Dr. Smith',
      requestTime: '11:30 AM',
      expectedTime: '30 minutes',
      instructions: 'CRITICAL: Notify immediately if positive.',
      result: 'CRITICAL: Elevated levels - 2.5 ng/mL'
    },
    {
      id: 'LAB004',
      patientId: 'PAT003',
      patientName: 'David Smith',
      testType: 'Lipid Profile',
      priority: 'Routine',
      status: 'COMPLETED',
      requestedBy: 'Dr. Smith',
      requestTime: '08:45 AM',
      expectedTime: '3 hours',
      instructions: '12-hour fasting required.',
      result: 'Normal - All values within range'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'STAT':
        return 'text-red-600 bg-red-50';
      case 'URGENT':
        return 'text-orange-600 bg-orange-50';
      case 'Routine':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredTests = testQueue.filter(test => {
    const matchesSearch = test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || test.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}, {currentUser?.first_name || 'Lab Tech'}!
            </h1>
            <p className="text-blue-100">You have 15 pending tests and 2 critical results requiring attention.</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-lg p-4">
              <Microscope className="h-8 w-8 text-white mb-2" />
              <p className="text-sm text-blue-100">Current Time</p>
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

      {/* Test Queue Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Test Queue</h2>
              <p className="text-sm text-gray-600">Manage laboratory test requests and results</p>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-600 font-medium">2 Critical Results</span>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name, ID, test type, or lab ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Tests</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Test Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className={`bg-white rounded-lg border-2 p-4 ${
                  test.priority === 'STAT' ? 'border-red-200 bg-red-50/30' : 
                  test.priority === 'URGENT' ? 'border-orange-200 bg-orange-50/30' : 
                  'border-gray-200'
                }`}
              >
                {/* Test Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{test.testType}</h3>
                    <p className="text-sm text-gray-600">{test.patientName} • {test.patientId}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(test.status)}`}>
                      {test.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getPriorityColor(test.priority)}`}>
                      {test.priority}
                    </span>
                  </div>
                </div>

                {/* Test Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Lab ID:</span>
                    <span className="font-medium">{test.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Requested by:</span>
                    <span className="font-medium">{test.requestedBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Request time:</span>
                    <span className="font-medium">{test.requestTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Expected time:</span>
                    <span className="font-medium">{test.expectedTime}</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-700">
                    <span className="font-medium">Instructions:</span> {test.instructions}
                  </p>
                </div>

                {/* Result (if completed) */}
                {test.result && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    test.result.includes('CRITICAL') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {test.result.includes('CRITICAL') ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <p className={`text-sm font-medium ${
                        test.result.includes('CRITICAL') ? 'text-red-900' : 'text-green-900'
                      }`}>
                        Result: {test.result}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex space-x-2">
                  {test.status === 'PENDING' && (
                    <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                      <FlaskConical className="h-4 w-4" />
                      <span>Start Test</span>
                    </button>
                  )}
                  {test.status === 'IN_PROGRESS' && (
                    <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                      <ClipboardList className="h-4 w-4" />
                      <span>Enter Results</span>
                    </button>
                  )}
                  <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-12">
            <TestTube className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search criteria.' 
                : 'No tests in queue at the moment.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
