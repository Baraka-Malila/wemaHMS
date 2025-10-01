'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  FileText,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  User
} from 'lucide-react';
import RealTimeClock from '@/components/ui/RealTimeClock';
import auth from '@/lib/auth';

interface Payment {
  id: string;
  patient_id: string;
  patient_name: string;
  service_type: string;
  service_name: string;
  reference_id: string;
  amount: number;
  payment_method: string;
  status: string;
  payment_date: string;
  created_at: string;
  processed_by: string;  // UUID string
  processed_by_name?: string;  // Full name from backend
  receipt_number: string;
}

export default function PaymentHistory() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState(''); // Empty = show all dates (no filter)
  const [patientFilter, setPatientFilter] = useState('');
  const [expandedPatients, setExpandedPatients] = useState<Set<string>>(new Set());

  const loadPaymentHistory = async () => {
    try {
      // Don't show loading spinner on refresh (only on initial load)
      if (payments.length === 0) {
        setLoading(true);
      }
      const token = auth.getToken();

      // Fetch all PAID payments with pagination
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/finance/payments/?status=PAID&page_size=1000`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Handle paginated response (DRF pagination wraps data in "results")
        const paymentsArray = Array.isArray(data) ? data : (data.results || []);
        
        // Only log on initial load or if count changed
        if (payments.length === 0 || payments.length !== paymentsArray.length) {
          console.log('💰 Loaded payment history:', {
            total: paymentsArray.length,
            previousCount: payments.length
          });
        }
        
        setPayments(paymentsArray);
      } else {
        console.error('❌ Failed to load payments:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentHistory();
    // Refresh every 30 seconds (reduced from 10) - less aggressive polling
    const interval = setInterval(loadPaymentHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...payments];

    // Search filter (patient ID or name)
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Service type filter
    if (serviceFilter !== 'ALL') {
      filtered = filtered.filter(p => p.service_type === serviceFilter);
    }

    // Patient filter
    if (patientFilter) {
      filtered = filtered.filter(p =>
        p.patient_id.toLowerCase().includes(patientFilter.toLowerCase())
      );
    }

    // Date filter (if specific date selected)
    if (dateFilter) {
      filtered = filtered.filter(p => {
        const paymentDate = new Date(p.payment_date).toISOString().split('T')[0];
        return paymentDate === dateFilter;
      });
    }

    setFilteredPayments(filtered);
  }, [searchTerm, serviceFilter, patientFilter, dateFilter, payments]);

  const getServiceBadgeColor = (serviceType: string) => {
    const colors: any = {
      'CONSULTATION': 'bg-green-100 text-green-800',
      'LAB_TEST': 'bg-purple-100 text-purple-800',
      'MEDICATION': 'bg-blue-100 text-blue-800',
      'FILE_FEE': 'bg-amber-100 text-amber-800',
      'OTHER': 'bg-gray-100 text-gray-800'
    };
    return colors[serviceType] || colors['OTHER'];
  };

  const totalAmount = filteredPayments.reduce((sum, p) => sum + parseFloat(String(p.amount || '0')), 0);

  // Group by patient
  const paymentsByPatient = filteredPayments.reduce((acc: any, payment) => {
    if (!acc[payment.patient_id]) {
      acc[payment.patient_id] = {
        patient_name: payment.patient_name,
        patient_id: payment.patient_id,
        payments: [],
        total: 0
      };
    }
    acc[payment.patient_id].payments.push(payment);
    acc[payment.patient_id].total += parseFloat(String(payment.amount || '0'));
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-grow">
            <h1 className="text-2xl font-bold mb-2">Payment History & Transactions</h1>
            <div className="flex items-center gap-6">
              <p className="text-amber-100">
                {filteredPayments.length} transaction{filteredPayments.length !== 1 ? 's' : ''}
                {dateFilter ? ` on ${dateFilter}` : ' (All Time)'}
              </p>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <DollarSign className="h-5 w-5" />
                <div>
                  <p className="text-xs text-amber-100">
                    {dateFilter ? `Total for ${dateFilter}` : 'Total (All Time)'}
                  </p>
                  <p className="text-lg font-bold">TZS {totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm text-amber-100">Current Time</p>
              <RealTimeClock className="text-white font-semibold text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Patient ID, Name, Receipt #"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Service Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 appearance-none"
              >
                <option value="ALL">All Services</option>
                <option value="CONSULTATION">Consultation</option>
                <option value="LAB_TEST">Lab Test</option>
                <option value="MEDICATION">Medication</option>
                <option value="FILE_FEE">File Fee</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Patient Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g., PAT123"
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setSearchTerm('');
                setServiceFilter('ALL');
                setDateFilter(''); // Clear date filter to show all payments
                setPatientFilter('');
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
            <button 
              onClick={() => {
                setDateFilter(new Date().toISOString().split('T')[0]); // Set to today
              }}
              className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Today Only
            </button>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Transactions - {dateFilter ? dateFilter.split('-').reverse().join('/') : 'All Dates'}
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-3"></div>
            <p className="text-sm">Loading payment history...</p>
          </div>
        ) : Object.keys(paymentsByPatient).length > 0 ? (
          <div className="divide-y divide-gray-200">
            {Object.values(paymentsByPatient).map((patientData: any) => {
              const isExpanded = expandedPatients.has(patientData.patient_id);
              return (
                <div key={patientData.patient_id}>
                  {/* Patient Summary Row */}
                  <div
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      const newExpanded = new Set(expandedPatients);
                      if (isExpanded) {
                        newExpanded.delete(patientData.patient_id);
                      } else {
                        newExpanded.add(patientData.patient_id);
                      }
                      setExpandedPatients(newExpanded);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-amber-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">{patientData.patient_name}</h4>
                          <p className="text-sm text-gray-500">{patientData.patient_id}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Payments</p>
                          <p className="text-base font-semibold text-gray-900">{patientData.payments.length}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Services</p>
                          <p className="text-base font-medium text-gray-900">
                            {[...new Set(patientData.payments.map((p: Payment) => p.service_type))].length}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total Amount</p>
                          <p className="text-lg font-bold text-amber-600">
                            TZS {patientData.total.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <svg
                            className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Payment Details */}
                  {isExpanded && (
                    <div className="bg-gray-50 px-6 py-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Processed By</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {patientData.payments.map((payment: Payment) => (
                              <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(payment.payment_date).toLocaleTimeString()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">
                                  {payment.receipt_number || 'N/A'}
                                </td>
                                <td className="px-4 py-3">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{payment.service_name}</div>
                                    <span className={`inline-flex mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getServiceBadgeColor(payment.service_type)}`}>
                                      {payment.service_type.replace('_', ' ')}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                  TZS {parseFloat(payment.amount.toString()).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {payment.payment_method}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {payment.processed_by_name || 'System'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {payments.length === 0 
                ? 'No PAID transactions in the system yet. File fees and other payments will appear here once processed.'
                : 'Try clearing filters to see all transactions, or adjust your search criteria.'}
            </p>
            {payments.length > 0 && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setServiceFilter('ALL');
                  setDateFilter(new Date().toISOString().split('T')[0]); // Reset to today
                  setPatientFilter('');
                }}
                className="mt-4 inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Summary Footer */}
        {filteredPayments.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600 text-center">
              Showing {Object.keys(paymentsByPatient).length} patient{Object.keys(paymentsByPatient).length !== 1 ? 's' : ''} with {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
