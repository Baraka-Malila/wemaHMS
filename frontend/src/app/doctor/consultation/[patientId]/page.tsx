'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, FileText, DollarSign, Clock, AlertCircle } from 'lucide-react';
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
  // Vital signs already collected in reception
  weight?: number;
  height?: number;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  pulse_rate?: number;
}

interface SimplifiedConsultationData {
  // Simplified to 3 core fields as requested
  consultation_highlight: string;  // Main heading/highlight
  symptoms_and_findings: string;   // Combined symptoms and examination
  diagnosis_and_plan: string;      // Combined diagnosis and treatment

  // Essential meta fields
  follow_up_date?: string;
  priority: string;

  // Payment fields
  consultation_fee_required: boolean;
  consultation_fee_amount: string;
}

export default function SimplifiedConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Simplified form data - only 3 main fields
  const [formData, setFormData] = useState<SimplifiedConsultationData>({
    consultation_highlight: '',
    symptoms_and_findings: '',
    diagnosis_and_plan: '',
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
      } else {
        alert('Failed to load patient data');
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      alert('Error loading patient information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Input sanitization and validation
    let sanitizedValue = value;

    if (type === 'text' || type === 'textarea') {
      // Remove potentially dangerous characters but preserve medical text
      sanitizedValue = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
        .replace(/javascript:/gi, '') // Remove javascript: URLs
        .substring(0, name === 'consultation_highlight' ? 200 : 2000); // Limit length
    }

    if (name === 'consultation_fee_amount') {
      // Validate numeric input for fees
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0 || numValue > 50000) {
        return; // Don't update if invalid
      }
    }

    if (name === 'follow_up_date') {
      // Validate date is not in the past
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        alert('Follow-up date cannot be in the past');
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : sanitizedValue
    }));
  };

  const formatConsultationForAPI = () => {
    // Auto-format the consultation data with proper headings for backend storage
    const formattedNotes = `
## CONSULTATION SUMMARY

**Main Issue/Highlight:**
${formData.consultation_highlight}

**Symptoms & Clinical Findings:**
${formData.symptoms_and_findings}

**Diagnosis & Treatment Plan:**
${formData.diagnosis_and_plan}

**Follow-up:** ${formData.follow_up_date || 'None scheduled'}
**Priority:** ${formData.priority}
**Consultation Fee:** ${formData.consultation_fee_required ? `$${formData.consultation_fee_amount}` : 'None'}

---
*Generated: ${new Date().toLocaleString()}*
*Doctor: ${currentUser?.full_name}*
    `.trim();

    return {
      patient_id: patientId,
      patient_name: patient?.full_name,

      // Map to backend fields (auto-formatted)
      chief_complaint: formData.consultation_highlight,
      symptoms: formData.symptoms_and_findings,
      diagnosis: formData.diagnosis_and_plan,
      clinical_notes: formattedNotes, // Complete formatted consultation

      // Meta fields
      follow_up_date: formData.follow_up_date || null,
      priority: formData.priority,
      consultation_fee_required: formData.consultation_fee_required,
      consultation_fee_amount: parseFloat(formData.consultation_fee_amount) || 5000,

      // Remove duplicate vital signs - use what's already in reception
      // These will be pulled from patient record automatically
    };
  };

  const handleSaveConsultation = async () => {
    // Validate required fields
    if (!formData.consultation_highlight.trim()) {
      alert('Please provide a consultation highlight/summary');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      const consultationData = formatConsultationForAPI();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/consultations/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultationData)
      });

      if (response.ok) {
        alert('Consultation saved successfully!');

        // Process payment if required
        if (formData.consultation_fee_required) {
          await processConsultationPayment();
        }

        // Navigate back to queue
        router.push('/doctor/queue');
      } else {
        const errorData = await response.json();
        alert(`Error saving consultation: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving consultation:', error);
      alert('Error saving consultation. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const processConsultationPayment = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const paymentData = {
        patient_id: patientId,
        patient_name: patient?.full_name,
        amount: parseFloat(formData.consultation_fee_amount),
        consultation_id: 'temp-consultation-id' // Will be replaced with actual ID
      };

      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/finance/payments/consultation/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient information...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-600">Patient not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Consultation - {patient.full_name}</h1>
            <p className="text-gray-600">Patient ID: {patient.patient_id} • Age: {patient.age} • {patient.gender}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/doctor/queue')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Queue
            </button>
            <button
              onClick={handleSaveConsultation}
              disabled={saving}
              className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Consultation'}
            </button>
          </div>
        </div>
      </div>

      {/* Patient Vital Signs Display (Read-only - from reception) */}
      <div className="bg-blue-50 px-6 py-4 border-b">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Vital Signs (From Reception)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Temperature:</span>
            <span className="ml-1 text-gray-900">{patient.temperature || 'N/A'}°C</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">BP:</span>
            <span className="ml-1 text-gray-900">
              {patient.blood_pressure_systolic && patient.blood_pressure_diastolic
                ? `${patient.blood_pressure_systolic}/${patient.blood_pressure_diastolic}`
                : 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Pulse:</span>
            <span className="ml-1 text-gray-900">{patient.pulse_rate || 'N/A'} bpm</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Weight:</span>
            <span className="ml-1 text-gray-900">{patient.weight || 'N/A'} kg</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Height:</span>
            <span className="ml-1 text-gray-900">{patient.height || 'N/A'} cm</span>
          </div>
        </div>
      </div>

      {/* Simplified Consultation Form */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">

          {/* 1. Main Highlight/Heading */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Consultation Highlight / Main Issue *
            </label>
            <textarea
              name="consultation_highlight"
              value={formData.consultation_highlight}
              onChange={handleInputChange}
              rows={2}
              maxLength={200}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief summary of the main issue or consultation focus..."
              required
              spellCheck={true}
            />
            <p className="text-xs text-gray-500 mt-1">Brief headline of what this consultation is about</p>
          </div>

          {/* 2. Symptoms & Findings */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Symptoms & Clinical Findings
            </label>
            <textarea
              name="symptoms_and_findings"
              value={formData.symptoms_and_findings}
              onChange={handleInputChange}
              rows={6}
              maxLength={2000}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Patient symptoms, clinical examination findings, relevant history, etc. Write freely as you would on paper..."
              spellCheck={true}
            />
            <p className="text-xs text-gray-500 mt-1">Free-form documentation of symptoms and examination findings</p>
          </div>

          {/* 3. Diagnosis & Plan */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Diagnosis & Treatment Plan
            </label>
            <textarea
              name="diagnosis_and_plan"
              value={formData.diagnosis_and_plan}
              onChange={handleInputChange}
              rows={6}
              maxLength={2000}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Diagnosis, differential diagnosis, treatment plan, medications, recommendations, etc. Write freely..."
              spellCheck={true}
            />
            <p className="text-xs text-gray-500 mt-1">Combined diagnosis and treatment planning - write as you would on paper</p>
          </div>

          {/* Meta Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Follow-up Date
              </label>
              <input
                type="date"
                name="follow_up_date"
                value={formData.follow_up_date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority Level
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Consultation Fee
              </label>
              <div className="flex">
                <input
                  type="number"
                  name="consultation_fee_amount"
                  value={formData.consultation_fee_amount}
                  onChange={handleInputChange}
                  min="0"
                  max="50000"
                  step="500"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5000"
                  required
                />
                <span className="bg-gray-100 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md text-sm text-gray-600">
                  TSH
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveConsultation}
              disabled={saving || !formData.consultation_highlight.trim()}
              className="px-8 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-5 w-5" />
              {saving ? 'Saving Consultation...' : 'Complete Consultation'}
            </button>
          </div>
        </div>

        {/* Auto-formatting Info */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <FileText className="h-4 w-4 inline mr-1" />
            <strong>Auto-formatting:</strong> Your consultation will be automatically formatted with proper headings and structure for the patient file and future export.
          </p>
        </div>
      </div>
    </div>
  );
}