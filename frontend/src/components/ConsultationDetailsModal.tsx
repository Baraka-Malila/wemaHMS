'use client';

import React from 'react';
import { X, User, Calendar, Stethoscope, FileText, Activity } from 'lucide-react';

interface ConsultationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: {
    id: string;
    patient_id: string;
    patient_name: string;
    consultation_date: string;
    status: string;
    priority: string;
    chief_complaint?: string;
    symptoms?: string;
    examination_findings?: string;
    diagnosis?: string;
    treatment_plan?: string;
    doctor_notes?: string;
    temperature?: number;
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    heart_rate?: number;
    follow_up_date?: string;
    doctor?: any;
  } | null;
}

export default function ConsultationDetailsModal({ isOpen, onClose, consultation }: ConsultationDetailsModalProps) {
  if (!isOpen || !consultation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Consultation Details</h2>
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
          {/* Patient & Consultation Info */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-lg font-semibold text-green-600">
                  {(consultation.patient_name || 'N/A').split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{consultation.patient_name || 'N/A'}</h3>
                <p className="text-gray-600">{consultation.patient_id}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(consultation.consultation_date).toLocaleString()}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    consultation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {consultation.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    consultation.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                    consultation.priority === 'EMERGENCY' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {consultation.priority} Priority
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Chief Complaint */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Chief Complaint</span>
                </h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {consultation.chief_complaint || 'Not recorded'}
                </p>
              </div>

              {/* Symptoms */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Patient Symptoms</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {consultation.symptoms || 'Not recorded'}
                </p>
              </div>

              {/* Examination Findings */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Physical Examination</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {consultation.examination_findings || 'Not recorded'}
                </p>
              </div>

              {/* Diagnosis */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Diagnosis</h4>
                <p className="text-gray-700 bg-blue-50 p-3 rounded-lg font-medium">
                  {consultation.diagnosis || 'Not yet diagnosed'}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Treatment Plan */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Treatment Plan</h4>
                <p className="text-gray-700 bg-green-50 p-3 rounded-lg">
                  {consultation.treatment_plan || 'Not yet planned'}
                </p>
              </div>

              {/* Vital Signs */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <span>Vital Signs</span>
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="font-medium">
                      {consultation.temperature ? `${consultation.temperature}°C` : 'Not recorded'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blood Pressure:</span>
                    <span className="font-medium">
                      {consultation.blood_pressure_systolic && consultation.blood_pressure_diastolic
                        ? `${consultation.blood_pressure_systolic}/${consultation.blood_pressure_diastolic}`
                        : 'Not recorded'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heart Rate:</span>
                    <span className="font-medium">
                      {consultation.heart_rate ? `${consultation.heart_rate} bpm` : 'Not recorded'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Follow-up */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Follow-up</h4>
                <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">
                  {consultation.follow_up_date
                    ? new Date(consultation.follow_up_date).toLocaleDateString()
                    : 'Not scheduled'}
                </p>
              </div>

              {/* Doctor Notes */}
              {consultation.doctor_notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>Doctor's Notes</span>
                  </h4>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg italic">
                    {consultation.doctor_notes}
                  </p>
                </div>
              )}

              {/* Doctor Info */}
              {consultation.doctor && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Attending Doctor</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    Dr. {consultation.doctor.full_name || consultation.doctor.username}
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
              Consultation ID: {consultation.id}
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