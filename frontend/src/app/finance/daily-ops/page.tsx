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
  Calendar
} from 'lucide-react';

export default function DailyOperations() {
  const [activeTab, setActiveTab] = useState('daily-balance');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - replace with API calls
  const dailyBalance = {
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

  const expenses = [
    {
      id: 'EXP20240907001',
      category: 'Medical Supplies',
      description: 'Surgical instruments restocking',
      amount: 45000,
      status: 'APPROVED',
      requestedBy: 'Dr. Sarah Johnson',
      approvedBy: 'Admin',
      date: '2024-09-07',
      paymentMethod: 'BANK_TRANSFER',
      vendor: 'MedSupply Ltd'
    },
    {
      id: 'EXP20240907002',
      category: 'Utilities',
      description: 'Electricity bill - September 2024',
      amount: 35000,
      status: 'PENDING',
      requestedBy: 'Finance Dept',
      approvedBy: null,
      date: '2024-09-07',
      paymentMethod: 'CASH',
      vendor: 'TANESCO'
    },
    {
      id: 'EXP20240907003',
      category: 'Staff',
      description: 'Dr. Michael overtime payment',
      amount: 25000,
      status: 'PAID',
      requestedBy: 'HR Dept',
      approvedBy: 'Admin',
      date: '2024-09-06',
      paymentMethod: 'MOBILE_MONEY',
      vendor: 'Staff Payment'
    }
  ];

  const outstandingBills = [
    {
      id: 'BILL20240901001',
      patientId: 'PAT001',
      patientName: 'John Doe',
      amount: 45000,
      dueDate: '2024-09-05',
      daysPastDue: 2,
      status: 'OVERDUE',
      services: 'Consultation + Lab Tests',
      lastContact: '2024-09-06'
    },
    {
      id: 'BILL20240903002',
      patientId: 'PAT015',
      patientName: 'Mary Johnson',
      amount: 25000,
      dueDate: '2024-09-10',
      daysPastDue: 0,
      status: 'DUE_SOON',
      services: 'Pharmacy',
      lastContact: null
    },
    {
      id: 'BILL20240905003',
      patientId: 'PAT022',
      patientName: 'David Smith',
      amount: 55000,
      dueDate: '2024-09-12',
      daysPastDue: 0,
      status: 'OPEN',
      services: 'Ward + Consultation',
      lastContact: null
    }
  ];

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
              onClick={() => setActiveTab('expenses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'expenses'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('outstanding')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'outstanding'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Outstanding Bills
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
                  <p className="text-amber-700">Status: {dailyBalance.status} | Net Income: TZS {dailyBalance.netIncome.toLocaleString()}</p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors">
                  <Calculator className="h-4 w-4" />
                  <span>Close Balance</span>
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-900">TZS {dailyBalance.totalRevenue.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-900">TZS {dailyBalance.totalExpenses.toLocaleString()}</p>
                  </div>
                  <FileText className="h-8 w-8 text-red-600" />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Outstanding</p>
                    <p className="text-2xl font-bold text-blue-900">TZS {dailyBalance.outstanding.toLocaleString()}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Revenue & Collections Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Department</h4>
                <div className="space-y-3">
                  {Object.entries(dailyBalance.breakdown).map(([dept, amount]) => (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">{dept}</span>
                      <span className="text-sm font-semibold text-gray-900">TZS {(amount as number).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Collections by Method</h4>
                <div className="space-y-3">
                  {Object.entries(dailyBalance.collections).map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {method === 'cash' && <Banknote className="h-4 w-4 text-gray-400" />}
                        {method === 'mobileMoney' && <CreditCard className="h-4 w-4 text-gray-400" />}
                        {method === 'bankTransfer' && <TrendingUp className="h-4 w-4 text-gray-400" />}
                        {method === 'insurance' && <FileText className="h-4 w-4 text-gray-400" />}
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {method.replace(/([A-Z])/g, ' $1')}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">TZS {(amount as number).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="p-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
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
                  <option value="APPROVED">Approved</option>
                  <option value="PAID">Paid</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors">
                <Plus className="h-4 w-4" />
                <span>New Expense</span>
              </button>
            </div>

            {/* Expenses List */}
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{expense.description}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getExpenseStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">TZS {expense.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{expense.date}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="text-sm font-medium text-gray-900">{expense.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vendor</p>
                      <p className="text-sm font-medium text-gray-900">{expense.vendor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Method</p>
                      <p className="text-sm font-medium text-gray-900">{expense.paymentMethod.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      ID: {expense.id} | Requested by: {expense.requestedBy}
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      {expense.status === 'PENDING' && (
                        <button className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-md hover:bg-green-100 transition-colors">
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outstanding Bills Tab */}
        {activeTab === 'outstanding' && (
          <div className="p-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bills..."
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
                  <option value="all">All Bills</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="DUE_SOON">Due Soon</option>
                  <option value="OPEN">Open</option>
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
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getBillStatusColor(bill.status)}`}>
                        {bill.status.replace('_', ' ')}
                      </span>
                      {bill.daysPastDue > 0 && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          {bill.daysPastDue} days overdue
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">TZS {bill.amount.toLocaleString()}</p>
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
                      <p className="text-sm font-medium text-gray-900">{bill.services}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Contact</p>
                      <p className="text-sm font-medium text-gray-900">{bill.lastContact || 'None'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Bill ID: {bill.id}
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                        <Eye className="h-4 w-4" />
                        <span>View Bill</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors">
                        <Users className="h-4 w-4" />
                        <span>Contact Patient</span>
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
