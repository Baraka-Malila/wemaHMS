'use client';

import { useState, useEffect } from 'react';
import {
  Pill,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  FileText,
  RefreshCw
} from 'lucide-react';
import auth from '@/lib/auth';
import PrescriptionDetailsModal from '@/components/PrescriptionDetailsModal';

export default function Prescriptions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load prescriptions from API
  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const token = auth.getToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/doctor/prescriptions/list/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data.prescriptions || []);
        setError('');
      } else {
        setError('Failed to load prescriptions');
      }
    } catch (error) {
      setError('Error loading prescriptions');
      console.error('Error loading prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions();
  }, []);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  // Handle button actions
  const handleEditPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
    setEditModalOpen(true);
  };

  const handleViewPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
    setViewModalOpen(true);
  };

  const handlePrintPrescription = (prescription: any) => {
    // Create a printable version
    const printContent = `
PRESCRIPTION

Patient: ${prescription.consultation?.patient_name || 'N/A'}
Patient ID: ${prescription.consultation?.patient_id || 'N/A'}
Date: ${new Date(prescription.prescribed_at).toLocaleDateString()}

Medication: ${prescription.medication_name}
Strength: ${prescription.strength}
Form: ${prescription.dosage_form}
Quantity: ${prescription.quantity_prescribed}

Instructions: ${prescription.dosage_instructions}
Duration: ${prescription.duration}
Frequency: ${prescription.frequency_display || prescription.frequency}

${prescription.special_instructions ? 'Special Instructions: ' + prescription.special_instructions : ''}

Prescribed by: ${prescription.prescribed_by?.full_name || 'Doctor'}
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Prescription</title></head>
          <body>
            <pre style="font-family: monospace; white-space: pre-wrap;">${printContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DISPENSED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'DISPENSED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'URGENT':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = (prescription.consultation?.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (prescription.consultation?.patient_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.medications.some(med => 
                           med.name.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = prescriptions.filter(p => p.status === 'ACTIVE').length;
  const pendingCount = prescriptions.filter(p => p.status === 'PENDING').length;
  const urgentCount = prescriptions.filter(p => p.status === 'URGENT').length;
  const dispensedToday = prescriptions.filter(p => 
    p.status === 'DISPENSED' && 
    p.dispensedDate && 
    new Date(p.dispensedDate).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-sm text-gray-600">Manage patient prescriptions and medications</p>
        </div>
        <button
          onClick={() => setShowNewPrescription(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Prescription</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dispensed Today</p>
              <p className="text-2xl font-bold text-green-600">{dispensedToday}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name, ID, prescription ID, diagnosis, or medication..."
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
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="URGENT">Urgent</option>
                <option value="DISPENSED">Dispensed</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredPrescriptions.map((prescription) => (
          <div
            key={prescription.id}
            className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden ${
              prescription.status === 'URGENT' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
            }`}
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">
                      {(prescription.consultation?.patient_name || 'N/A').split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{prescription.consultation?.patient_name || 'N/A'}</h3>
                    <p className="text-sm text-gray-600">
                      {prescription.consultation?.patient_id || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(prescription.status)}`}>
                    {getStatusIcon(prescription.status)}
                    <span>{prescription.status}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    RX: {prescription.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
              {/* Diagnosis */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Diagnosis</h4>
                <p className="text-sm text-gray-700">{prescription.consultation?.diagnosis || 'N/A'}</p>
              </div>

              {/* Medication Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Medication</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{prescription.medication_name || 'N/A'}</h5>
                    <span className="text-sm text-gray-600">{prescription.quantity_prescribed || 0} {prescription.dosage_form || ''}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                    <div>
                      <span className="font-medium">Strength:</span> {prescription.strength || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Frequency:</span> {prescription.frequency_display || prescription.frequency || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {prescription.duration || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Form:</span> {prescription.dosage_form || 'N/A'}
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 italic">{prescription.dosage_instructions || 'No specific instructions'}</p>
                  {prescription.special_instructions && (
                    <p className="text-xs text-blue-700 mt-1">
                      <span className="font-medium">Special:</span> {prescription.special_instructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {prescription.special_instructions && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Clinical Notes</h4>
                  <p className={`text-sm ${prescription.status === 'URGENT' ? 'text-red-700 font-medium' : 'text-gray-700'}`}>
                    {prescription.special_instructions}
                  </p>
                </div>
              )}

              {/* Allergies */}
              {prescription.consultation?.patient_allergies && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <h4 className="text-sm font-medium text-yellow-900">Allergies</h4>
                  </div>
                  <p className="text-sm text-yellow-800 mt-1">{prescription.consultation?.patient_allergies}</p>
                </div>
              )}

              {/* Prescription Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Prescribed by</p>
                  <p className="font-medium">{prescription.prescribed_by?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Cost</p>
                  <p className="font-medium">Qty: {prescription.quantity_prescribed || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Prescription Date</p>
                  <p className="font-medium">{new Date(prescription.prescribed_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Follow-up</p>
                  <p className="font-medium">{prescription.consultation?.follow_up_date ? new Date(prescription.consultation.follow_up_date).toLocaleDateString() : 'Not scheduled'}</p>
                </div>
              </div>

              {/* Dispensing Information */}
              {prescription.dispensed_at && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <h4 className="text-sm font-medium text-green-900">Dispensed</h4>
                  </div>
                  <div className="text-sm text-green-800">
                    <p>By: {prescription.dispensed_by?.full_name || 'N/A'}</p>
                    <p>Date: {new Date(prescription.dispensed_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Card Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewPrescription(prescription)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View Full</span>
                  </button>
                  <button
                    onClick={() => handleEditPrescription(prescription)}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-md hover:bg-green-100 transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handlePrintPrescription(prescription)}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Print</span>
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(prescription.prescribed_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPrescriptions.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Pill className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'No prescriptions have been created yet.'}
          </p>
        </div>
      )}

      {/* New Prescription Modal Placeholder */}
      {showNewPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Prescription</h3>
            <p className="text-gray-600 mb-4">Prescription form will be implemented here.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewPrescription(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800">
                Create Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Details Modal */}
      <PrescriptionDetailsModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        prescription={selectedPrescription}
      />

      {/* Edit Modal Placeholder */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Prescription</h3>
            <p className="text-gray-600 mb-4">
              Prescription editing functionality would be implemented here with proper form fields.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
