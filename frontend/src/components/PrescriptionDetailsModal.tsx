'use client';

import React from 'react';
import { X, Pill, User, Calendar, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';

interface PrescriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: {
    id: string;
    consultation?: {
      patient_id: string;
      patient_name: string;
      diagnosis?: string;
    };
    medication_name: string;
    generic_name?: string;
    strength: string;
    dosage_form: string;
    frequency: string;
    frequency_display?: string;
    custom_frequency?: string;
    dosage_instructions: string;
    duration: string;
    quantity_prescribed: number;
    quantity_dispensed: number;
    status: string;
    special_instructions?: string;
    prescribed_at: string;
    dispensed_at?: string;
    prescribed_by?: {
      full_name: string;
    };
    dispensed_by?: {
      full_name: string;
    };
  } | null;
}

export default function PrescriptionDetailsModal({ isOpen, onClose, prescription }: PrescriptionDetailsModalProps) {
  if (!isOpen || !prescription) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESCRIBED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DISPENSED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PARTIALLY_DISPENSED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DISPENSED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'PARTIALLY_DISPENSED':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'CANCELLED':
        return <X className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const remainingQuantity = prescription.quantity_prescribed - prescription.quantity_dispensed;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Pill className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Prescription Details</h2>
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
          {/* Prescription Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(prescription.status)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{prescription.medication_name}</h3>
                  <p className="text-gray-600">Prescription ID: {prescription.id}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(prescription.status)}`}>
                  {prescription.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500">
                  {remainingQuantity > 0 ? `${remainingQuantity} remaining` : 'Fully dispensed'}
                </span>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          {prescription.consultation && prescription.consultation.patient_name && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>Patient Information</span>
              </h4>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">
                      {(prescription.consultation?.patient_name || 'N/A').split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{prescription.consultation?.patient_name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{prescription.consultation?.patient_id || 'N/A'}</p>
                    {prescription.consultation.diagnosis && (
                      <p className="text-sm text-blue-700 mt-1">Diagnosis: {prescription.consultation.diagnosis}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medication Details */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Medication Details</h4>
            <div className="bg-purple-50 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Medication</p>
                  <p className="text-purple-900 font-medium">{prescription.medication_name}</p>
                  {prescription.generic_name && (
                    <p className="text-sm text-gray-600">Generic: {prescription.generic_name}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Strength & Form</p>
                  <p className="text-gray-800">{prescription.strength} {prescription.dosage_form}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Frequency</p>
                  <p className="text-gray-800">
                    {prescription.frequency_display || prescription.custom_frequency || prescription.frequency}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Duration</p>
                  <p className="text-gray-800">{prescription.duration}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Instructions</p>
                <p className="text-gray-800">{prescription.dosage_instructions}</p>
              </div>

              {prescription.special_instructions && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Special Instructions</p>
                      <p className="text-sm text-yellow-800">{prescription.special_instructions}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quantity & Dispensing */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Quantity & Dispensing</h4>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">Prescribed</p>
                  <p className="text-2xl font-bold text-green-800">{prescription.quantity_prescribed}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Dispensed</p>
                  <p className="text-2xl font-bold text-blue-800">{prescription.quantity_dispensed}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Remaining</p>
                  <p className="text-2xl font-bold text-orange-800">{remainingQuantity}</p>
                </div>
              </div>
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
                  <p className="font-medium text-gray-900">Prescribed</p>
                  <p className="text-sm text-gray-600">
                    by {prescription.prescribed_by ? `Dr. ${prescription.prescribed_by.full_name}` : 'Doctor'}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(prescription.prescribed_at).toLocaleDateString()} at {new Date(prescription.prescribed_at).toLocaleTimeString()}
                </p>
              </div>

              {prescription.dispensed_at && (
                <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Dispensed</p>
                    <p className="text-sm text-gray-600">
                      by {prescription.dispensed_by ? prescription.dispensed_by.full_name : 'Pharmacy Staff'}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(prescription.dispensed_at).toLocaleDateString()} at {new Date(prescription.dispensed_at).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <FileText className="h-3 w-3 inline mr-1" />
              Prescription created on {new Date(prescription.prescribed_at).toLocaleDateString()}
            </div>
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