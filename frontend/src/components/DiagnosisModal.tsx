'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Stethoscope, FileText, Calendar, AlertCircle } from 'lucide-react';
import auth from '@/lib/auth';

interface DiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  consultationId?: string;
  onSave?: () => void;
}

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  age: number;
  gender: string;
}

interface DiagnosisData {
  symptoms: string;
  examination_findings: string;
  diagnosis: string;
  treatment_plan: string;
  follow_up_date: string;
  priority: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  doctor_notes: string;
}

export default function DiagnosisModal({ isOpen, onClose, patientId, consultationId, onSave }: DiagnosisModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<DiagnosisData>({
    symptoms: '',
    examination_findings: '',
    diagnosis: '',
    treatment_plan: '',
    follow_up_date: '',
    priority: 'NORMAL',
    temperature: undefined,
    blood_pressure_systolic: undefined,
    blood_pressure_diastolic: undefined,
    heart_rate: undefined,
    doctor_notes: ''
  });

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientDetails();
      if (consultationId) {
        fetchConsultationDetails();
      }
    }
  }, [isOpen, patientId, consultationId]);

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

  const fetchConsultationDetails = async () => {
    try {
      const token = auth.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/consultations/${consultationId}/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFormData({
          symptoms: data.symptoms || '',
          examination_findings: data.examination_findings || '',
          diagnosis: data.diagnosis || '',
          treatment_plan: data.treatment_plan || '',
          follow_up_date: data.follow_up_date || '',
          priority: data.priority || 'NORMAL',
          temperature: data.temperature || undefined,
          blood_pressure_systolic: data.blood_pressure_systolic || undefined,
          blood_pressure_diastolic: data.blood_pressure_diastolic || undefined,
          heart_rate: data.heart_rate || undefined,
          doctor_notes: data.doctor_notes || ''
        });
      }
    } catch (error) {
      console.error('Error fetching consultation details:', error);
    }
  };

  const handleInputChange = (field: keyof DiagnosisData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = auth.getToken();

      const endpoint = consultationId
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/consultations/${consultationId}/update/`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/consultations/create/`;

      const response = await fetch(endpoint, {
        method: consultationId ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patientId,
          ...formData,
          // Convert string values to numbers for vital signs
          temperature: formData.temperature ? parseFloat(formData.temperature.toString()) : null,
          blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic.toString()) : null,
          blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic.toString()) : null,
          heart_rate: formData.heart_rate ? parseInt(formData.heart_rate.toString()) : null,
        })
      });

      if (response.ok) {
        alert('Diagnosis saved successfully!');
        onSave?.();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Error saving diagnosis: ${errorData.error || 'Please try again'}`);
      }
    } catch (error) {
      console.error('Error saving diagnosis:', error);
      alert('Error saving diagnosis. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {consultationId ? 'Update Diagnosis' : 'New Diagnosis'}
            </h2>
          </div>
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
              <div className="text-gray-500">Loading patient information...</div>
            </div>
          ) : patient ? (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-green-600">
                      {patient.full_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{patient.full_name}</h3>
                    <p className="text-gray-600">{patient.patient_id} • {patient.age}y {patient.gender}</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Symptoms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Symptoms
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Describe patient's reported symptoms..."
                      value={formData.symptoms}
                      onChange={(e) => handleInputChange('symptoms', e.target.value)}
                    />
                  </div>

                  {/* Examination Findings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Physical Examination Findings
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Document physical examination results..."
                      value={formData.examination_findings}
                      onChange={(e) => handleInputChange('examination_findings', e.target.value)}
                    />
                  </div>

                  {/* Diagnosis */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnosis <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Primary diagnosis..."
                      value={formData.diagnosis}
                      onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                    />
                  </div>

                  {/* Treatment Plan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Treatment Plan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Recommended treatment plan..."
                      value={formData.treatment_plan}
                      onChange={(e) => handleInputChange('treatment_plan', e.target.value)}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="URGENT">Urgent</option>
                      <option value="EMERGENCY">Emergency</option>
                    </select>
                  </div>

                  {/* Vital Signs */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Vital Signs</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Temperature (°C)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="36.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                          value={formData.temperature || ''}
                          onChange={(e) => handleInputChange('temperature', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Heart Rate (bpm)</label>
                        <input
                          type="number"
                          placeholder="80"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                          value={formData.heart_rate || ''}
                          onChange={(e) => handleInputChange('heart_rate', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">BP Systolic</label>
                        <input
                          type="number"
                          placeholder="120"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                          value={formData.blood_pressure_systolic || ''}
                          onChange={(e) => handleInputChange('blood_pressure_systolic', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">BP Diastolic</label>
                        <input
                          type="number"
                          placeholder="80"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                          value={formData.blood_pressure_diastolic || ''}
                          onChange={(e) => handleInputChange('blood_pressure_diastolic', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Follow-up Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Follow-up Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      value={formData.follow_up_date}
                      onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                    />
                  </div>

                  {/* Doctor Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Private Notes
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="Private notes for doctor reference..."
                      value={formData.doctor_notes}
                      onChange={(e) => handleInputChange('doctor_notes', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Failed to load patient information.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <div className="flex items-center text-xs text-gray-500">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>* Required fields</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.diagnosis || !formData.treatment_plan}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Diagnosis'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}