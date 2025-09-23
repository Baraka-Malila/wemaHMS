'use client';

import React from 'react';
import { X, TestTube, User, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface LabRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    id: string;
    consultation?: {
      patient_id: string;
      patient_name: string;
    };
    test_type: string;
    test_description: string;
    urgency: string;
    status: string;
    clinical_notes?: string;
    requested_at: string;
    completed_at?: string;
    requested_by?: {
      full_name: string;
    };
    processed_by?: {
      full_name: string;
    };
  } | null;
}

export default function LabRequestDetailsModal({ isOpen, onClose, request }: LabRequestDetailsModalProps) {
  if (!isOpen || !request) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toUpperCase()) {
      case 'URGENT':
      case 'STAT':
        return 'text-red-600 bg-red-50';
      case 'NORMAL':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'CANCELLED':
        return <X className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <TestTube className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Lab Request Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Request Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(request.status)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{request.test_type}</h3>
                  <p className="text-gray-600">Request ID: {request.id}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getUrgencyColor(request.urgency)}`}>
                  {request.urgency} Priority
                </span>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          {request.consultation && request.consultation.patient_name && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>Patient Information</span>
              </h4>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">
                      {(request.consultation?.patient_name || 'N/A').split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{request.consultation?.patient_name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{request.consultation?.patient_id || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test Details */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Test Details</h4>
            <div className="bg-purple-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Test Type</p>
                <p className="text-purple-900 font-medium">{request.test_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Description</p>
                <p className="text-gray-800">{request.test_description}</p>
              </div>
              {request.clinical_notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Clinical Notes</p>
                  <p className="text-gray-800">{request.clinical_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Timeline</span>
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Requested</p>
                  <p className="text-sm text-gray-600">
                    {request.requested_by ? `by Dr. ${request.requested_by.full_name}` : 'by Doctor'}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(request.requested_at).toLocaleDateString()} at {new Date(request.requested_at).toLocaleTimeString()}
                </p>
              </div>

              {request.completed_at && (
                <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Completed</p>
                    <p className="text-sm text-gray-600">
                      {request.processed_by ? `by ${request.processed_by.full_name}` : 'by Lab Staff'}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(request.completed_at).toLocaleDateString()} at {new Date(request.completed_at).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Results Section (if completed) */}
          {request.status === 'COMPLETED' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Test Results</h4>
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-green-800">
                  Test completed successfully. Detailed results are available in the lab system.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}