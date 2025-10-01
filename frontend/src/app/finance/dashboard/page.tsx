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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    paidCount: 0,
    pendingCount: 0
  });
  const [revenueByService, setRevenueByService] = useState<any[]>([]);
  const [revenueByMethod, setRevenueByMethod] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    // Get current user data using auth manager
    const user = auth.getUser();
    if (user) {
      setCurrentUser(user);
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = auth.getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Fetch paid payments for the selected date
      const paidResponse = await fetch(
        `${API_URL}/api/finance/payments/?status=PAID&date=${selectedDate}`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      // Fetch pending payments
      const pendingResponse = await fetch(
        `${API_URL}/api/finance/payments/?status=PENDING`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (paidResponse.ok && pendingResponse.ok) {
        const paidData = await paidResponse.json();
        const pendingData = await pendingResponse.json();

        const paidPayments = Array.isArray(paidData) ? paidData : [];
        const pendingPayments = Array.isArray(pendingData) ? pendingData : [];

        // Calculate totals
        const totalPaid = paidPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);
        const totalPending = pendingPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || 0), 0);

        setStats({
          totalRevenue: totalPaid,
          totalPaid: totalPaid,
          totalPending: totalPending,
          paidCount: paidPayments.length,
          pendingCount: pendingPayments.length
        });

        // Group by service type
        const serviceGroups: any = {};
        paidPayments.forEach((payment: any) => {
          const service = payment.service_type || 'OTHER';
          if (!serviceGroups[service]) {
            serviceGroups[service] = { amount: 0, count: 0 };
          }
          serviceGroups[service].amount += parseFloat(payment.amount || 0);
          serviceGroups[service].count += 1;
        });

        const serviceArray = Object.entries(serviceGroups).map(([name, data]: [string, any]) => ({
          department: name.replace('_', ' '),
          amount: data.amount,
          percentage: totalPaid > 0 ? ((data.amount / totalPaid) * 100).toFixed(1) : 0,
          color: getServiceColor(name)
        }));
        setRevenueByService(serviceArray);

        // Group by payment method
        const methodGroups: any = {};
        paidPayments.forEach((payment: any) => {
          const method = payment.payment_method || 'CASH';
          if (!methodGroups[method]) {
            methodGroups[method] = { amount: 0, count: 0 };
          }
          methodGroups[method].amount += parseFloat(payment.amount || 0);
          methodGroups[method].count += 1;
        });

        const methodArray = Object.entries(methodGroups).map(([name, data]: [string, any]) => ({
          method: name.replace('_', ' '),
          amount: data.amount,
          percentage: totalPaid > 0 ? ((data.amount / totalPaid) * 100).toFixed(1) : 0,
          icon: getMethodIcon(name)
        }));
        setRevenueByMethod(methodArray);

        // Store pending payments for display
        setPendingPayments(pendingPayments.slice(0, 5)); // Show top 5
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceColor = (serviceType: string) => {
    const colors: any = {
      'CONSULTATION': '#059669',
      'MEDICATION': '#1E40AF',
      'LAB_TEST': '#7C3AED',
      'FILE_FEE': '#DC2626',
      'OTHER': '#6B7280'
    };
    return colors[serviceType] || '#6B7280';
  };

  const getMethodIcon = (method: string) => {
    const icons: any = {
      'CASH': Banknote,
      'MOBILE_MONEY': CreditCard,
      'BANK_TRANSFER': TrendingUp,
      'NHIF': Users,
      'CREDIT': Clock
    };
    return icons[method] || Banknote;
  };

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Dynamic stats based on real data
  const todayStats = [
    {
      title: 'Total Revenue',
      value: loading ? 'Loading...' : `TZS ${stats.totalRevenue.toLocaleString()}`,
      change: `${stats.paidCount} payments`,
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Payments Collected',
      value: loading ? 'Loading...' : stats.paidCount.toString(),
      change: 'Completed today',
      changeType: 'increase',
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending Payments',
      value: loading ? 'Loading...' : `TZS ${stats.totalPending.toLocaleString()}`,
      change: `${stats.pendingCount} awaiting`,
      changeType: 'decrease',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Collections',
      value: loading ? 'Loading...' : `TZS ${stats.totalPaid.toLocaleString()}`,
      change: 'All methods',
      changeType: 'increase',
      icon: Banknote,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const getServiceTypeBadge = (serviceType: string) => {
    const badges: any = {
      'CONSULTATION': { color: 'bg-green-100 text-green-800', icon: Users },
      'LAB_TEST': { color: 'bg-purple-100 text-purple-800', icon: FileText },
      'MEDICATION': { color: 'bg-blue-100 text-blue-800', icon: CreditCard },
      'FILE_FEE': { color: 'bg-amber-100 text-amber-800', icon: DollarSign },
      'OTHER': { color: 'bg-gray-100 text-gray-800', icon: FileText }
    };
    return badges[serviceType] || badges['OTHER'];
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
            <p className="text-amber-100">
              Today's revenue: TZS {stats.totalRevenue.toLocaleString()} |
              Pending: TZS {stats.totalPending.toLocaleString()}
            </p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Service Type</h3>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading revenue data...</div>
          ) : revenueByService.length > 0 ? (
            <div className="space-y-4">
              {revenueByService.map((item, index) => (
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
          ) : (
            <div className="text-center py-8 text-gray-500">No revenue data for selected date</div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Methods</h3>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading payment methods...</div>
          ) : revenueByMethod.length > 0 ? (
            <div className="space-y-4">
              {revenueByMethod.map((method, index) => {
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
          ) : (
            <div className="text-center py-8 text-gray-500">No payment data for selected date</div>
          )}
        </div>
      </div>

      {/* Pending Payments Queue */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Pending Payments Queue</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {pendingPayments.length} Awaiting Approval
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <Clock className="mx-auto h-12 w-12 text-gray-400 animate-spin mb-3" />
              <p className="text-sm">Loading pending payments...</p>
            </div>
          ) : pendingPayments.length > 0 ? (
            pendingPayments.map((payment) => {
              const badge = getServiceTypeBadge(payment.service_type);
              const BadgeIcon = badge.icon;

              return (
                <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <BadgeIcon className="h-8 w-8 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{payment.service_name}</h4>
                        <p className="text-sm text-gray-600">Patient: {payment.patient_name} ({payment.patient_id})</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">TZS {parseFloat(payment.amount).toLocaleString()}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${badge.color}`}>
                        {payment.service_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">Payment Method</p>
                      <p className="font-medium text-gray-900">{payment.payment_method || 'CASH'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-medium text-orange-600">PENDING</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Created</p>
                      <p className="font-medium text-gray-900">
                        {new Date(payment.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Reference</p>
                      <p className="font-medium text-gray-900">{payment.reference_id ? `#${payment.reference_id.slice(0, 8)}` : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <a
                      href="/finance/payment-history"
                      className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-md hover:from-amber-600 hover:to-orange-700 transition-all"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Process Payment</span>
                    </a>
                    <button className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">All payments processed!</h3>
              <p className="mt-1 text-sm text-gray-500">No pending payments at the moment.</p>
            </div>
          )}
        </div>

        {pendingPayments.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <a
              href="/finance/payment-history"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center justify-center"
            >
              View all pending payments →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
