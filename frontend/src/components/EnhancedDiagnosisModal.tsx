'use client';

import React, { useState, useEffect } from 'react';
import { X, Stethoscope, Pill, TestTube, AlertCircle, Trash2 } from 'lucide-react';
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
  chief_complaint: string;
  symptoms: string;
  examination_findings: string;
  diagnosis: string;
  treatment_plan: string;
  general_advice: string;  // Non-medication recommendations
  follow_up_date: string;
  priority: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  doctor_notes: string;
}

interface PrescriptionData {
  medication_id?: string;  // Link to Medication database
  medication_name: string;
  generic_name: string;
  unit_price?: number;  // From medication database
  strength: string;
  dosage_form: string;
  frequency: string;
  dosage_instructions: string;
  duration: string;
  quantity_prescribed: number;
  special_instructions: string;
}

interface MedicationSearchResult {
  id: string;
  name: string;
  generic_name: string;
  category: string;
  current_stock: number;
  unit_price: string;
  stock_status: string;
}

interface LabRequestData {
  selected_tests: string[];
  urgency: string;
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
    chief_complaint: '',
    symptoms: '',
    examination_findings: '',
    diagnosis: '',
    treatment_plan: '',
    general_advice: '',
    follow_up_date: '',
    priority: 'NORMAL',
    temperature: undefined,
    blood_pressure_systolic: undefined,
    blood_pressure_diastolic: undefined,
    heart_rate: undefined,
    respiratory_rate: undefined,
    doctor_notes: ''
  });

  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [medicationSearch, setMedicationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<MedicationSearchResult[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchingMeds, setSearchingMeds] = useState(false);

  const [labRequest, setLabRequest] = useState<LabRequestData>({
    selected_tests: [],
    urgency: 'NORMAL',
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
        chief_complaint: '',
        symptoms: '',
        examination_findings: '',
        diagnosis: '',
        treatment_plan: '',
        general_advice: '',
        follow_up_date: '',
        priority: 'NORMAL',
        temperature: undefined,
        blood_pressure_systolic: undefined,
        blood_pressure_diastolic: undefined,
        heart_rate: undefined,
        respiratory_rate: undefined,
        doctor_notes: ''
      });
      setPrescriptions([]);
      setLabRequest({
        selected_tests: [],
        urgency: 'NORMAL',
      });
      setActiveConsultationId('');
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
        if (data.temperature || data.blood_pressure_systolic || data.pulse_rate || data.respiratory_rate) {
          setFormData(prev => ({
            ...prev,
            temperature: data.temperature || prev.temperature,
            blood_pressure_systolic: data.blood_pressure_systolic || prev.blood_pressure_systolic,
            blood_pressure_diastolic: data.blood_pressure_diastolic || prev.blood_pressure_diastolic,
            heart_rate: data.pulse_rate || prev.heart_rate,
            respiratory_rate: data.respiratory_rate || prev.respiratory_rate,
          }));
        }

        // Check if patient has an existing IN_PROGRESS consultation
        if (!consultationId) {
          console.log('🔍 Checking for existing IN_PROGRESS consultation for:', patientId);
          try {
            const consultationsResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/consultations/?patient_id=${patientId}&status=IN_PROGRESS`,
              {
                headers: {
                  'Authorization': `Token ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            console.log('Consultations API response status:', consultationsResponse.status);

            if (consultationsResponse.ok) {
              const consultationsData = await consultationsResponse.json();
              const consultations = Array.isArray(consultationsData) ? consultationsData : (consultationsData.results || []);

              console.log('Found consultations:', consultations.length);

              if (consultations.length > 0) {
                // Found existing IN_PROGRESS consultation - load it
                const existingConsultation = consultations[0];
                console.log('✅ Found existing IN_PROGRESS consultation:', existingConsultation.id);
                setActiveConsultationId(existingConsultation.id);

                // Load consultation data
                setFormData({
                  chief_complaint: existingConsultation.chief_complaint || '',
                  symptoms: existingConsultation.symptoms || '',
                  examination_findings: existingConsultation.examination_findings || '',
                  diagnosis: existingConsultation.diagnosis || '',
                  treatment_plan: existingConsultation.treatment_plan || '',
                  general_advice: existingConsultation.general_advice || '',
                  follow_up_date: existingConsultation.follow_up_date || '',
                  priority: existingConsultation.priority || 'NORMAL',
                  temperature: existingConsultation.temperature || undefined,
                  blood_pressure_systolic: existingConsultation.blood_pressure_systolic || undefined,
                  blood_pressure_diastolic: existingConsultation.blood_pressure_diastolic || undefined,
                  heart_rate: existingConsultation.heart_rate || undefined,
                  respiratory_rate: existingConsultation.respiratory_rate || undefined,
                  doctor_notes: existingConsultation.doctor_notes || ''
                });
              } else {
                console.log('ℹ️ No existing IN_PROGRESS consultation found for patient');
              }
            } else {
              console.error('Failed to fetch consultations:', consultationsResponse.status);
            }
          } catch (error) {
            console.error('Error checking for existing consultation:', error);
          }
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
          chief_complaint: data.chief_complaint || '',
          symptoms: data.symptoms || '',
          examination_findings: data.examination_findings || '',
          diagnosis: data.diagnosis || '',
          treatment_plan: data.treatment_plan || '',
          general_advice: data.general_advice || '',
          follow_up_date: data.follow_up_date || '',
          priority: data.priority || 'NORMAL',
          temperature: data.temperature || undefined,
          blood_pressure_systolic: data.blood_pressure_systolic || undefined,
          blood_pressure_diastolic: data.blood_pressure_diastolic || undefined,
          heart_rate: data.heart_rate || undefined,
          respiratory_rate: data.respiratory_rate || undefined,
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

  // Medication search function
  const searchMedications = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    try {
      setSearchingMeds(true);
      const token = auth.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/pharmacy/medications/available/?search=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.medications || []);
        setShowSearchDropdown(true);
      }
    } catch (error) {
      console.error('Error searching medications:', error);
    } finally {
      setSearchingMeds(false);
    }
  };

  // Add medication from search results
  // Extract strength from medication name (e.g., "Amoxil 500mg" → "500mg")
  const extractStrength = (name: string): string => {
    const strengthMatch = name.match(/(\d+\s*(mg|ml|g|mcg|%|iu|units?))/i);
    return strengthMatch ? strengthMatch[0] : '';
  };

  // Determine dosage form from medication name or category
  const guessDosageForm = (name: string, category: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('syrup') || nameLower.includes('suspension')) return 'syrup';
    if (nameLower.includes('injection') || nameLower.includes('vial')) return 'injection';
    if (nameLower.includes('cream') || nameLower.includes('ointment')) return 'cream';
    if (nameLower.includes('capsule')) return 'capsule';
    if (nameLower.includes('drops')) return 'drops';
    if (nameLower.includes('inhaler')) return 'inhaler';
    return 'tablet'; // Default
  };

  const addMedicationFromSearch = (med: MedicationSearchResult) => {
    // Check if already added
    const alreadyAdded = prescriptions.some(p => p.medication_id === med.id);
    if (alreadyAdded) {
      alert(`${med.name} is already in the prescription list. Please adjust the quantity instead.`);
      setMedicationSearch('');
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    // Extract strength and guess form
    const strength = extractStrength(med.name);
    const dosageForm = guessDosageForm(med.name, med.category);

    setPrescriptions(prev => [...prev, {
      medication_id: med.id,
      medication_name: med.name,
      generic_name: med.generic_name,
      unit_price: parseFloat(med.unit_price),
      strength: strength || '500mg', // Default if not found
      dosage_form: dosageForm,
      frequency: 'THREE_TIMES_DAILY',
      dosage_instructions: 'Take with water after meals',
      duration: '7 days',
      quantity_prescribed: 1,
      special_instructions: ''
    }]);

    // Clear search
    setMedicationSearch('');
    setSearchResults([]);
    setShowSearchDropdown(false);
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
    if (!formData.chief_complaint.trim()) {
      alert('Please enter the chief complaint.');
      return;
    }
    if (!formData.symptoms.trim()) {
      alert('Please enter patient findings.');
      return;
    }
    if (!formData.diagnosis.trim()) {
      alert('Please enter a diagnosis before completing consultation.');
      return;
    }
    if (!formData.follow_up_date) {
      alert('Please select a follow-up date. This is required for nursing follow-up calls.');
      return;
    }

    // Check if either lab requests, prescriptions, or general advice are provided
    const hasLabRequests = labRequest.selected_tests.length > 0;
    const hasPrescriptions = prescriptions.length > 0;
    const hasGeneralAdvice = formData.general_advice.trim().length > 0;

    // Must have at least one: lab requests OR prescriptions OR general advice
    if (!hasLabRequests && !hasPrescriptions && !hasGeneralAdvice) {
      alert('Please add prescriptions, order lab tests, or provide general advice to complete the consultation.');
      return;
    }

    try {
      setSaving(true);
      const token = auth.getToken();

      let consultationResponse;

      console.log('💾 Saving consultation - activeConsultationId:', activeConsultationId);

      if (activeConsultationId) {
        // Update existing consultation
        console.log('Updating existing consultation:', activeConsultationId);
        consultationResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/consultations/${activeConsultationId}/update/`,
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
              respiratory_rate: formData.respiratory_rate ? parseInt(formData.respiratory_rate.toString()) : null,
            })
          }
        );
      } else {
        // Create new consultation
        console.log('Creating new consultation for patient:', patientId);
        // Ensure patient_name is not empty
        const patientName = patient?.full_name || 'Unknown Patient';
        if (!patient?.full_name) {
          console.warn('Patient full_name not available, using fallback');
        }

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
              patient_name: patientName,
              ...formData,
              temperature: formData.temperature ? parseFloat(formData.temperature.toString()) : null,
              blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic.toString()) : null,
              blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic.toString()) : null,
              heart_rate: formData.heart_rate ? parseInt(formData.heart_rate.toString()) : null,
              respiratory_rate: formData.respiratory_rate ? parseInt(formData.respiratory_rate.toString()) : null,
            })
          }
        );
      }

      if (consultationResponse.ok) {
        const consultationData = await consultationResponse.json();
        const finalConsultationId = consultationData.consultation?.id || activeConsultationId;
        setActiveConsultationId(finalConsultationId);

        // If this is a NEW consultation (not update), update patient status to WITH_DOCTOR
        if (!activeConsultationId) {
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/patients/${patientId}/status/`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                status: 'WITH_DOCTOR'
              })
            }
          );
          console.log('✅ Patient status updated to WITH_DOCTOR');
        }

        // Create prescriptions
        for (const prescription of prescriptions) {
          if (prescription.medication_name.trim()) {
            // Validate required fields
            if (!prescription.strength || !prescription.strength.trim()) {
              console.error('Skipping prescription - missing strength:', prescription.medication_name);
              continue;
            }
            if (!prescription.dosage_form || !prescription.dosage_form.trim()) {
              console.error('Skipping prescription - missing dosage form:', prescription.medication_name);
              continue;
            }
            if (!prescription.dosage_instructions || !prescription.dosage_instructions.trim()) {
              console.error('Skipping prescription - missing dosage instructions:', prescription.medication_name);
              continue;
            }
            if (!prescription.duration || !prescription.duration.trim()) {
              console.error('Skipping prescription - missing duration:', prescription.medication_name);
              continue;
            }

            const prescriptionData = {
              consultation: finalConsultationId,
              medication_id: prescription.medication_id || null,
              medication_name: prescription.medication_name.trim(),
              generic_name: prescription.generic_name?.trim() || '',
              unit_price: prescription.unit_price || null,
              strength: prescription.strength.trim(),
              dosage_form: prescription.dosage_form.trim(),
              frequency: prescription.frequency,
              dosage_instructions: prescription.dosage_instructions.trim(),
              duration: prescription.duration.trim(),
              quantity_prescribed: parseInt(prescription.quantity_prescribed.toString()),
              special_instructions: prescription.special_instructions?.trim() || ''
            };

            console.log('Creating prescription:', prescriptionData);

            const prescriptionResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/prescriptions/`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Token ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(prescriptionData)
              }
            );

            if (!prescriptionResponse.ok) {
              const errorText = await prescriptionResponse.text();
              console.error('Failed to create prescription:', {
                status: prescriptionResponse.status,
                statusText: prescriptionResponse.statusText,
                error: errorText
              });
              try {
                const errorData = JSON.parse(errorText);
                console.error('Parsed error:', errorData);
              } catch (e) {
                console.error('Could not parse error as JSON');
              }
            } else {
              const savedPrescription = await prescriptionResponse.json();
              console.log('✅ Prescription created successfully:', savedPrescription);
            }
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

          // Convert selected_tests array to individual boolean fields for backend
          const testBooleans: any = {
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
          };

          // Map frontend test IDs to backend field names
          const testIdMapping: { [key: string]: string } = {
            // Parasitology
            'mrdt': 'mrdt_requested',
            'bs': 'bs_requested',
            'stool_macro': 'stool_analysis_requested',
            'stool_micro': 'stool_analysis_requested',
            'urine_sed_macro': 'urine_sed_requested',
            'urine_sed_micro': 'urine_sed_requested',
            'urinalysis': 'urinalysis_requested',

            // Clinical Chemistry (all part of urinalysis)
            'glucose': 'urinalysis_requested',
            'urobiliogen': 'urinalysis_requested',
            'bilirubin': 'urinalysis_requested',
            'ketones': 'urinalysis_requested',
            's_gravity': 'urinalysis_requested',
            'blood': 'urinalysis_requested',
            'ph': 'urinalysis_requested',
            'protein': 'urinalysis_requested',
            'nitrite': 'urinalysis_requested',
            'leucocytes': 'urinalysis_requested',

            // Microbiology
            'rpr': 'rpr_requested',
            'h_pylori': 'h_pylori_requested',
            'hepatitis_b': 'hepatitis_b_requested',
            'hepatitis_c': 'hepatitis_c_requested',
            'ssat': 'ssat_requested',
            'upt': 'upt_requested',

            // Hematology
            'esr': 'esr_requested',
            'b_grouping': 'blood_grouping_requested',
            'hb': 'hb_requested',
            'rheumatoid_factor': 'rheumatoid_factor_requested',
            'rbg': 'rbg_requested',
            'fbg': 'fbg_requested',
            'sickling_test': 'sickling_test_requested',
          };

          console.log('🔍 Selected tests from UI:', labRequest.selected_tests);

          labRequest.selected_tests.forEach(testId => {
            const backendField = testIdMapping[testId];
            if (backendField) {
              testBooleans[backendField] = true;
              console.log(`✅ Mapped ${testId} → ${backendField}`);
            } else {
              console.error(`❌ No mapping found for test ID: ${testId}`);
            }
          });

          console.log('📋 Final test booleans:', testBooleans);
          console.log('Creating lab request:', {
            consultation_id: finalConsultationId,
            patient_id: patientId,
            patient_name: patient?.full_name,
            patient_age: patient?.age,
            patient_sex: patient?.gender,
            tests: testBooleans,
            urgency: labRequest.urgency
          });

          const labResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/lab-requests/`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                consultation_id: finalConsultationId,
                patient_id: patientId,
                patient_name: patient?.full_name || 'Unknown',
                patient_age: patient?.age || 0,
                patient_sex: patient?.gender || 'UNKNOWN',
                short_clinical_notes: formData.chief_complaint || '',
                ...testBooleans,
                lab_fee_required: true,
                status: 'REQUESTED',
              })
            }
          );

          if (!labResponse.ok) {
            const errorText = await labResponse.text();
            console.error('❌ Failed to create lab request:', {
              status: labResponse.status,
              statusText: labResponse.statusText,
              error: errorText,
              sentData: {
                consultation_id: finalConsultationId,
                patient_id: patientId,
                patient_name: patient?.full_name || 'Unknown',
                patient_age: patient?.age || 0,
                patient_sex: patient?.gender || 'UNKNOWN',
                tests: testBooleans
              }
            });
            throw new Error(`Lab request failed: ${errorText}`);
          } else {
            const savedLabRequest = await labResponse.json();
            console.log('✅ Lab request created successfully:', savedLabRequest);
          }
        }

        // ===== COMPLETE CONSULTATION AND AUTO-CREATE PAYMENT =====
        // Call complete_consultation endpoint to:
        // 1. Mark consultation as COMPLETED
        // 2. Auto-create PENDING consultation payment (5,000 TZS)
        // 3. Update patient status to PENDING_CONSULTATION_PAYMENT
        const completeResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/consultations/complete/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              consultation_id: finalConsultationId
            })
          }
        );

        if (!completeResponse.ok) {
          console.error('Failed to complete consultation and create payment');
          console.error('Response status:', completeResponse.status);
          console.error('Response statusText:', completeResponse.statusText);
          
          try {
            const errorData = await completeResponse.json();
            console.error('Error data:', errorData);
            alert(`Warning: Consultation saved but payment creation failed: ${errorData.error || errorData.detail || 'Unknown error'}`);
          } catch (jsonError) {
            // If response is not JSON, try text
            const errorText = await completeResponse.text();
            console.error('Error text:', errorText);
            alert(`Warning: Consultation saved but payment creation failed: ${completeResponse.status} ${completeResponse.statusText}`);
          }
        } else {
          console.log('✅ Consultation completed and payment created successfully');
        }

        // Determine success message based on what was ordered
        let statusMessage = 'Consultation completed successfully!';

        if (hasLabRequests && hasPrescriptions) {
          statusMessage = 'Consultation completed.\nPatient → FINANCE (pay consultation + labs + medications)';
        } else if (hasLabRequests) {
          statusMessage = 'Consultation completed.\nPatient → FINANCE (pay consultation + lab tests)';
        } else if (hasPrescriptions) {
          statusMessage = 'Consultation completed.\nPatient → FINANCE (pay consultation + medications)';
        } else {
          statusMessage = 'Consultation completed.\nPatient → FINANCE (pay consultation fee: 5,000 TZS)';
        }

        alert(statusMessage);
        onSave?.();
        onClose();
      } else {
        const errorData = await consultationResponse.json();
        console.error('Consultation save error:', errorData);

        // Format validation errors
        let errorMessage = 'Error saving consultation:\n';
        if (typeof errorData === 'object') {
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              errorMessage += `${key}: ${errorData[key].join(', ')}\n`;
            } else {
              errorMessage += `${key}: ${errorData[key]}\n`;
            }
          });
        } else {
          errorMessage += errorData.error || 'Please try again';
        }

        alert(errorMessage);
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
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {currentTab === 'consultation' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chief Complaint *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    value={formData.chief_complaint}
                    onChange={(e) => handleInputChange('chief_complaint', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Patient Findings *
                    </label>
                    <MedicalFormattingGuide field="symptoms" />
                  </div>
                  <textarea
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 font-mono text-sm"
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
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                    value={formData.diagnosis}
                    onChange={(e) => handleInputChange('diagnosis', e.target.value)}
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
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Respiratory Rate (breaths/min)</label>
                      <input
                        type="number"
                        placeholder="16"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                        value={formData.respiratory_rate || ''}
                        onChange={(e) => handleInputChange('respiratory_rate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Required for nursing follow-up calls)</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    value={formData.follow_up_date}
                    onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Private Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    value={formData.doctor_notes}
                    onChange={(e) => handleInputChange('doctor_notes', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'prescriptions' && (
            <div className="space-y-8">
              {/* Section 1: General Advice (Non-Medication Recommendations) */}
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      General Advice
                    </h3>
                    <p className="text-sm text-gray-600">
                      Use this section for advice that doesn't require medication (rest, diet, lifestyle)
                    </p>
                  </div>
                </div>
                <div>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Examples: Rest for 3 days, drink plenty of water (2L/day), light exercise 30min daily, avoid spicy foods, reduce salt intake..."
                    value={formData.general_advice}
                    onChange={(e) => handleInputChange('general_advice', e.target.value)}
                  />
                </div>
              </div>

              {/* Section 2: Medication Prescriptions */}
              <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Medication Prescriptions
                    </h3>
                    <p className="text-sm text-gray-600">
                      Add prescribed medications that need to be dispensed by the pharmacy
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Medication Search */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Medications
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={medicationSearch}
                        onChange={(e) => {
                          setMedicationSearch(e.target.value);
                          searchMedications(e.target.value);
                        }}
                        onFocus={() => {
                          if (searchResults.length > 0) setShowSearchDropdown(true);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        placeholder="Search by medication name, generic name, or barcode..."
                      />
                      {searchingMeds && (
                        <div className="absolute right-3 top-2.5">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        </div>
                      )}

                      {/* Search Results Dropdown */}
                      {showSearchDropdown && searchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {searchResults.map((med) => (
                            <button
                              key={med.id}
                              onClick={() => addMedicationFromSearch(med)}
                              className="w-full px-4 py-3 text-left hover:bg-green-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-900">{med.name}</p>
                                  <p className="text-sm text-gray-600">{med.generic_name}</p>
                                  <p className="text-xs text-gray-500 mt-1">{med.category}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-green-600">{parseFloat(med.unit_price).toLocaleString()} TZS</p>
                                  <p className="text-xs text-gray-500">Stock: {med.current_stock}</p>
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    med.stock_status === 'available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {med.stock_status}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prescription Summary */}
                  {prescriptions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-blue-900">
                          Total Medications: {prescriptions.length}
                        </p>
                        <p className="text-lg font-bold text-blue-900">
                          Total Cost: {prescriptions.reduce((sum, p) => sum + ((p.unit_price || 0) * p.quantity_prescribed), 0).toLocaleString()} TZS
                        </p>
                      </div>
                    </div>
                  )}

                  {prescriptions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-300">
                      <Pill className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No medications prescribed yet.</p>
                      <p className="text-sm mt-1">Search and select medications from the database above.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {prescriptions.map((prescription, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          {/* Medication Header */}
                          <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-200">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg">{prescription.medication_name}</h4>
                              <p className="text-sm text-gray-600">{prescription.generic_name}</p>
                              {prescription.unit_price && (
                                <p className="text-sm text-green-600 font-medium mt-1">
                                  {prescription.unit_price.toLocaleString()} TZS × {prescription.quantity_prescribed} = {(prescription.unit_price * prescription.quantity_prescribed).toLocaleString()} TZS
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removePrescription(index)}
                              className="text-red-600 hover:text-red-800 ml-4"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          {/* Prescription Details - Compact Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Strength *</label>
                              <input
                                type="text"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                placeholder="500mg"
                                value={prescription.strength}
                                onChange={(e) => updatePrescription(index, 'strength', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Form *</label>
                              <input
                                type="text"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                placeholder="tablet"
                                value={prescription.dosage_form}
                                onChange={(e) => updatePrescription(index, 'dosage_form', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Frequency *</label>
                              <select
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                value={prescription.frequency}
                                onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                              >
                                {FREQUENCY_OPTIONS.map(option => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity *</label>
                              <input
                                type="number"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                placeholder="15"
                                value={prescription.quantity_prescribed || ''}
                                onChange={(e) => updatePrescription(index, 'quantity_prescribed', parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Duration *</label>
                              <input
                                type="text"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                placeholder="5 days"
                                value={prescription.duration}
                                onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                              />
                            </div>
                            <div className="col-span-2 md:col-span-3">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Instructions *</label>
                              <input
                                type="text"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                placeholder="Take after meals with water"
                                value={prescription.dosage_instructions}
                                onChange={(e) => updatePrescription(index, 'dosage_instructions', e.target.value)}
                              />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Special Notes</label>
                              <input
                                type="text"
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                                placeholder="Optional"
                                value={prescription.special_instructions}
                                onChange={(e) => updatePrescription(index, 'special_instructions', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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

              {/* Urgency Level */}
              <div className="mt-6">
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