'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Pill, TestTube, Calendar, User, Activity } from 'lucide-react';
import auth from '@/lib/auth';

interface PatientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  age: number;
  gender: string;
}

interface Consultation {
  id: string;
  consultation_date: string;
  symptoms: string;
  examination_findings: string;
  diagnosis: string;
  treatment_plan: string;
  doctor_name: string;
  priority: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
}

interface Prescription {
  id: string;
  medication_name: string;
  generic_name: string;
  strength: string;
  dosage_form: string;
  frequency: string;
  duration: string;
  quantity_prescribed: number;
  created_at: string;
}

interface LabRequest {
  id: string;
  test_type: string;
  test_description: string;
  urgency: string;
  clinical_notes: string;
  created_at: string;
  status: string;
}

export default function PatientHistoryModal({ isOpen, onClose, patientId }: PatientHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'consultations' | 'prescriptions' | 'lab-results'>('consultations');

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientHistory();
    }
  }, [isOpen, patientId]);

  const fetchPatientHistory = async () => {
    try {
      setLoading(true);
      const token = auth.getToken();

      // Fetch patient basic info
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

      // Fetch consultation history
      const consultationsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/consultations/?patient_id=${patientId}`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (consultationsResponse.ok) {
        const consultationsData = await consultationsResponse.json();
        // Ensure we always set an array
        const consultationsArray = Array.isArray(consultationsData)
          ? consultationsData
          : consultationsData.results
          ? (Array.isArray(consultationsData.results) ? consultationsData.results : [])
          : [];
        setConsultations(consultationsArray);
      } else {
        setConsultations([]);
      }

      // Fetch prescription history
      const prescriptionsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/prescriptions/?patient_id=${patientId}`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (prescriptionsResponse.ok) {
        const prescriptionsData = await prescriptionsResponse.json();
        const prescriptionsArray = Array.isArray(prescriptionsData)
          ? prescriptionsData
          : prescriptionsData.results
          ? (Array.isArray(prescriptionsData.results) ? prescriptionsData.results : [])
          : [];
        setPrescriptions(prescriptionsArray);
      } else {
        setPrescriptions([]);
      }

      // Fetch lab requests history
      const labRequestsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/lab-requests/?patient_id=${patientId}`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (labRequestsResponse.ok) {
        const labRequestsData = await labRequestsResponse.json();
        const labRequestsArray = Array.isArray(labRequestsData)
          ? labRequestsData
          : labRequestsData.results
          ? (Array.isArray(labRequestsData.results) ? labRequestsData.results : [])
          : [];
        setLabRequests(labRequestsArray);
      } else {
        setLabRequests([]);
      }

    } catch (error) {
      console.error('Error fetching patient history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
      case 'EMERGENCY':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'NORMAL':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Patient Medical History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Patient Info */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading patient history...</div>
          </div>
        ) : patient ? (
          <div className="p-6 bg-blue-50">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg font-semibold text-blue-600">
                  {patient.full_name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{patient.full_name}</h3>
                <p className="text-gray-600">{patient.patient_id} • {patient.age}y {patient.gender}</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('consultations')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'consultations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="inline h-4 w-4 mr-2" />
              Consultations ({consultations.length})
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'prescriptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Pill className="inline h-4 w-4 mr-2" />
              Prescriptions ({prescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('lab-results')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'lab-results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TestTube className="inline h-4 w-4 mr-2" />
              Lab Results ({labRequests.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'consultations' && (
            <div className="space-y-4">
              {consultations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>No consultation history found for this patient.</p>
                </div>
              ) : (
                consultations.map((consultation) => (
                  <div key={consultation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span className="font-medium">{formatDate(consultation.consultation_date)}</span>
                      </div>
                      <div className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(consultation.priority)}`}>
                        {consultation.priority || 'NORMAL'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Symptoms</h4>
                        <p className="text-sm text-gray-600">{consultation.symptoms || 'Not recorded'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Diagnosis</h4>
                        <p className="text-sm text-gray-600">{consultation.diagnosis || 'Not recorded'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Examination</h4>
                        <p className="text-sm text-gray-600">{consultation.examination_findings || 'Not recorded'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Treatment Plan</h4>
                        <p className="text-sm text-gray-600">{consultation.treatment_plan || 'Not recorded'}</p>
                      </div>
                    </div>

                    {/* Vital Signs */}
                    {(consultation.temperature || consultation.blood_pressure_systolic || consultation.heart_rate) && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <h4 className="font-medium text-gray-900 mb-2">Vital Signs</h4>
                        <div className="flex space-x-4 text-sm text-gray-600">
                          {consultation.temperature && <span>Temp: {consultation.temperature}°C</span>}
                          {consultation.blood_pressure_systolic && (
                            <span>BP: {consultation.blood_pressure_systolic}/{consultation.blood_pressure_diastolic}</span>
                          )}
                          {consultation.heart_rate && <span>HR: {consultation.heart_rate} bpm</span>}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                      Doctor: {consultation.doctor_name || 'Not recorded'}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              {prescriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>No prescription history found for this patient.</p>
                </div>
              ) : (
                prescriptions.map((prescription) => (
                  <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">{prescription.medication_name}</h4>
                      <span className="text-sm text-gray-500">{formatDate(prescription.created_at)}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Strength:</span>
                        <p className="text-gray-600">{prescription.strength}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Form:</span>
                        <p className="text-gray-600">{prescription.dosage_form}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Frequency:</span>
                        <p className="text-gray-600">{prescription.frequency.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Duration:</span>
                        <p className="text-gray-600">{prescription.duration}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="font-medium text-gray-700">Quantity:</span>
                      <span className="ml-2 text-gray-600">{prescription.quantity_prescribed}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'lab-results' && (
            <div className="space-y-4">
              {labRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TestTube className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>No lab request history found for this patient.</p>
                </div>
              ) : (
                labRequests.map((labRequest) => (
                  <div key={labRequest.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">{labRequest.test_type.replace('_', ' ')}</h4>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(labRequest.status)}`}>
                          {labRequest.status || 'PENDING'}
                        </span>
                        <span className="text-sm text-gray-500">{formatDate(labRequest.created_at)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Description:</span>
                        <p className="text-gray-600">{labRequest.test_description}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Urgency:</span>
                        <span className="ml-2 text-gray-600">{labRequest.urgency}</span>
                      </div>
                      {labRequest.clinical_notes && (
                        <div>
                          <span className="font-medium text-gray-700">Clinical Notes:</span>
                          <p className="text-gray-600">{labRequest.clinical_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
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