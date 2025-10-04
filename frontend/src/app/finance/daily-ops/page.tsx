'use client';

import { useState, useEffect } from 'react';
import {
  Calculator,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  Users,
  TrendingUp,
  CreditCard,
  Banknote,
  Calendar,
  RefreshCw
} from 'lucide-react';
import auth from '@/lib/auth';

interface DailyBalance {
  date: string;
  totalRevenue: number;
  totalPayments: number;
  pendingPayments: number;
  paymentsCount: number;
  pendingCount: number;
}

export default function DailyOperations() {
  const [activeTab, setActiveTab] = useState('daily-balance');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [payments, setPayments] = useState<any[]>([]);
  const [dailyBalance, setDailyBalance] = useState<DailyBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPayments();
  }, [selectedDate]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const token = auth.getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Get all payments
      const response = await fetch(`${API_URL}/api/finance/payments/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const allPayments = data.payments || [];

        // Filter by selected date
        const datePayments = allPayments.filter((p: any) => {
          const paymentDate = new Date(p.created_at).toISOString().split('T')[0];
          return paymentDate === selectedDate;
        });

        setPayments(datePayments);

        // Calculate daily balance
        const totalRevenue = datePayments
          .filter((p: any) => p.status === 'PAID')
          .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

        const pendingAmount = datePayments
          .filter((p: any) => p.status === 'PENDING')
          .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

        setDailyBalance({
          date: selectedDate,
          totalRevenue,
          totalPayments: totalRevenue,
          pendingPayments: pendingAmount,
          paymentsCount: datePayments.filter((p: any) => p.status === 'PAID').length,
          pendingCount: datePayments.filter((p: any) => p.status === 'PENDING').length,
        });

        setError('');
      } else {
        setError('Failed to load payments');
      }
    } catch (error) {
      setError('Error loading payments');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  /* REMOVED MOCK DATA - NOW USING REAL API
  const dailyBalance_OLD_MOCK = {
    date: '2024-09-07',
    status: 'OPEN',
    totalRevenue: 847500,
    totalExpenses: 125000,
    netIncome: 722500,
    breakdown: {
      consultation: 385000,
      pharmacy: 254000,
      laboratory: 135500,
      nursing: 73000
    },
    collections: {
      cash: 456000,
      mobileMoney: 189500,
      bankTransfer: 77000,
      insurance: 125000
    },
    outstanding: 125000,
    billsCreated: 23,
    paymentsReceived: 18
  };
  */

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAID':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.service_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status?.toUpperCase() === filterStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  /* REMOVED OLD MOCK DATA
  const getExpenseStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBillStatusColor = (status: string) => {
    switch (status) {
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'DUE_SOON':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'OPEN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || expense.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredBills = outstandingBills.filter(bill => {
    const matchesSearch = bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || bill.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Operations</h1>
            <p className="text-gray-600 mt-1">Manage daily financial operations and reconciliation</p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('daily-balance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'daily-balance'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Daily Balance
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payments & Transactions
            </button>
          </nav>
        </div>

        {/* Daily Balance Tab */}
        {activeTab === 'daily-balance' && (
          <div className="p-6">
            {/* Balance Status */}
            <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-amber-200 bg-amber-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-amber-900">
                    Daily Balance - {new Date(selectedDate).toLocaleDateString()}
                  </h3>
                  <p className="text-amber-700">
                    {dailyBalance && `Payments: ${dailyBalance.paymentsCount} | Pending: ${dailyBalance.pendingCount}`}
                  </p>
                </div>
                <button
                  onClick={loadPayments}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <RefreshCw className="mx-auto h-12 w-12 text-amber-500 animate-spin mb-4" />
                <p className="text-gray-600">Loading financial data...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={loadPayments}
                  className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Summary Cards */}
            {!loading && dailyBalance && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Revenue (Paid)</p>
                      <p className="text-2xl font-bold text-green-900">TZS {dailyBalance.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-green-600 mt-1">{dailyBalance.paymentsCount} payments</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Pending Payments</p>
                      <p className="text-2xl font-bold text-yellow-900">TZS {dailyBalance.pendingPayments.toLocaleString()}</p>
                      <p className="text-xs text-yellow-600 mt-1">{dailyBalance.pendingCount} pending</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Transactions</p>
                      <p className="text-2xl font-bold text-blue-900">{payments.length}</p>
                      <p className="text-xs text-blue-600 mt-1">Today's activity</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="p-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors">
                <Plus className="h-4 w-4" />
                <span>New Expense</span>
              </button>
            </div>

            {/* Payments List */}
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{payment.service_type || 'Payment'}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPaymentStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">TZS {parseFloat(payment.amount).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Patient ID</p>
                      <p className="text-sm font-medium text-gray-900">{payment.patient_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="text-sm font-medium text-gray-900">{payment.payment_method || 'CASH'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reference</p>
                      <p className="text-sm font-medium text-gray-900">{payment.reference_id || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      ID: {payment.id?.substring(0, 8)}...
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      {payment.status === 'PENDING' && (
                        <button className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-md hover:bg-green-100 transition-colors">
                          <CheckCircle className="h-4 w-4" />
                          <span>Mark Paid</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {filteredPayments.length === 0 && !loading && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                  <p className="text-gray-600">
                    {searchTerm || filterStatus !== 'all'
                      ? 'Try adjusting your search criteria.'
                      : 'No payment records for this date.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
