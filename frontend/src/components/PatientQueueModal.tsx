'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Calendar, FileText, Activity } from 'lucide-react';
import auth from '@/lib/auth';

interface PatientQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  mode: 'view' | 'history';
}

interface PatientDetails {
  id: string;
  patient_id: string;
  full_name: string;
  phone_number?: string;
  gender: string;
  age: number;
  patient_type: string;
  current_status: string;
  current_location?: string;
  created_at: string;
}

interface Consultation {
  id: string;
  consultation_date: string;
  diagnosis: string;
  treatment_plan: string;
  status: string;
  doctor: any;
}

export default function PatientQueueModal({ isOpen, onClose, patientId, mode }: PatientQueueModalProps) {
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);

  useEffect(() => {
    if (isOpen && patientId) {
      if (mode === 'view') {
        fetchPatientDetails();
      } else if (mode === 'history') {
        fetchPatientHistory();
      }
    }
  }, [isOpen, patientId, mode]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const token = auth.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/patients/${patientId}/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPatient(data);
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientHistory = async () => {
    try {
      setLoading(true);
      const token = auth.getToken();

      // First get patient details
      const patientResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/patients/${patientId}/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (patientResponse.ok) {
        const patientData = await patientResponse.json();
        setPatient(patientData);
      }

      // Then get consultation history
      const historyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/consultations/?patient_id=${patientId}`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setConsultations(historyData.consultations || []);
      }
    } catch (error) {
      console.error('Error fetching patient history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'view' ? 'Patient Details' : 'Medical History'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : patient ? (
            <div className="space-y-6">
              {/* Patient Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-xl font-semibold text-green-600">
                      {patient.full_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{patient.full_name}</h3>
                    <p className="text-gray-600">{patient.patient_id} • {patient.age}y {patient.gender}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{patient.phone_number || 'No phone'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{patient.current_location || 'Reception'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {mode === 'view' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Patient Type</h4>
                    <p className={`inline-flex px-3 py-1 rounded-full text-sm ${
                      patient.patient_type === 'NHIF' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {patient.patient_type}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
                    <p className="text-sm text-gray-700">{patient.current_status.replace('_', ' ')}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Registration Date</h4>
                    <p className="text-sm text-gray-700">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {mode === 'history' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Consultation History</h4>
                  {consultations.length > 0 ? (
                    <div className="space-y-4">
                      {consultations.map((consultation) => (
                        <div key={consultation.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {new Date(consultation.consultation_date).toLocaleDateString()}
                              </span>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              consultation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {consultation.status}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Diagnosis</h5>
                              <p className="text-sm text-gray-700">
                                {consultation.diagnosis || 'Not yet diagnosed'}
                              </p>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium text-gray-900">Treatment Plan</h5>
                              <p className="text-sm text-gray-700">
                                {consultation.treatment_plan || 'Not yet planned'}
                              </p>
                            </div>

                            {consultation.doctor && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-900">Doctor</h5>
                                <p className="text-sm text-gray-700">
                                  Dr. {consultation.doctor.full_name}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No medical history found for this patient.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Failed to load patient information.
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