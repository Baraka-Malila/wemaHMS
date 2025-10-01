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
  processed_by: any;
  receipt_number: string;
}

export default function PaymentHistory() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [patientFilter, setPatientFilter] = useState('');

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const token = auth.getToken();

      // Fetch all PAID payments
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/finance/payments/?status=PAID`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const paymentsArray = Array.isArray(data) ? data : [];
        setPayments(paymentsArray);
        setFilteredPayments(paymentsArray);
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentHistory();
    // Refresh every 10 seconds
    const interval = setInterval(loadPaymentHistory, 10000);
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

  const totalAmount = filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

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
    acc[payment.patient_id].total += parseFloat(payment.amount || '0');
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Payment History & Transactions</h1>
            <p className="text-amber-100">
              Complete payment ledger - {filteredPayments.length} transaction{filteredPayments.length !== 1 ? 's' : ''}
              {' • Total: TZS '}
              {totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-lg p-4">
              <DollarSign className="h-8 w-8 text-white mb-2" />
              <p className="text-sm text-amber-100">Current Time</p>
              <RealTimeClock className="text-white font-semibold" />
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

        {/* Export Button */}
        <div className="mt-4 flex justify-end">
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
            All Transactions - {new Date(dateFilter).toLocaleDateString()}
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-3"></div>
            <p className="text-sm">Loading payment history...</p>
          </div>
        ) : filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Processed By
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.payment_date).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">{payment.receipt_number || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.patient_name}</div>
                        <div className="text-sm text-gray-500">{payment.patient_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.service_name}</div>
                        <span className={`inline-flex mt-1 px-2 py-1 text-xs font-medium rounded-full ${getServiceBadgeColor(payment.service_type)}`}>
                          {payment.service_type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        TZS {parseFloat(payment.amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.payment_method}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {payment.processed_by?.full_name || 'System'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-amber-600 hover:text-amber-900">
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or select a different date
            </p>
          </div>
        )}

        {/* Summary Footer */}
        {filteredPayments.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredPayments.length} transaction{filteredPayments.length !== 1 ? 's' : ''}
              </div>
              <div className="text-lg font-bold text-gray-900">
                Total: TZS {totalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payments by Patient Summary */}
      {Object.keys(paymentsByPatient).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Summary by Patient</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(paymentsByPatient).map((patient: any) => (
                <div key={patient.patient_id} className="border border-gray-200 rounded-lg p-4 hover:border-amber-500 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{patient.patient_name}</h4>
                      <p className="text-sm text-gray-500">{patient.patient_id}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {patient.payments.length} payment{patient.payments.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Services: {[...new Set(patient.payments.map((p: Payment) => p.service_type))].join(', ').replace(/_/g, ' ')}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-lg font-bold text-gray-900">
                      TZS {patient.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
