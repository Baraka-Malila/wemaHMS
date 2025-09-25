'use client';

import React, { useState, useEffect } from 'react';
import { X, Stethoscope, Pill, TestTube, User, AlertCircle, Plus, Trash2 } from 'lucide-react';
import auth from '@/lib/auth';
import MedicalFormattingGuide from './MedicalFormattingGuide';

interface EnhancedDiagnosisModalProps {
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

interface PrescriptionData {
  medication_name: string;
  generic_name: string;
  strength: string;
  dosage_form: string;
  frequency: string;
  dosage_instructions: string;
  duration: string;
  quantity_prescribed: number;
  special_instructions: string;
}

interface LabRequestData {
  test_type: string;
  test_description: string;
  urgency: string;
  clinical_notes: string;
}

const FREQUENCY_OPTIONS = [
  { value: 'ONCE_DAILY', label: 'Once Daily' },
  { value: 'TWICE_DAILY', label: 'Twice Daily' },
  { value: 'THREE_TIMES_DAILY', label: 'Three Times Daily' },
  { value: 'FOUR_TIMES_DAILY', label: 'Four Times Daily' },
  { value: 'AS_NEEDED', label: 'As Needed' },
];

const TEST_TYPES = [
  { value: 'BLOOD_TEST', label: 'Blood Test' },
  { value: 'URINE_TEST', label: 'Urine Test' },
  { value: 'STOOL_TEST', label: 'Stool Test' },
  { value: 'XRAY', label: 'X-Ray' },
  { value: 'ULTRASOUND', label: 'Ultrasound' },
  { value: 'ECG', label: 'ECG' },
  { value: 'BLOOD_SUGAR', label: 'Blood Sugar Test' },
  { value: 'MALARIA_TEST', label: 'Malaria Test' },
  { value: 'HIV_TEST', label: 'HIV Test' },
  { value: 'OTHER', label: 'Other Test' },
];

export default function EnhancedDiagnosisModal({ isOpen, onClose, patientId, consultationId, onSave }: EnhancedDiagnosisModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [currentTab, setCurrentTab] = useState<'consultation' | 'prescriptions' | 'lab-requests'>('consultation');
  const [activeConsultationId, setActiveConsultationId] = useState<string>('');

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

  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [labRequests, setLabRequests] = useState<LabRequestData[]>([]);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientDetails();
      if (consultationId) {
        setActiveConsultationId(consultationId);
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
    if (!consultationId) return;

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

  const addPrescription = () => {
    setPrescriptions(prev => [...prev, {
      medication_name: '',
      generic_name: '',
      strength: '',
      dosage_form: '',
      frequency: 'THREE_TIMES_DAILY',
      dosage_instructions: '',
      duration: '',
      quantity_prescribed: 0,
      special_instructions: ''
    }]);
  };

  const updatePrescription = (index: number, field: keyof PrescriptionData, value: string | number) => {
    setPrescriptions(prev => prev.map((prescription, i) =>
      i === index ? { ...prescription, [field]: value } : prescription
    ));
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prev => prev.filter((_, i) => i !== index));
  };

  const addLabRequest = () => {
    setLabRequests(prev => [...prev, {
      test_type: 'BLOOD_TEST',
      test_description: '',
      urgency: 'NORMAL',
      clinical_notes: ''
    }]);
  };

  const updateLabRequest = (index: number, field: keyof LabRequestData, value: string) => {
    setLabRequests(prev => prev.map((request, i) =>
      i === index ? { ...request, [field]: value } : request
    ));
  };

  const removeLabRequest = (index: number) => {
    setLabRequests(prev => prev.filter((_, i) => i !== index));
  };

  const saveConsultation = async () => {
    try {
      setSaving(true);
      const token = auth.getToken();

      let consultationResponse;

      if (activeConsultationId) {
        // Update existing consultation
        consultationResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/consultations/${activeConsultationId}/`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...formData,
              temperature: formData.temperature ? parseFloat(formData.temperature.toString()) : null,
              blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic.toString()) : null,
              blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic.toString()) : null,
              heart_rate: formData.heart_rate ? parseInt(formData.heart_rate.toString()) : null,
            })
          }
        );
      } else {
        // Create new consultation
        consultationResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/consultations/create/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              patient_id: patientId,
              patient_name: patient?.full_name || '',
              ...formData,
              temperature: formData.temperature ? parseFloat(formData.temperature.toString()) : null,
              blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic.toString()) : null,
              blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic.toString()) : null,
              heart_rate: formData.heart_rate ? parseInt(formData.heart_rate.toString()) : null,
            })
          }
        );
      }

      if (consultationResponse.ok) {
        const consultationData = await consultationResponse.json();
        const finalConsultationId = consultationData.consultation?.id || activeConsultationId;
        setActiveConsultationId(finalConsultationId);

        // Create prescriptions
        for (const prescription of prescriptions) {
          if (prescription.medication_name.trim()) {
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/prescriptions/`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Token ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  consultation: finalConsultationId,
                  ...prescription,
                  quantity_prescribed: parseInt(prescription.quantity_prescribed.toString())
                })
              }
            );
          }
        }

        // Create lab requests
        for (const labRequest of labRequests) {
          if (labRequest.test_description.trim()) {
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/lab-requests/`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Token ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  consultation: finalConsultationId,
                  ...labRequest
                })
              }
            );
          }
        }

        alert('Consultation completed successfully!');
        onSave?.();
        onClose();
      } else {
        const errorData = await consultationResponse.json();
        alert(`Error saving consultation: ${errorData.error || 'Please try again'}`);
      }
    } catch (error) {
      console.error('Error saving consultation:', error);
      alert('Error saving consultation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Patient Consultation
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
            <div className="text-gray-500">Loading patient information...</div>
          </div>
        ) : patient ? (
          <div className="p-6 bg-green-50">
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
        ) : null}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setCurrentTab('consultation')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentTab === 'consultation'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Stethoscope className="inline h-4 w-4 mr-2" />
              Consultation & Diagnosis
            </button>
            <button
              onClick={() => setCurrentTab('prescriptions')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentTab === 'prescriptions'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Pill className="inline h-4 w-4 mr-2" />
              Prescriptions ({prescriptions.length})
            </button>
            <button
              onClick={() => setCurrentTab('lab-requests')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentTab === 'lab-requests'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TestTube className="inline h-4 w-4 mr-2" />
              Lab Requests ({labRequests.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {currentTab === 'consultation' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Patient Symptoms
                    </label>
                    <MedicalFormattingGuide field="symptoms" />
                  </div>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Chief Complaint: Main reason for visit&#10;Duration: How long present&#10;Severity: Mild/moderate/severe&#10;Associated symptoms: Related symptoms&#10;Aggravating/Relieving factors: What helps/worsens"
                    value={formData.symptoms}
                    onChange={(e) => handleInputChange('symptoms', e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Physical Examination
                    </label>
                    <MedicalFormattingGuide field="examination" />
                  </div>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="General appearance: Alert, oriented&#10;Vital signs: If measured&#10;Relevant systems: Focus on complaint&#10;Positive findings: Abnormalities&#10;Negative findings: Important normals"
                    value={formData.examination_findings}
                    onChange={(e) => handleInputChange('examination_findings', e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Diagnosis
                    </label>
                    <MedicalFormattingGuide field="diagnosis" />
                  </div>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Primary: Most likely condition&#10;Differential: Other possibilities&#10;Severity: Mild/moderate/severe"
                    value={formData.diagnosis}
                    onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Treatment Plan
                    </label>
                    <MedicalFormattingGuide field="treatment" />
                  </div>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Immediate: Current treatment&#10;Medications: Prescribed with dosing&#10;Non-pharm: Lifestyle changes&#10;Follow-up: When to return&#10;Red flags: When to seek immediate care"
                    value={formData.treatment_plan}
                    onChange={(e) => handleInputChange('treatment_plan', e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
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

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Vital Signs (Optional)</h4>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date (Optional)
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    value={formData.follow_up_date}
                    onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Private Notes (Optional)
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
          )}

          {currentTab === 'prescriptions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Prescriptions</h3>
                <button
                  onClick={addPrescription}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Prescription</span>
                </button>
              </div>

              {prescriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No prescriptions added. Click "Add Prescription" to start.
                </div>
              ) : (
                <div className="space-y-6">
                  {prescriptions.map((prescription, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Prescription {index + 1}</h4>
                        <button
                          onClick={() => removePrescription(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Medication Name *
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g. Paracetamol"
                            value={prescription.medication_name}
                            onChange={(e) => updatePrescription(index, 'medication_name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Generic Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g. Acetaminophen"
                            value={prescription.generic_name}
                            onChange={(e) => updatePrescription(index, 'generic_name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Strength *
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g. 500mg"
                            value={prescription.strength}
                            onChange={(e) => updatePrescription(index, 'strength', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Form *
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g. tablet, capsule, syrup"
                            value={prescription.dosage_form}
                            onChange={(e) => updatePrescription(index, 'dosage_form', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Frequency *
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            value={prescription.frequency}
                            onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                          >
                            {FREQUENCY_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duration *
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g. 5 days, 2 weeks"
                            value={prescription.duration}
                            onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            placeholder="15"
                            value={prescription.quantity_prescribed || ''}
                            onChange={(e) => updatePrescription(index, 'quantity_prescribed', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Instructions *
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g. Take after meals with water"
                            value={prescription.dosage_instructions}
                            onChange={(e) => updatePrescription(index, 'dosage_instructions', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Special Instructions
                        </label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          placeholder="Additional instructions for patient or pharmacist..."
                          value={prescription.special_instructions}
                          onChange={(e) => updatePrescription(index, 'special_instructions', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === 'lab-requests' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Lab Test Requests</h3>
                <button
                  onClick={addLabRequest}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Lab Request</span>
                </button>
              </div>

              {labRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No lab requests added. Click "Add Lab Request" to start.
                </div>
              ) : (
                <div className="space-y-6">
                  {labRequests.map((request, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Lab Request {index + 1}</h4>
                        <button
                          onClick={() => removeLabRequest(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Test Type *
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            value={request.test_type}
                            onChange={(e) => updateLabRequest(index, 'test_type', e.target.value)}
                          >
                            {TEST_TYPES.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Urgency *
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                            value={request.urgency}
                            onChange={(e) => updateLabRequest(index, 'urgency', e.target.value)}
                          >
                            <option value="NORMAL">Normal</option>
                            <option value="URGENT">Urgent</option>
                            <option value="STAT">STAT (Immediate)</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Test Description *
                        </label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          placeholder="Specific test requirements..."
                          value={request.test_description}
                          onChange={(e) => updateLabRequest(index, 'test_description', e.target.value)}
                        />
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Clinical Notes
                        </label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                          placeholder="Clinical justification for the test..."
                          value={request.clinical_notes}
                          onChange={(e) => updateLabRequest(index, 'clinical_notes', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            <div className="flex items-center text-xs text-gray-500">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Fields marked with * are required</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveConsultation}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Complete Consultation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}