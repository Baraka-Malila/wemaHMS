'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  Clock,
  FileText,
  CreditCard,
  CheckCircle,
  Filter,
  Search
} from 'lucide-react';
import RealTimeClock from '@/components/ui/RealTimeClock';
import PaymentRecordModal from '@/components/PaymentRecordModal';
import auth from '@/lib/auth';

interface PendingPayment {
  id: string;
  patient_id: string;
  patient_name: string;
  service_type: string;
  service_name: string;
  reference_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function PaymentQueue() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'recent'>('pending');
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [recentPayments, setRecentPayments] = useState<PendingPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PendingPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('ALL');

  const loadPaymentQueue = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }

    try {
      const token = auth.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/finance/payments/pending/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const paymentsArray = Array.isArray(data)
          ? data
          : data.pending_payments
          ? (Array.isArray(data.pending_payments) ? data.pending_payments : [])
          : [];
        setPendingPayments(paymentsArray);
        if (activeTab === 'pending') {
          setFilteredPayments(paymentsArray);
        }
      }
    } catch (error) {
      console.error('Error loading payment queue:', error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  const loadRecentPayments = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    }

    try {
      const token = auth.getToken();
      // Get all payments (both paid and pending)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/pricing/payments/?status=PAID&limit=100`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const paymentsArray = Array.isArray(data)
          ? data
          : data.results
          ? (Array.isArray(data.results) ? data.results : [])
          : [];
        setRecentPayments(paymentsArray);
        if (activeTab === 'recent') {
          setFilteredPayments(paymentsArray);
        }
      }
    } catch (error) {
      console.error('Error loading recent payments:', error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPaymentQueue(true);
    } else {
      loadRecentPayments(true);
    }

    // Real-time polling every 3 seconds
    const refreshInterval = setInterval(() => {
      if (activeTab === 'pending') {
        loadPaymentQueue(false);
      } else {
        loadRecentPayments(false);
      }
    }, 3000);

    return () => clearInterval(refreshInterval);
  }, [activeTab]);

  // Filter and search
  useEffect(() => {
    const sourceData = activeTab === 'pending' ? pendingPayments : recentPayments;
    let filtered = sourceData;

    // Service type filter
    if (serviceFilter !== 'ALL') {
      filtered = filtered.filter(p => p.service_type === serviceFilter);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.patient_id?.toLowerCase().includes(search) ||
        p.patient_name?.toLowerCase().includes(search) ||
        p.service_name?.toLowerCase().includes(search)
      );
    }

    setFilteredPayments(filtered);
  }, [searchTerm, serviceFilter, pendingPayments, recentPayments, activeTab]);

  const handleRecordPayment = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    setSelectedPayment(null);
    loadPaymentQueue(false);
  };

  const getServiceBadgeColor = (serviceType: string) => {
    switch (serviceType) {
      case 'CONSULTATION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LAB_TEST':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MEDICATION':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FILE_FEE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getWaitTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins}min${diffMins !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(diffMins / 60);
    const remainingMinutes = diffMins % 60;
    if (remainingMinutes === 0) {
      return `${hours}hr${hours !== 1 ? 's' : ''}`;
    }
    return `${hours}hr${hours !== 1 ? 's' : ''} ${remainingMinutes}min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {activeTab === 'pending' ? 'Payment Queue' : 'Recent Payments'}
            </h1>
            <p className="text-amber-100">
              {filteredPayments.length} {activeTab === 'pending' ? 'pending' : 'recent'} payment{filteredPayments.length !== 1 ? 's' : ''}
              {' • Total: TZS '}
              {filteredPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-lg p-4">
              <DollarSign className="h-8 w-8 text-white mb-2" />
              <p className="text-sm text-amber-100">Current Time</p>
              <RealTimeClock className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Pending Payments</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === 'pending' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {pendingPayments.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'recent'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Recent Payments</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === 'recent' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {recentPayments.length}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient ID, name, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Service Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
      </div>

      {/* Payment Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPayments.length === 0 ? (
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending payments</h3>
            <p className="text-gray-500">
              {searchTerm || serviceFilter !== 'ALL'
                ? 'No payments match your current filters.'
                : 'All payments have been processed.'}
            </p>
          </div>
        ) : (
          filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {payment.patient_name}
                  </h3>
                  <p className="text-sm text-gray-600">{payment.patient_id}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getServiceBadgeColor(payment.service_type)}`}>
                  {payment.service_type.replace('_', ' ')}
                </span>
              </div>

              {/* Service Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Service:</span>
                  <span className="ml-2 font-medium text-gray-900">{payment.service_name}</span>
                </div>

                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Amount:</span>
                  <span className="ml-2 font-bold text-gray-900">
                    TZS {Number(payment.amount).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Waiting:</span>
                  <span className="ml-2 font-medium text-orange-600">
                    {getWaitTime(payment.created_at)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleRecordPayment(payment)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all font-medium"
              >
                <CreditCard className="h-5 w-5" />
                Record Payment
              </button>
            </div>
          ))
        )}
      </div>

      {/* Payment Recording Modal */}
      {selectedPayment && (
        <PaymentRecordModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}