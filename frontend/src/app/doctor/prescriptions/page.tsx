'use client';

import { useState } from 'react';
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
  FileText
} from 'lucide-react';

export default function Prescriptions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewPrescription, setShowNewPrescription] = useState(false);

  // Mock prescriptions data
  const prescriptions = [
    {
      id: 'RX001',
      patientId: 'PAT001',
      patientName: 'John Doe',
      age: 35,
      gender: 'Male',
      prescriptionDate: '2025-09-07',
      diagnosis: 'Hypertensive Heart Disease',
      status: 'ACTIVE',
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take with or without food. Monitor blood pressure.',
          quantity: '30 tablets'
        },
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with meals to reduce stomach upset.',
          quantity: '60 tablets'
        }
      ],
      notes: 'Patient counseled on lifestyle modifications. Follow-up in 2 weeks.',
      followUpDate: '2025-09-21',
      dispensedDate: null,
      dispensedBy: null,
      prescribedBy: 'Dr. Smith',
      allergies: 'Penicillin',
      totalCost: '25000',
      createdAt: '2025-09-07T10:30:00Z'
    },
    {
      id: 'RX002',
      patientId: 'PAT002',
      patientName: 'Mary Johnson',
      age: 28,
      gender: 'Female',
      prescriptionDate: '2025-09-07',
      diagnosis: 'Migraine without Aura',
      status: 'DISPENSED',
      medications: [
        {
          name: 'Sumatriptan',
          dosage: '50mg',
          frequency: 'As needed',
          duration: '6 tablets',
          instructions: 'Take at onset of migraine. Maximum 2 doses per 24 hours.',
          quantity: '6 tablets'
        },
        {
          name: 'Propranolol',
          dosage: '40mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take for migraine prevention. Do not stop abruptly.',
          quantity: '60 tablets'
        }
      ],
      notes: 'Patient educated on migraine triggers. Diary recommended.',
      followUpDate: '2025-09-14',
      dispensedDate: '2025-09-07T15:30:00Z',
      dispensedBy: 'Pharmacist Jane',
      prescribedBy: 'Dr. Smith',
      allergies: 'None known',
      totalCost: '18000',
      createdAt: '2025-09-07T11:15:00Z'
    },
    {
      id: 'RX003',
      patientId: 'PAT003',
      patientName: 'David Smith',
      age: 42,
      gender: 'Male',
      prescriptionDate: '2025-09-06',
      diagnosis: 'Essential Hypertension, Dyslipidemia',
      status: 'DISPENSED',
      medications: [
        {
          name: 'Amlodipine',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take at the same time each day, preferably in the morning.',
          quantity: '30 tablets'
        },
        {
          name: 'Atorvastatin',
          dosage: '20mg',
          frequency: 'Once daily at bedtime',
          duration: '30 days',
          instructions: 'Take with or without food. Avoid grapefruit juice.',
          quantity: '30 tablets'
        }
      ],
      notes: 'Good compliance with previous medications. Continue current regimen.',
      followUpDate: '2025-10-06',
      dispensedDate: '2025-09-06T16:45:00Z',
      dispensedBy: 'Pharmacist John',
      prescribedBy: 'Dr. Smith',
      allergies: 'Aspirin',
      totalCost: '22000',
      createdAt: '2025-09-06T14:20:00Z'
    },
    {
      id: 'RX004',
      patientId: 'PAT004',
      patientName: 'Sarah Wilson',
      age: 55,
      gender: 'Female',
      prescriptionDate: '2025-09-05',
      diagnosis: 'Type 2 Diabetes Mellitus',
      status: 'PENDING',
      medications: [
        {
          name: 'Metformin XR',
          dosage: '1000mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with dinner to reduce GI side effects.',
          quantity: '60 tablets'
        },
        {
          name: 'Insulin Glargine',
          dosage: '20 units',
          frequency: 'Once daily at bedtime',
          duration: '30 days',
          instructions: 'Rotate injection sites. Store in refrigerator.',
          quantity: '1 vial (10ml)'
        }
      ],
      notes: 'HbA1c elevated. Insulin therapy initiated. Patient education provided.',
      followUpDate: '2025-09-19',
      dispensedDate: null,
      dispensedBy: null,
      prescribedBy: 'Dr. Smith',
      allergies: 'None known',
      totalCost: '45000',
      createdAt: '2025-09-05T09:45:00Z'
    },
    {
      id: 'RX005',
      patientId: 'PAT005',
      patientName: 'Michael Brown',
      age: 67,
      gender: 'Male',
      prescriptionDate: '2025-09-07',
      diagnosis: 'Acute Myocardial Infarction',
      status: 'URGENT',
      medications: [
        {
          name: 'Aspirin',
          dosage: '81mg',
          frequency: 'Once daily',
          duration: 'Ongoing',
          instructions: 'Take with food to reduce stomach irritation.',
          quantity: '30 tablets'
        },
        {
          name: 'Clopidogrel',
          dosage: '75mg',
          frequency: 'Once daily',
          duration: '12 months',
          instructions: 'Take at the same time each day. Do not skip doses.',
          quantity: '30 tablets'
        },
        {
          name: 'Atorvastatin',
          dosage: '80mg',
          frequency: 'Once daily at bedtime',
          duration: 'Ongoing',
          instructions: 'High-intensity statin therapy. Monitor liver function.',
          quantity: '30 tablets'
        }
      ],
      notes: 'CRITICAL: Post-MI medications. Patient requires immediate pharmacy attention.',
      followUpDate: '2025-09-10',
      dispensedDate: null,
      dispensedBy: null,
      prescribedBy: 'Dr. Smith',
      allergies: 'Sulfa drugs',
      totalCost: '35000',
      createdAt: '2025-09-07T12:00:00Z'
    }
  ];

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
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                      {prescription.patientName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{prescription.patientName}</h3>
                    <p className="text-sm text-gray-600">
                      {prescription.patientId} • {prescription.age}y {prescription.gender}
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
                <p className="text-sm text-gray-700">{prescription.diagnosis}</p>
              </div>

              {/* Medications */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Medications ({prescription.medications.length})</h4>
                <div className="space-y-3">
                  {prescription.medications.map((medication, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{medication.name}</h5>
                        <span className="text-sm text-gray-600">{medication.quantity}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">Dosage:</span> {medication.dosage}
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span> {medication.frequency}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {medication.duration}
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 italic">{medication.instructions}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {prescription.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Clinical Notes</h4>
                  <p className={`text-sm ${prescription.status === 'URGENT' ? 'text-red-700 font-medium' : 'text-gray-700'}`}>
                    {prescription.notes}
                  </p>
                </div>
              )}

              {/* Allergies */}
              {prescription.allergies && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <h4 className="text-sm font-medium text-yellow-900">Allergies</h4>
                  </div>
                  <p className="text-sm text-yellow-800 mt-1">{prescription.allergies}</p>
                </div>
              )}

              {/* Prescription Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Prescribed by</p>
                  <p className="font-medium">{prescription.prescribedBy}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Cost</p>
                  <p className="font-medium">TZS {parseInt(prescription.totalCost).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Prescription Date</p>
                  <p className="font-medium">{new Date(prescription.prescriptionDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Follow-up</p>
                  <p className="font-medium">{new Date(prescription.followUpDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Dispensing Information */}
              {prescription.dispensedDate && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <h4 className="text-sm font-medium text-green-900">Dispensed</h4>
                  </div>
                  <div className="text-sm text-green-800">
                    <p>By: {prescription.dispensedBy}</p>
                    <p>Date: {new Date(prescription.dispensedDate).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Card Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors">
                    <Eye className="h-3 w-3" />
                    <span>View Full</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-md hover:bg-green-100 transition-colors">
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                    <FileText className="h-3 w-3" />
                    <span>Print</span>
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(prescription.createdAt).toLocaleString()}
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
    </div>
  );
}
