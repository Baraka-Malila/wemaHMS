'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Calendar,
  User,
  Clock,
  Tag,
  RefreshCw
} from 'lucide-react';
import auth from '@/lib/auth';
import DiagnosisModal from '@/components/DiagnosisModal';
import ConsultationDetailsModal from '@/components/ConsultationDetailsModal';

interface Consultation {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor: any;
  chief_complaint: string;
  symptoms: string;
  examination_findings?: string;
  diagnosis: string;
  treatment_plan: string;
  priority: string;
  status: string;
  consultation_date: string;
  follow_up_date?: string;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  doctor_notes?: string;
}

export default function Diagnoses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewDiagnosis, setShowNewDiagnosis] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editConsultationId, setEditConsultationId] = useState('');
  const [editPatientId, setEditPatientId] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewConsultation, setViewConsultation] = useState<Consultation | null>(null);

  // Load consultations from API
  const loadConsultations = async () => {
    try {
      setLoading(true);
      const token = auth.getToken();

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
        setConsultations(data.consultations || []);
        setError('');
      } else {
        setError('Failed to load consultations');
      }
    } catch (error) {
      setError('Error loading consultations');
      console.error('Error loading consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Edit consultation
  const handleEditConsultation = (consultation: Consultation) => {
    setEditConsultationId(consultation.id);
    setEditPatientId(consultation.patient_id);
    setEditModalOpen(true);
  };

  // View full consultation details
  const handleViewFull = (consultation: Consultation) => {
    setViewConsultation(consultation);
    setViewModalOpen(true);
  };

  useEffect(() => {
    loadConsultations();
  }, []);


  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Severe':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Mild':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      case 'Controlled':
        return 'bg-green-100 text-green-800';
      case 'Resolved':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = (consultation.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (consultation.patient_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (consultation.diagnosis || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (consultation.chief_complaint || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || consultation.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-100 rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-32 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-700">{error}</div>
          <button
            onClick={loadConsultations}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diagnoses</h1>
          <p className="text-sm text-gray-600">Manage patient diagnoses and treatment plans</p>
        </div>
        <button
          onClick={() => setShowNewDiagnosis(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Diagnosis</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name, ID, diagnosis, or ICD code..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Controlled">Controlled</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnoses Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredConsultations.map((consultation) => (
          <div
            key={consultation.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">
                      {(consultation.patient_name || 'N/A').split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{consultation.patient_name || 'N/A'}</h3>
                    <p className="text-sm text-gray-600">
                      {consultation.patient_id || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(consultation.status)}`}>
                    {consultation.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(consultation.consultation_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
              {/* Chief Complaint */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Chief Complaint</h4>
                <p className="text-sm text-gray-700">{consultation.chief_complaint || 'N/A'}</p>
              </div>

              {/* Primary Diagnosis */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Diagnosis</h4>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{consultation.diagnosis || 'Not yet diagnosed'}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getSeverityColor(consultation.priority)}`}>
                      {consultation.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Examination Findings */}
              {consultation.examination_findings && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Examination Findings</h4>
                  <p className="text-sm text-gray-700">{consultation.examination_findings}</p>
                </div>
              )}

              {/* Treatment Plan */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Treatment Plan</h4>
                <p className="text-sm text-gray-700">{consultation.treatment_plan || 'Not yet planned'}</p>
              </div>

              {/* Notes */}
              {consultation.doctor_notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Clinical Notes</h4>
                  <p className="text-sm text-gray-700">{consultation.doctor_notes}</p>
                </div>
              )}

              {/* Follow-up Date */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Follow-up:</span>
                  <span className="font-medium text-gray-900">
                    {consultation.follow_up_date ? new Date(consultation.follow_up_date).toLocaleDateString() : 'Not scheduled'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500 text-xs">
                    {new Date(consultation.consultation_date).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditConsultation(consultation)}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-md hover:bg-green-100 transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleViewFull(consultation)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View Full</span>
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {consultation.id}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredConsultations.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No diagnoses found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'No diagnoses recorded yet.'}
          </p>
        </div>
      )}

      {/* New Diagnosis Modal Placeholder */}
      {showNewDiagnosis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Diagnosis</h3>
            <p className="text-gray-600 mb-4">Diagnosis form will be implemented here.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewDiagnosis(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Diagnosis Modal */}
      <DiagnosisModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        patientId={editPatientId}
        consultationId={editConsultationId}
        onSave={() => {
          setEditModalOpen(false);
          loadConsultations();
        }}
      />

      {/* View Consultation Details Modal */}
      <ConsultationDetailsModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        consultation={viewConsultation}
      />
    </div>
  );
}
