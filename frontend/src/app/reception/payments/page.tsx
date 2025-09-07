'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard,
  DollarSign,
  Receipt,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Printer,
  Eye,
  Edit,
  Users,
  Calculator,
  Banknote,
  Smartphone
} from 'lucide-react';

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('process-payment');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // Mock data - replace with API calls
  const pendingBills = [
    {
      id: 'BILL20240907001',
      patientId: 'PAT001',
      patientName: 'John Doe',
      services: ['Consultation', 'Lab Tests'],
      totalAmount: 45000,
      amountPaid: 0,
      balance: 45000,
      dueDate: '2024-09-07',
      status: 'PENDING',
      createdBy: 'Dr. Sarah Johnson',
      createdAt: '2024-09-07 10:30:00'
    },
    {
      id: 'BILL20240907002',
      patientId: 'PAT002',
      patientName: 'Mary Johnson',
      services: ['Pharmacy'],
      totalAmount: 25000,
      amountPaid: 15000,
      balance: 10000,
      dueDate: '2024-09-07',
      status: 'PARTIAL',
      createdBy: 'Pharmacy',
      createdAt: '2024-09-07 09:15:00'
    },
    {
      id: 'BILL20240907003',
      patientId: 'PAT003',
      patientName: 'David Smith',
      services: ['Ward Services', 'Nursing Care'],
      totalAmount: 85000,
      amountPaid: 0,
      balance: 85000,
      dueDate: '2024-09-08',
      status: 'PENDING',
      createdBy: 'Ward A',
      createdAt: '2024-09-07 08:45:00'
    }
  ];

  const recentPayments = [
    {
      id: 'PAY20240907001',
      billId: 'BILL20240906005',
      patientName: 'Alice Brown',
      amount: 35000,
      method: 'MOBILE_MONEY',
      reference: 'MM123456789',
      processedBy: 'Reception',
      processedAt: '2024-09-07 11:45:00',
      status: 'COMPLETED'
    },
    {
      id: 'PAY20240907002',
      billId: 'BILL20240906008',
      patientName: 'Robert Wilson',
      amount: 22000,
      method: 'CASH',
      reference: 'CASH001',
      processedBy: 'Reception',
      processedAt: '2024-09-07 10:20:00',
      status: 'COMPLETED'
    }
  ];

  const todayStats = {
    totalCollected: 125000,
    totalPending: 180000,
    paymentsProcessed: 15,
    pendingBills: 8,
    byMethod: {
      cash: 45000,
      mobileMoney: 52000,
      bankTransfer: 18000,
      insurance: 10000
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PARTIAL':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return <Banknote className="h-4 w-4" />;
      case 'MOBILE_MONEY':
        return <Smartphone className="h-4 w-4" />;
      case 'BANK_TRANSFER':
        return <CreditCard className="h-4 w-4" />;
      case 'INSURANCE':
        return <Receipt className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const filteredBills = pendingBills.filter(bill => {
    const matchesSearch = bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || bill.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Processing</h1>
            <p className="text-gray-600 mt-1">Process payments, manage bills, and track collections</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              <span>New Bill</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
              <Calculator className="h-4 w-4" />
              <span>Daily Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Collections</p>
              <p className="text-2xl font-bold text-green-600">TZS {todayStats.totalCollected.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-orange-600">TZS {todayStats.totalPending.toLocaleString()}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Payments Processed</p>
              <p className="text-2xl font-bold text-blue-600">{todayStats.paymentsProcessed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Bills</p>
              <p className="text-2xl font-bold text-red-600">{todayStats.pendingBills}</p>
            </div>
            <Receipt className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('process-payment')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'process-payment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Process Payment
            </button>
            <button
              onClick={() => setActiveTab('pending-bills')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending-bills'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Bills
            </button>
            <button
              onClick={() => setActiveTab('recent-payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recent-payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recent Payments
            </button>
          </nav>
        </div>

        {/* Process Payment Tab */}
        {activeTab === 'process-payment' && (
          <div className="p-6">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Process New Payment</h3>
              
              <div className="space-y-6">
                {/* Patient Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
                    <input
                      type="text"
                      placeholder="Enter Patient ID"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                    <input
                      type="text"
                      placeholder="Auto-filled"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
                      disabled
                    />
                  </div>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="CASH">Cash</option>
                      <option value="MOBILE_MONEY">Mobile Money</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="INSURANCE">Insurance</option>
                    </select>
                  </div>
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                  <input
                    type="text"
                    placeholder="Enter reference number (for non-cash payments)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Additional notes about the payment"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                {/* Actions */}
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    <CreditCard className="h-4 w-4" />
                    <span>Process Payment</span>
                  </button>
                  <button className="flex items-center space-x-2 px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    <Receipt className="h-4 w-4" />
                    <span>Generate Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Bills Tab */}
        {activeTab === 'pending-bills' && (
          <div className="p-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bills..."
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
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
            </div>

            {/* Bills List */}
            <div className="space-y-4">
              {filteredBills.map((bill) => (
                <div key={bill.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{bill.patientName}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">TZS {bill.balance.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Due: {bill.dueDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Patient ID</p>
                      <p className="text-sm font-medium text-gray-900">{bill.patientId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Services</p>
                      <p className="text-sm font-medium text-gray-900">{bill.services.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created By</p>
                      <p className="text-sm font-medium text-gray-900">{bill.createdBy}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Bill ID: {bill.id} | Total: TZS {bill.totalAmount.toLocaleString()} | Paid: TZS {bill.amountPaid.toLocaleString()}
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors">
                        <CreditCard className="h-4 w-4" />
                        <span>Collect Payment</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-md hover:bg-green-100 transition-colors">
                        <Printer className="h-4 w-4" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Payments Tab */}
        {activeTab === 'recent-payments' && (
          <div className="p-6">
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{payment.patientName}</h4>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {payment.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">TZS {payment.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{new Date(payment.processedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(payment.method)}
                        <span className="text-sm font-medium text-gray-900">{payment.method.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reference</p>
                      <p className="text-sm font-medium text-gray-900">{payment.reference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bill ID</p>
                      <p className="text-sm font-medium text-gray-900">{payment.billId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Processed By</p>
                      <p className="text-sm font-medium text-gray-900">{payment.processedBy}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Payment ID: {payment.id}
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                        <Eye className="h-4 w-4" />
                        <span>View Receipt</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors">
                        <Printer className="h-4 w-4" />
                        <span>Print Receipt</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
