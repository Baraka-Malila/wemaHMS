'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import auth from '@/lib/auth';

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  age: number;
  gender: string;
  phone_number: string;
  current_status: string;
  patient_type: string;
  weight?: number;
  height?: number;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  pulse_rate?: number;
}

interface ConsultationFormData {
  chief_complaint: string;
  symptoms: string;
  examination_findings: string;
  clinical_notes: string;
  diagnosis: string;
  possible_diagnosis: string;
  treatment_plan: string;
  medication_plan: string;
  temperature: string;
  blood_pressure_systolic: string;
  blood_pressure_diastolic: string;
  heart_rate: string;
  follow_up_date: string;
  priority: string;
  consultation_fee_required: boolean;
  consultation_fee_amount: string;
}

export default function ConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState<ConsultationFormData>({
    chief_complaint: '',
    symptoms: '',
    examination_findings: '',
    clinical_notes: '',
    diagnosis: '',
    possible_diagnosis: '',
    treatment_plan: '',
    medication_plan: '',
    temperature: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    follow_up_date: '',
    priority: 'NORMAL',
    consultation_fee_required: true,
    consultation_fee_amount: '5000'
  });

  useEffect(() => {
    const user = auth.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/patients/${patientId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPatient(data);

        // Pre-fill vital signs from patient data
        setFormData(prev => ({
          ...prev,
          temperature: data.temperature?.toString() || '',
          blood_pressure_systolic: data.blood_pressure_systolic?.toString() || '',
          blood_pressure_diastolic: data.blood_pressure_diastolic?.toString() || '',
          heart_rate: data.pulse_rate?.toString() || ''
        }));
      } else {
        alert('Failed to fetch patient data');
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSaveConsultation = async (status: string = 'IN_PROGRESS') => {
    if (!patient || !currentUser) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const consultationData = {
        patient_id: patient.patient_id,
        patient_name: patient.full_name,
        ...formData,
        status: status,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : null,
        blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : null,
        heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
        consultation_fee_amount: parseFloat(formData.consultation_fee_amount || '5000'),
        follow_up_date: formData.follow_up_date || null
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/consultations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultationData)
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Consultation ${status === 'COMPLETED' ? 'completed' : 'saved'} successfully!`);

        if (status === 'COMPLETED') {
          // Redirect to patient timeline or queue
          router.push('/doctor/queue');
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to save consultation'}`);
      }
    } catch (error) {
      console.error('Error saving consultation:', error);
      alert('Network error while saving consultation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Patient not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clinical Consultation</h1>
            <p className="text-gray-600">Patient: {patient.full_name} ({patient.patient_id})</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Back to Queue
            </button>
            <button
              onClick={() => router.push(`/doctor/patient-timeline/${patientId}`)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Patient History
            </button>
          </div>
        </div>
      </div>

      {/* Patient Info Header */}
      <div className="bg-blue-50 px-6 py-4 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Age/Gender:</span>
            <span className="ml-2">{patient.age} / {patient.gender}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Phone:</span>
            <span className="ml-2">{patient.phone_number}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Type:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${patient.patient_type === 'NHIF' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {patient.patient_type}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Status:</span>
            <span className="ml-2 text-blue-600">{patient.current_status}</span>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-6xl mx-auto p-6">
        <form className="space-y-8">

          {/* Vital Signs Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vital Signs</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="36.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Systolic BP (mmHg)
                </label>
                <input
                  type="number"
                  name="blood_pressure_systolic"
                  value={formData.blood_pressure_systolic}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diastolic BP (mmHg)
                </label>
                <input
                  type="number"
                  name="blood_pressure_diastolic"
                  value={formData.blood_pressure_diastolic}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  name="heart_rate"
                  value={formData.heart_rate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="72"
                />
              </div>
            </div>
          </div>

          {/* Main Complaint & History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Main Complaint & History</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chief Complaint *
                </label>
                <textarea
                  name="chief_complaint"
                  value={formData.chief_complaint}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Main reason for patient visit..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms & History
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Patient symptoms, medical history, allergies, etc..."
                />
              </div>
            </div>
          </div>

          {/* Clinical Examination */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Examination</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Examination Findings
                </label>
                <textarea
                  name="examination_findings"
                  value={formData.examination_findings}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Physical examination results..."
                />
              </div>
            </div>
          </div>

          {/* Clinical Notes (Free Form) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Notes</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinical Notes (Free Form)
                  <span className="text-gray-500 text-xs">- As in hospital clinical notes form</span>
                </label>
                <textarea
                  name="clinical_notes"
                  value={formData.clinical_notes}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Free-form clinical notes, observations, patient progress..."
                />
              </div>
            </div>
          </div>

          {/* Diagnosis & Treatment */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis & Treatment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Diagnosis
                </label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Primary diagnosis..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Possible/Differential Diagnosis
                </label>
                <textarea
                  name="possible_diagnosis"
                  value={formData.possible_diagnosis}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Possible or differential diagnosis..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Plan
                </label>
                <textarea
                  name="treatment_plan"
                  value={formData.treatment_plan}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Treatment recommendations, procedures, etc..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medication Plan
                </label>
                <textarea
                  name="medication_plan"
                  value={formData.medication_plan}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Medications, dosages, instructions..."
                />
              </div>
            </div>
          </div>

          {/* Follow-up & Priority */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow-up & Priority</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  name="follow_up_date"
                  value={formData.follow_up_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgent</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="consultation_fee_required"
                  checked={formData.consultation_fee_required}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Consultation fee required
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Fee (TZS)
                </label>
                <input
                  type="number"
                  name="consultation_fee_amount"
                  value={formData.consultation_fee_amount}
                  onChange={handleInputChange}
                  disabled={!formData.consultation_fee_required}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="5000"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div className="space-x-4">
                <button
                  type="button"
                  onClick={() => handleSaveConsultation('IN_PROGRESS')}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/doctor/lab-request/${patientId}`)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Request Lab Tests
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleSaveConsultation('COMPLETED')}
                disabled={saving || !formData.chief_complaint.trim()}
                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Completing...' : 'Complete Consultation'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              * Chief complaint is required to complete consultation
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}