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
import RealTimeClock from '@/components/ui/RealTimeClock';
import auth from '@/lib/auth';

export default function LabDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [testQueue, setTestQueue] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    completedToday: 0,
    critical: 0,
    avgProcessingTime: '0m'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get current user data using auth manager
    const user = auth.getUser();
    if (user) {
      setCurrentUser(user);
    }
    loadLabQueue();
  }, []);

  const loadLabQueue = async () => {
    try {
      setLoading(true);
      const token = auth.getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(`${API_URL}/api/lab/patients/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const queue = data.patients_queue || [];

        // Add status field (API doesn't return it - all items are PENDING)
        const queueWithStatus = queue.map((item: any) => ({
          ...item,
          status: 'PENDING',
          id: item.request_id
        }));

        setTestQueue(queueWithStatus);

        // Calculate stats from real data
        const pending = queueWithStatus.length;
        const critical = queue.filter((t: any) =>
          t.priority?.toUpperCase() === 'URGENT' ||
          t.priority?.toUpperCase() === 'STAT' ||
          t.priority?.toUpperCase() === 'EMERGENCY'
        ).length;

        setStats({
          pending,
          completedToday: 0, // TODO: Get from results API
          critical,
          avgProcessingTime: '45m' // TODO: Calculate from actual data
        });
        setError('');
      } else {
        setError('Failed to load lab queue');
      }
    } catch (error) {
      setError('Error loading lab queue');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statsDisplay = [
    {
      title: 'Pending Tests',
      value: stats.pending.toString(),
      change: `${stats.critical} urgent cases`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Completed Today',
      value: stats.completedToday.toString(),
      change: 'Tests completed',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Critical Results',
      value: stats.critical.toString(),
      change: 'Requires attention',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Processing Time',
      value: stats.avgProcessingTime,
      change: 'Average today',
      icon: TestTube,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  const filteredQueue = testQueue.filter(test => {
    const matchesSearch = test.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.test_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'STAT':
      case 'EMERGENCY':
        return 'text-red-600 bg-red-50';
      case 'URGENT':
      case 'HIGH':
        return 'text-orange-600 bg-orange-50';
      case 'ROUTINE':
      case 'NORMAL':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

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
              <RealTimeClock className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadLabQueue}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsDisplay.map((stat, index) => {
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

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center">
            <div className="text-gray-500">Loading lab queue...</div>
          </div>
        )}

        {/* Test Cards */}
        {!loading && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredQueue.map((test) => (
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
                    <h3 className="text-lg font-semibold text-gray-900">{test.test_type || 'Lab Test'}</h3>
                    <p className="text-sm text-gray-600">{test.patient_name} • {test.patient_id}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(test.status)}`}>
                      {test.status?.replace('_', ' ') || 'PENDING'}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getPriorityColor(test.priority)}`}>
                      {test.priority || 'NORMAL'}
                    </span>
                  </div>
                </div>

                {/* Test Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Request ID:</span>
                    <span className="font-medium">{test.request_id?.substring(0, 8)}...</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Requested by:</span>
                    <span className="font-medium">{test.requested_by}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Request time:</span>
                    <span className="font-medium">{test.requested_at ? new Date(test.requested_at).toLocaleTimeString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Patient ID:</span>
                    <span className="font-medium">{test.patient_id}</span>
                  </div>
                </div>

                {/* Instructions */}
                {test.instructions && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Instructions:</span> {test.instructions}
                    </p>
                  </div>
                )}

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
                    <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-800 text-white text-sm font-medium rounded-md hover:bg-blue-900 transition-colors">
                      <FlaskConical className="h-4 w-4" />
                      <span>Start Test</span>
                    </button>
                  )}
                  {test.status === 'IN_PROGRESS' && (
                    <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-700 text-white text-sm font-medium rounded-md hover:bg-green-800 transition-colors">
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
        )}

        {filteredQueue.length === 0 && !loading && (
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
