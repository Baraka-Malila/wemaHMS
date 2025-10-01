'use client';

import React, { useState } from 'react';
import { X, CreditCard, DollarSign, CheckCircle, Printer } from 'lucide-react';
import auth from '@/lib/auth';

interface PaymentRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: {
    id: string;
    patient_id: string;
    patient_name: string;
    service_type: string;
    service_name: string;
    reference_id: string;
    amount: number;
  };
  onSuccess: () => void;
}

export default function PaymentRecordModal({ isOpen, onClose, payment, onSuccess }: PaymentRecordModalProps) {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (processing) {
      return;
    }

    setProcessing(true);

    try {
      const token = auth.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/finance/payments/${payment.id}/mark-paid/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_date: new Date().toISOString(),
            payment_method: paymentMethod
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReceiptNumber(data.receipt_number || 'N/A');
        setSuccess(true);

        // Auto-close after 3 seconds
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to record payment'}`);
        setProcessing(false); // Re-enable on error
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment. Please try again.');
      setProcessing(false); // Re-enable on error
    }
  };

  const handlePrintReceipt = () => {
    // Print receipt functionality
    window.print();
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Recorded!</h2>
          <p className="text-gray-600 mb-6">
            Payment of <span className="font-bold text-gray-900">TZS {Number(payment.amount).toLocaleString()}</span> has been successfully recorded.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Receipt Number</p>
            <p className="text-lg font-mono font-bold text-gray-900">{receiptNumber}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrintReceipt}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Printer className="h-5 w-5" />
              Print Receipt
            </button>
            <button
              onClick={onSuccess}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Patient Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Patient ID:</span>
                <span className="text-sm font-medium text-gray-900">{payment.patient_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium text-gray-900">{payment.patient_name}</span>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Service Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Service:</span>
                <span className="text-sm font-medium text-gray-900">{payment.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium text-gray-900">
                  {payment.service_type.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-amber-600" />
                <span className="text-lg font-semibold text-gray-900">Amount to Pay</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                TZS {Number(payment.amount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="CASH">Cash</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="NHIF">NHIF</option>
              <option value="CREDIT">Credit/Deferred</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 transition-all font-medium"
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Record Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}