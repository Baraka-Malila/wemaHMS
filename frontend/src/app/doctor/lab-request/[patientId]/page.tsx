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
  address?: string;
}

interface LabRequestFormData {
  // Patient info
  short_clinical_notes: string;

  // PARASITOLOGY TESTS
  mrdt_requested: boolean;
  bs_requested: boolean;
  stool_analysis_requested: boolean;
  urine_sed_requested: boolean;
  urinalysis_requested: boolean;

  // MICROBIOLOGY TESTS
  rpr_requested: boolean;
  h_pylori_requested: boolean;
  hepatitis_b_requested: boolean;
  hepatitis_c_requested: boolean;
  ssat_requested: boolean;
  upt_requested: boolean;

  // CLINICAL CHEMISTRY & HEMATOLOGY
  esr_requested: boolean;
  blood_grouping_requested: boolean;
  hb_requested: boolean;
  rheumatoid_factor_requested: boolean;
  rbg_requested: boolean;
  fbg_requested: boolean;
  sickling_test_requested: boolean;

  // Payment
  lab_fee_required: boolean;
  lab_fee_amount: string;
}

export default function LabRequestPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState<LabRequestFormData>({
    short_clinical_notes: '',

    // All tests default to false
    mrdt_requested: false,
    bs_requested: false,
    stool_analysis_requested: false,
    urine_sed_requested: false,
    urinalysis_requested: false,

    rpr_requested: false,
    h_pylori_requested: false,
    hepatitis_b_requested: false,
    hepatitis_c_requested: false,
    ssat_requested: false,
    upt_requested: false,

    esr_requested: false,
    blood_grouping_requested: false,
    hb_requested: false,
    rheumatoid_factor_requested: false,
    rbg_requested: false,
    fbg_requested: false,
    sickling_test_requested: false,

    lab_fee_required: true,
    lab_fee_amount: '0'
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
        alert('Failed to fetch patient data');
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const calculateLabFee = () => {
    // Test prices (in TZS) - can be configured later
    const testPrices: { [key: string]: number } = {
      mrdt_requested: 3000,
      bs_requested: 2500,
      stool_analysis_requested: 2000,
      urine_sed_requested: 1500,
      urinalysis_requested: 2000,
      rpr_requested: 5000,
      h_pylori_requested: 8000,
      hepatitis_b_requested: 15000,
      hepatitis_c_requested: 15000,
      ssat_requested: 5000,
      upt_requested: 3000,
      esr_requested: 2000,
      blood_grouping_requested: 3000,
      hb_requested: 2000,
      rheumatoid_factor_requested: 8000,
      rbg_requested: 2000,
      fbg_requested: 2000,
      sickling_test_requested: 5000
    };

    let total = 0;
    Object.keys(testPrices).forEach(testKey => {
      if (formData[testKey as keyof LabRequestFormData] === true) {
        total += testPrices[testKey];
      }
    });

    setFormData(prev => ({
      ...prev,
      lab_fee_amount: total.toString()
    }));
  };

  useEffect(() => {
    calculateLabFee();
  }, [
    formData.mrdt_requested, formData.bs_requested, formData.stool_analysis_requested,
    formData.urine_sed_requested, formData.urinalysis_requested, formData.rpr_requested,
    formData.h_pylori_requested, formData.hepatitis_b_requested, formData.hepatitis_c_requested,
    formData.ssat_requested, formData.upt_requested, formData.esr_requested,
    formData.blood_grouping_requested, formData.hb_requested, formData.rheumatoid_factor_requested,
    formData.rbg_requested, formData.fbg_requested, formData.sickling_test_requested
  ]);

  const getRequestedTestsCount = () => {
    const testFields = [
      'mrdt_requested', 'bs_requested', 'stool_analysis_requested',
      'urine_sed_requested', 'urinalysis_requested', 'rpr_requested',
      'h_pylori_requested', 'hepatitis_b_requested', 'hepatitis_c_requested',
      'ssat_requested', 'upt_requested', 'esr_requested',
      'blood_grouping_requested', 'hb_requested', 'rheumatoid_factor_requested',
      'rbg_requested', 'fbg_requested', 'sickling_test_requested'
    ];

    return testFields.filter(field => formData[field as keyof LabRequestFormData] === true).length;
  };

  const handleSubmitLabRequest = async () => {
    if (!patient || !currentUser) return;

    const requestedTests = getRequestedTestsCount();
    if (requestedTests === 0) {
      alert('Please select at least one test to request.');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');

      // First find or create a consultation for this patient
      const consultationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/consultations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: patient.patient_id,
          patient_name: patient.full_name,
          chief_complaint: 'Lab test request',
          status: 'IN_PROGRESS'
        })
      });

      let consultationId;
      if (consultationResponse.ok) {
        const consultationData = await consultationResponse.json();
        consultationId = consultationData.id;
      } else {
        throw new Error('Failed to create consultation for lab request');
      }

      // Create the lab request
      const labRequestData = {
        consultation_id: consultationId,
        patient_id: patient.patient_id,
        patient_name: patient.full_name,
        patient_age: patient.age,
        patient_sex: patient.gender,
        patient_address: patient.address || '',
        patient_phone: patient.phone_number,
        ...formData,
        lab_fee_amount: parseFloat(formData.lab_fee_amount || '0'),
        status: formData.lab_fee_required ? 'PENDING_PAYMENT' : 'REQUESTED'
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/lab-requests/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(labRequestData)
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Lab request created successfully! ${requestedTests} tests requested. ${formData.lab_fee_required ? `Total fee: ${formData.lab_fee_amount} TZS` : 'No fee required.'}`);

        // Redirect back to consultation or queue
        router.push(`/doctor/consultation/${patientId}`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to create lab request'}`);
      }
    } catch (error) {
      console.error('Error creating lab request:', error);
      alert('Network error while creating lab request');
    } finally {
      setSaving(false);
    }
  };

  const TestCheckbox = ({ name, label, category }: { name: keyof LabRequestFormData; label: string; category?: string }) => (
    <div className="flex items-center">
      <input
        type="checkbox"
        name={name}
        checked={formData[name] as boolean}
        onChange={handleInputChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        id={name}
      />
      <label htmlFor={name} className="ml-2 text-sm text-gray-700 cursor-pointer">
        {label}
      </label>
    </div>
  );

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
            <h1 className="text-2xl font-bold text-gray-900">Laboratory Request Form</h1>
            <p className="text-gray-600">Patient: {patient.full_name} ({patient.patient_id})</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            ← Back to Consultation
          </button>
        </div>
      </div>

      {/* Patient Header */}
      <div className="bg-blue-50 px-6 py-4 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Age:</span>
            <span className="ml-2">{patient.age}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Sex:</span>
            <span className="ml-2">{patient.gender}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Phone:</span>
            <span className="ml-2">{patient.phone_number}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Address:</span>
            <span className="ml-2">{patient.address || 'Not provided'}</span>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-6xl mx-auto p-6">

        {/* Clinical Notes */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Short Clinical Notes</h3>
          <textarea
            name="short_clinical_notes"
            value={formData.short_clinical_notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief clinical information for the lab technician..."
          />
        </div>

        {/* Test Selection - Matching Hospital Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* PARASITOLOGY */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center bg-gray-100 py-2 rounded">
              PARASITOLOGY
            </h3>
            <div className="space-y-3">
              <TestCheckbox name="mrdt_requested" label="MRDT" />
              <TestCheckbox name="bs_requested" label="BS" />
              <TestCheckbox name="stool_analysis_requested" label="STOOL ANALYSIS" />
              <div className="ml-4 text-sm text-gray-600">
                <div>Macro:</div>
                <div>Micro:</div>
              </div>
              <TestCheckbox name="urine_sed_requested" label="URINE SED" />
              <div className="ml-4 text-sm text-gray-600">
                <div>Macro:</div>
                <div>Micro:</div>
              </div>
              <TestCheckbox name="urinalysis_requested" label="URINALYSIS" />
              <div className="ml-4 text-xs text-gray-500 space-y-1">
                <div>Urobilinogen</div>
                <div>Glucose</div>
                <div>Bilirubin</div>
                <div>Ketones</div>
                <div>S. Gravity</div>
                <div>Blood</div>
                <div>pH</div>
                <div>Protein</div>
                <div>Nitrite</div>
                <div>Leucocytes</div>
              </div>
            </div>
          </div>

          {/* MICROBIOLOGY */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center bg-gray-100 py-2 rounded">
              MICROBIOLOGY
            </h3>
            <div className="space-y-3">
              <TestCheckbox name="rpr_requested" label="RPR" />
              <TestCheckbox name="h_pylori_requested" label="H. Pylori" />
              <TestCheckbox name="hepatitis_b_requested" label="Hepatitis B" />
              <TestCheckbox name="hepatitis_c_requested" label="Hepatitis C" />
              <TestCheckbox name="ssat_requested" label="SsAT" />
              <TestCheckbox name="upt_requested" label="UPT" />
            </div>
          </div>

          {/* CLINICAL CHEMISTRY & HEMATOLOGY */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center bg-gray-100 py-2 rounded">
              CLINICAL CHEMISTRY & HEMATOLOGY
            </h3>
            <div className="space-y-3">
              <TestCheckbox name="esr_requested" label="ESR" />
              <TestCheckbox name="blood_grouping_requested" label="B/Grouping" />
              <TestCheckbox name="hb_requested" label="Hb" />
              <TestCheckbox name="rheumatoid_factor_requested" label="Rheumatoid factor" />
              <TestCheckbox name="rbg_requested" label="RBG" />
              <TestCheckbox name="fbg_requested" label="FBG" />
              <TestCheckbox name="sickling_test_requested" label="Sickling test" />
            </div>
          </div>
        </div>

        {/* Summary & Payment */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tests Requested
              </label>
              <div className="text-2xl font-bold text-blue-600">
                {getRequestedTestsCount()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Lab Fee (TZS)
              </label>
              <div className="text-2xl font-bold text-green-600">
                {parseInt(formData.lab_fee_amount || '0').toLocaleString()}
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="lab_fee_required"
                checked={formData.lab_fee_required}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm font-medium text-gray-700">
                Payment required before testing
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {getRequestedTestsCount() === 0 ? (
                <span className="text-red-600">⚠ Select at least one test to proceed</span>
              ) : (
                <span className="text-green-600">✓ {getRequestedTestsCount()} tests selected</span>
              )}
            </div>
            <div className="space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitLabRequest}
                disabled={saving || getRequestedTestsCount() === 0}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Submitting...' : 'Submit Lab Request'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}