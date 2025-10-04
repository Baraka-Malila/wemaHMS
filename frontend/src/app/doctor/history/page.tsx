'use client';

import { useState, useEffect } from 'react';
import {
  History,
  Search,
  FileText,
  User,
  RefreshCw,
  Eye,
  Activity
} from 'lucide-react';
import auth from '@/lib/auth';
import PatientCompleteFileModal from '@/components/PatientCompleteFileModal';

export default function PatientHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Complete File Modal
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // Load patient history from API (aggregated by patient)
  const loadPatientHistory = async () => {
    try {
      setLoading(true);
      const token = auth.getToken();

      // Get all consultations and group by patient
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/consultations/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Transform consultations into patient list
        const patientsMap = new Map();
        data.consultations.forEach((consultation: any) => {
          if (!patientsMap.has(consultation.patient_id)) {
            patientsMap.set(consultation.patient_id, {
              patient_id: consultation.patient_id,
              patient_name: consultation.patient_name,
              visit_count: 0,
              last_visit: consultation.consultation_date,
            });
          }
          const patient = patientsMap.get(consultation.patient_id);
          patient.visit_count++;

          // Update last visit if this consultation is more recent
          if (new Date(consultation.consultation_date) > new Date(patient.last_visit)) {
            patient.last_visit = consultation.consultation_date;
          }
        });

        setPatients(Array.from(patientsMap.values()));
        setError('');
      } else {
        setError('Failed to load patient history');
      }
    } catch (error) {
      setError('Error loading patient history');
      console.error('Error loading patient history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientHistory();
  }, []);

  const handleViewCompleteFile = (patientId: string) => {
    setSelectedPatientId(patientId);
    setFileModalOpen(true);
  };

  // Filter patients by search term
  const filteredPatients = patients.filter(patient =>
    patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient History</h1>
          <p className="text-sm text-gray-600">Access comprehensive patient medical records and visit history</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients by name or ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <RefreshCw className="mx-auto h-12 w-12 text-green-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading patient history...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Patient List */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient.patient_id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{patient.patient_name}</h3>
                  <p className="text-sm text-gray-600">{patient.patient_id}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{patient.visit_count} {patient.visit_count === 1 ? 'visit' : 'visits'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <History className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">Last visit: {new Date(patient.last_visit).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewCompleteFile(patient.patient_id)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Complete File</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && filteredPatients.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'No patient records available yet.'}
          </p>
        </div>
      )}

      {/* Patient Complete File Modal */}
      <PatientCompleteFileModal
        isOpen={fileModalOpen}
        onClose={() => setFileModalOpen(false)}
        patientId={selectedPatientId}
        onUpdate={loadPatientHistory}
      />
    </div>
  );
}
