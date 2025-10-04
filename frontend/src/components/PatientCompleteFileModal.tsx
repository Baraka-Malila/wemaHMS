'use client';

import { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Activity,
  Pill,
  TestTube,
  DollarSign,
  Clock,
  User,
  Edit,
  Save,
  Plus,
  AlertCircle,
  CheckCircle,
  Calendar,
  Phone,
  MapPin,
  Heart
} from 'lucide-react';
import auth from '@/lib/auth';

interface PatientCompleteFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onUpdate?: () => void;
}

interface TimelineEvent {
  type: string;
  timestamp: string;
  title: string;
  status: string;
  provider: string;
  details: any;
}

interface PatientFileData {
  patient: any;
  consultations: any[];
  prescriptions: any[];
  lab_tests: any[];
  payments: any[];
  timeline: TimelineEvent[];
}

export default function PatientCompleteFileModal({
  isOpen,
  onClose,
  patientId,
  onUpdate
}: PatientCompleteFileModalProps) {
  const [fileData, setFileData] = useState<PatientFileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'consultations' | 'labs' | 'prescriptions' | 'payments'>('timeline');
  const [userRole, setUserRole] = useState('');

  // Quick action states
  const [addingNote, setAddingNote] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (isOpen && patientId) {
      loadCompleteFile();
      const user = auth.getUser();
      if (user) {
        setUserRole(user.role);
      }
    }
  }, [isOpen, patientId]);

  const loadCompleteFile = async () => {
    try {
      setLoading(true);
      setError('');
      const token = auth.getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(
        `${API_URL}/api/patients/${patientId}/complete-history/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFileData(data);
      } else {
        setError('Failed to load patient file');
      }
    } catch (error) {
      setError('Error loading patient file');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuickNote = async () => {
    if (!quickNote.trim()) return;

    try {
      setSavingNote(true);
      const token = auth.getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Save note based on user role
      let endpoint = '';
      let payload: any = {};

      if (userRole === 'DOCTOR') {
        // Add as consultation note
        endpoint = `${API_URL}/api/doctor/consultations/quick-note/`;
        payload = {
          patient_id: patientId,
          note: quickNote,
        };
      } else if (userRole === 'NURSING') {
        // Add as nursing note
        endpoint = `${API_URL}/api/nursing/notes/`;
        payload = {
          patient_id: patientId,
          note: quickNote,
        };
      } else if (userRole === 'LAB') {
        // Add as lab note
        endpoint = `${API_URL}/api/lab/notes/`;
        payload = {
          patient_id: patientId,
          note: quickNote,
        };
      }

      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setQuickNote('');
          setAddingNote(false);
          loadCompleteFile(); // Reload to show new note
          if (onUpdate) onUpdate();
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSavingNote(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return <Activity className="h-5 w-5 text-blue-600" />;
      case 'PRESCRIPTION':
        return <Pill className="h-5 w-5 text-purple-600" />;
      case 'LAB_TEST':
        return <TestTube className="h-5 w-5 text-green-600" />;
      case 'PAYMENT':
        return <DollarSign className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return 'border-blue-200 bg-blue-50';
      case 'PRESCRIPTION':
        return 'border-purple-200 bg-purple-50';
      case 'LAB_TEST':
        return 'border-green-200 bg-green-50';
      case 'PAYMENT':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: any = {
      'COMPLETED': 'bg-green-100 text-green-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PENDING_PAYMENT': 'bg-orange-100 text-orange-800',
      'PAID': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Complete Patient File</h2>
              <p className="text-blue-100 text-sm mt-1">
                {fileData?.patient ? `${fileData.patient.full_name} (${fileData.patient.patient_id})` : 'Loading...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading patient file...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={loadCompleteFile}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : fileData ? (
          <>
            {/* Patient Info Summary */}
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Age / Gender</p>
                    <p className="font-medium text-gray-900">{fileData.patient.age} / {fileData.patient.gender}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Phone</p>
                    <p className="font-medium text-gray-900">{fileData.patient.phone_number || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Status</p>
                    <p className="font-medium text-gray-900">{fileData.patient.current_status?.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 text-xs">Location</p>
                    <p className="font-medium text-gray-900">{fileData.patient.current_location || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-white">
              <div className="flex space-x-1 p-2">
                {[
                  { key: 'timeline', label: 'Timeline', count: fileData.timeline.length },
                  { key: 'consultations', label: 'Consultations', count: fileData.consultations.length },
                  { key: 'labs', label: 'Lab Tests', count: fileData.lab_tests.length },
                  { key: 'prescriptions', label: 'Prescriptions', count: fileData.prescriptions.length },
                  { key: 'payments', label: 'Payments', count: fileData.payments.length },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Timeline Tab */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  {/* Quick Action Bar */}
                  {['DOCTOR', 'NURSING', 'LAB'].includes(userRole) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      {!addingNote ? (
                        <button
                          onClick={() => setAddingNote(true)}
                          className="flex items-center space-x-2 text-blue-700 font-medium hover:text-blue-800"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Quick Note</span>
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <textarea
                            value={quickNote}
                            onChange={(e) => setQuickNote(e.target.value)}
                            placeholder={`Add a quick note as ${userRole}...`}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setAddingNote(false);
                                setQuickNote('');
                              }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveQuickNote}
                              disabled={savingNote || !quickNote.trim()}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {savingNote ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  <span>Save Note</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timeline Events */}
                  {fileData.timeline.length > 0 ? (
                    <div className="space-y-3">
                      {fileData.timeline.map((event, index) => (
                        <div
                          key={index}
                          className={`border-l-4 rounded-lg p-4 ${getEventColor(event.type)}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              {getEventIcon(event.type)}
                              <div>
                                <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                <div className="flex items-center space-x-3 mt-1">
                                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                                    <Clock className="h-3 w-3" />
                                    <span>{new Date(event.timestamp).toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-xs text-gray-600">
                                    <User className="h-3 w-3" />
                                    <span>{event.provider}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(event.status)}
                          </div>
                          {event.details && Object.keys(event.details).length > 0 && (
                            <div className="mt-3 pl-8 text-sm text-gray-700">
                              {Object.entries(event.details).map(([key, value]) => (
                                <div key={key} className="flex items-start space-x-2">
                                  <span className="font-medium text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                                  <span>{String(value) || 'N/A'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No timeline events yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Consultations Tab */}
              {activeTab === 'consultations' && (
                <div className="space-y-4">
                  {fileData.consultations.length > 0 ? (
                    fileData.consultations.map((consultation: any) => (
                      <div key={consultation.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{consultation.chief_complaint}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(consultation.consultation_date).toLocaleString()}
                            </p>
                          </div>
                          {getStatusBadge(consultation.status)}
                        </div>
                        {consultation.diagnosis && (
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-700">Diagnosis:</span>
                            <p className="text-sm text-gray-900">{consultation.diagnosis}</p>
                          </div>
                        )}
                        {consultation.treatment_plan && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Treatment Plan:</span>
                            <p className="text-sm text-gray-900">{consultation.treatment_plan}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No consultations recorded</p>
                    </div>
                  )}
                </div>
              )}

              {/* Lab Tests Tab */}
              {activeTab === 'labs' && (
                <div className="space-y-4">
                  {fileData.lab_tests.length > 0 ? (
                    fileData.lab_tests.map((lab: any) => (
                      <div key={lab.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">Lab Test Request</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(lab.requested_at).toLocaleString()}
                            </p>
                          </div>
                          {getStatusBadge(lab.status)}
                        </div>
                        <div className="text-sm text-gray-700">
                          <p>Requested by: {lab.requested_by_name || 'N/A'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No lab tests requested</p>
                    </div>
                  )}
                </div>
              )}

              {/* Prescriptions Tab */}
              {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                  {fileData.prescriptions.length > 0 ? (
                    fileData.prescriptions.map((prescription: any) => (
                      <div key={prescription.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{prescription.medication_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(prescription.prescribed_at).toLocaleString()}
                            </p>
                          </div>
                          {getStatusBadge(prescription.status)}
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                          <p><span className="font-medium">Dosage:</span> {prescription.dosage_instructions}</p>
                          <p><span className="font-medium">Duration:</span> {prescription.duration}</p>
                          <p><span className="font-medium">Quantity:</span> {prescription.quantity_prescribed}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Pill className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No prescriptions issued</p>
                    </div>
                  )}
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div className="space-y-4">
                  {fileData.payments.length > 0 ? (
                    fileData.payments.map((payment: any) => (
                      <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {payment.service_type.replace('_', ' ')} - TZS {parseFloat(payment.amount).toLocaleString()}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(payment.created_at).toLocaleString()}
                            </p>
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="text-sm text-gray-700">
                          <p><span className="font-medium">Method:</span> {payment.payment_method}</p>
                          {payment.receipt_number && (
                            <p><span className="font-medium">Receipt:</span> {payment.receipt_number}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No payments recorded</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Total Events:</span> {fileData.timeline.length} |
                <span className="ml-2 font-medium">Viewing as:</span> {userRole}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
