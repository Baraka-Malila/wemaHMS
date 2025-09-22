'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Users,
  FileText,
  Calculator,
  Banknote,
  PieChart
} from 'lucide-react';
import RealTimeClock from '@/components/ui/RealTimeClock';
import auth from '@/lib/auth';

export default function FinanceDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Get current user data using auth manager
    const user = auth.getUser();
    if (user) {
      setCurrentUser(user);
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
  const todayStats = [
    {
      title: 'Total Revenue',
      value: 'TZS 847,500',
      change: '+12.5%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Bills Created',
      value: '23',
      change: '+3 from yesterday',
      changeType: 'increase',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Outstanding',
      value: 'TZS 125,000',
      change: '-8.2%',
      changeType: 'decrease',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Collections',
      value: 'TZS 722,500',
      change: '+15.3%',
      changeType: 'increase',
      icon: Banknote,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const revenueBreakdown = [
    { department: 'Doctor Consultation', amount: 385000, percentage: 45.5, color: '#059669' },
    { department: 'Pharmacy', amount: 254000, percentage: 30.0, color: '#1E40AF' },
    { department: 'Laboratory', amount: 135500, percentage: 16.0, color: '#7C3AED' },
    { department: 'Nursing/Ward', amount: 73000, percentage: 8.5, color: '#DC2626' }
  ];

  const paymentMethods = [
    { method: 'Cash', amount: 456000, percentage: 63.1, icon: Banknote },
    { method: 'Mobile Money', amount: 189500, percentage: 26.2, icon: CreditCard },
    { method: 'Bank Transfer', amount: 77000, percentage: 10.7, icon: TrendingUp }
  ];

  const pendingActions = [
    {
      id: 1,
      type: 'expense_approval',
      title: 'Medical Supplies Purchase',
      amount: 'TZS 125,000',
      status: 'Pending Approval',
      urgency: 'high',
      description: 'Emergency stock replenishment - surgical supplies',
      requestedBy: 'Dr. Sarah Johnson',
      date: '2024-09-07'
    },
    {
      id: 2,
      type: 'daily_balance',
      title: 'Close Daily Balance',
      amount: 'TZS 847,500',
      status: 'Ready to Close',
      urgency: 'medium',
      description: 'Daily financial reconciliation for Sep 7, 2024',
      requestedBy: 'System',
      date: '2024-09-07'
    },
    {
      id: 3,
      type: 'overdue_bill',
      title: 'Overdue Patient Bill',
      amount: 'TZS 45,000',
      status: 'Overdue',
      urgency: 'high',
      description: 'Patient PAT001 - Bill #BILL20240901001',
      requestedBy: 'Auto-Generated',
      date: '2024-09-01'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}, {currentUser?.first_name || 'Finance Manager'}!
            </h1>
            <p className="text-amber-100">Today's revenue: TZS 847,500 | Outstanding: TZS 125,000</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-lg p-4">
              <Calculator className="h-8 w-8 text-white mb-2" />
              <p className="text-sm text-amber-100">Current Time</p>
              <RealTimeClock className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Financial Overview</h2>
          <div className="flex items-center space-x-2">
            <label htmlFor="date-select" className="text-sm text-gray-600">View Date:</label>
            <input
              id="date-select"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {todayStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {stat.changeType === 'increase' ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <p className={`text-xs ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Department</h3>
          <div className="space-y-4">
            {revenueBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{item.department}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">TZS {item.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h3>
          <div className="space-y-4">
            {paymentMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{method.method}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">TZS {method.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{method.percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Pending Actions</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {pendingActions.filter(action => action.urgency === 'high').length} High Priority
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {pendingActions.map((action) => (
            <div key={action.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h4 className="text-lg font-medium text-gray-900">{action.title}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(action.urgency)}`}>
                    {action.urgency.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{action.amount}</p>
                  <p className="text-sm text-gray-500">{action.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-sm font-medium text-gray-900">{action.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requested by</p>
                  <p className="text-sm font-medium text-gray-900">{action.requestedBy}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700">{action.description}</p>
              </div>

              <div className="flex space-x-2">
                <button className="flex items-center space-x-1 px-3 py-2 bg-amber-50 text-amber-600 text-sm font-medium rounded-md hover:bg-amber-100 transition-colors">
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
                {action.type === 'expense_approval' && (
                  <>
                    <button className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-md hover:bg-green-100 transition-colors">
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-md hover:bg-red-100 transition-colors">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                {action.type === 'daily_balance' && (
                  <button className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors">
                    <Calculator className="h-4 w-4" />
                    <span>Close Balance</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {pendingActions.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
            <p className="mt-1 text-sm text-gray-500">No pending financial actions at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
