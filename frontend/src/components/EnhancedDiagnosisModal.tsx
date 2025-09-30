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
  selected_tests: string[];
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

// Lab tests based on the physical lab request form
const LAB_TESTS = {
  PARASITOLOGY: [
    { id: 'mrdt', name: 'MRDT' },
    { id: 'bs', name: 'BS (Blood Smear)' },
    { id: 'stool_macro', name: 'STOOL ANALYSIS - Macro' },
    { id: 'stool_micro', name: 'STOOL ANALYSIS - Micro' },
    { id: 'urine_sed_macro', name: 'URINE SED - Macro' },
    { id: 'urine_sed_micro', name: 'URINE SED - Micro' },
    { id: 'urinalysis', name: 'URINALYSIS' },
  ],
  MICROBIOLOGY: [
    { id: 'rpr', name: 'RPR (Syphilis)' },
    { id: 'h_pylori', name: 'H. Pylori' },
    { id: 'hepatitis_b', name: 'Hepatitis B' },
    { id: 'hepatitis_c', name: 'Hepatitis C' },
    { id: 'ssat', name: 'SsAT (Salmonella)' },
    { id: 'upt', name: 'UPT (Pregnancy Test)' },
  ],
  CLINICAL_CHEMISTRY: [
    { id: 'glucose', name: 'Glucose' },
    { id: 'urobiliogen', name: 'Urobiliogen' },
    { id: 'bilirubin', name: 'Bilirubin' },
    { id: 'ketones', name: 'Ketones' },
    { id: 's_gravity', name: 'S. Gravity' },
    { id: 'blood', name: 'Blood' },
    { id: 'ph', name: 'pH' },
    { id: 'protein', name: 'Protein' },
    { id: 'nitrite', name: 'Nitrite' },
    { id: 'leucocytes', name: 'Leucocytes' },
  ],
  HEMATOLOGY: [
    { id: 'esr', name: 'ESR' },
    { id: 'b_grouping', name: 'B/Grouping (Blood Group)' },
    { id: 'hb', name: 'Hb (Hemoglobin)' },
    { id: 'rheumatoid_factor', name: 'Rheumatoid factor' },
    { id: 'rbg', name: 'RBG (Random Blood Glucose)' },
    { id: 'fbg', name: 'FBG (Fasting Blood Glucose)' },
    { id: 'sickling_test', name: 'Sickling test' },
  ],
};

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
  const [labRequest, setLabRequest] = useState<LabRequestData>({
    selected_tests: [],
    urgency: 'NORMAL',
    clinical_notes: '',
  });

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientDetails();
      if (consultationId) {
        setActiveConsultationId(consultationId);
        fetchConsultationDetails();
      }
    } else if (!isOpen) {
      // Reset form when modal is closed to prevent flickering on next open
      setFormData({
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
      setPrescriptions([]);
      setLabRequest({
        selected_tests: [],
        urgency: 'NORMAL',
        clinical_notes: '',
      });
      setCurrentTab('consultation');
    }
  }, [isOpen, patientId]);

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

        // Auto-populate vital signs from patient record if available
        if (data.temperature || data.blood_pressure_systolic || data.pulse_rate) {
          setFormData(prev => ({
            ...prev,
            temperature: data.temperature || prev.temperature,
            blood_pressure_systolic: data.blood_pressure_systolic || prev.blood_pressure_systolic,
            blood_pressure_diastolic: data.blood_pressure_diastolic || prev.blood_pressure_diastolic,
            heart_rate: data.pulse_rate || prev.heart_rate,
          }));
        }
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

  const toggleLabTest = (testId: string) => {
    setLabRequest(prev => ({
      ...prev,
      selected_tests: prev.selected_tests.includes(testId)
        ? prev.selected_tests.filter(id => id !== testId)
        : [...prev.selected_tests, testId]
    }));
  };

  const updateLabRequestField = (field: keyof LabRequestData, value: any) => {
    setLabRequest(prev => ({ ...prev, [field]: value }));
  };

  const saveConsultation = async () => {
    // Validate required fields
    if (!formData.symptoms.trim()) {
      alert('Please enter patient symptoms before completing consultation.');
      return;
    }
    if (!formData.diagnosis.trim()) {
      alert('Please enter a diagnosis before completing consultation.');
      return;
    }
    if (!formData.treatment_plan.trim()) {
      alert('Please enter a treatment plan before completing consultation.');
      return;
    }

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

        // Create lab requests - create individual requests for each selected test
        if (labRequest.selected_tests.length > 0) {
          // Get test names for description
          const allTests = [...LAB_TESTS.PARASITOLOGY, ...LAB_TESTS.MICROBIOLOGY, ...LAB_TESTS.CLINICAL_CHEMISTRY, ...LAB_TESTS.HEMATOLOGY];
          const selectedTestNames = labRequest.selected_tests
            .map(testId => allTests.find(t => t.id === testId)?.name)
            .filter(Boolean)
            .join(', ');

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
                patient: patientId,
                test_type: 'MULTIPLE',
                test_description: selectedTestNames,
                urgency: labRequest.urgency,
                clinical_notes: labRequest.clinical_notes,
                selected_tests: labRequest.selected_tests,
              })
            }
          );
        }

        // Update patient status to completed after successful consultation
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/patients/${patientId}/status/`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'COMPLETED'
            })
          }
        );

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
              Lab Requests ({labRequest.selected_tests.length})
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
                      Symptoms & Examination *
                    </label>
                    <MedicalFormattingGuide field="symptoms" />
                  </div>
                  <textarea
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                    placeholder="SYMPTOMS:&#10;- Chief complaint: &#10;- Duration: &#10;- Severity: &#10;- Associated symptoms: &#10;&#10;EXAMINATION:&#10;- General appearance: &#10;- Vital signs: (see right panel)&#10;- System examination: &#10;- Positive findings: &#10;- Negative findings: "
                    value={formData.symptoms}
                    onChange={(e) => handleInputChange('symptoms', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Diagnosis *
                    </label>
                    <MedicalFormattingGuide field="diagnosis" />
                  </div>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                    placeholder="PRIMARY DIAGNOSIS:&#10;- &#10;&#10;DIFFERENTIAL DIAGNOSIS:&#10;- &#10;- "
                    value={formData.diagnosis}
                    onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Treatment Plan *
                    </label>
                    <MedicalFormattingGuide field="treatment" />
                  </div>
                  <textarea
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                    placeholder="IMMEDIATE TREATMENT:&#10;- &#10;&#10;MEDICATIONS:&#10;- (use Prescriptions tab for details)&#10;&#10;ADVICE & FOLLOW-UP:&#10;- &#10;- Return if: "
                    value={formData.treatment_plan}
                    onChange={(e) => handleInputChange('treatment_plan', e.target.value)}
                    required
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
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Vital Signs</h4>
                  <p className="text-xs text-gray-500 mb-3">Auto-populated from patient records. Modify if needed.</p>
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
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Laboratory Request Form</h3>
                <p className="text-sm text-gray-600">Select tests required for this patient</p>
              </div>

              {/* Test Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parasitology */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm">Parasitology</h4>
                  <div className="space-y-2">
                    {LAB_TESTS.PARASITOLOGY.map(test => (
                      <label key={test.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={labRequest.selected_tests.includes(test.id)}
                          onChange={() => toggleLabTest(test.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{test.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Microbiology */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm">Microbiology</h4>
                  <div className="space-y-2">
                    {LAB_TESTS.MICROBIOLOGY.map(test => (
                      <label key={test.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={labRequest.selected_tests.includes(test.id)}
                          onChange={() => toggleLabTest(test.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{test.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clinical Chemistry & Hematology */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm">Clinical Chemistry & Hematology</h4>
                  <div className="space-y-2">
                    {LAB_TESTS.CLINICAL_CHEMISTRY.map(test => (
                      <label key={test.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={labRequest.selected_tests.includes(test.id)}
                          onChange={() => toggleLabTest(test.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{test.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Hematology */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 uppercase text-sm">Hematology</h4>
                  <div className="space-y-2">
                    {LAB_TESTS.HEMATOLOGY.map(test => (
                      <label key={test.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={labRequest.selected_tests.includes(test.id)}
                          onChange={() => toggleLabTest(test.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{test.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Urgency and Clinical Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    value={labRequest.urgency}
                    onChange={(e) => updateLabRequestField('urgency', e.target.value)}
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="URGENT">Urgent</option>
                    <option value="STAT">STAT (Immediate)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tests Selected: {labRequest.selected_tests.length}
                  </label>
                  <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                    {labRequest.selected_tests.length === 0
                      ? 'No tests selected'
                      : `${labRequest.selected_tests.length} test(s) selected`
                    }
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinical Notes / Short Clinical Notes
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Clinical justification for requested tests..."
                  value={labRequest.clinical_notes}
                  onChange={(e) => updateLabRequestField('clinical_notes', e.target.value)}
                />
              </div>
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
                {saving ? 'Completing...' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}