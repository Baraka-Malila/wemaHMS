'use client';

import { useState } from 'react';
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
  Tag
} from 'lucide-react';

export default function Diagnoses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewDiagnosis, setShowNewDiagnosis] = useState(false);

  // Mock diagnoses data
  const diagnoses = [
    {
      id: 'DIAG001',
      patientId: 'PAT001',
      patientName: 'John Doe',
      age: 35,
      gender: 'Male',
      diagnosisDate: '2025-09-07',
      chiefComplaint: 'Chest pain and shortness of breath',
      primaryDiagnosis: 'Hypertensive Heart Disease',
      secondaryDiagnosis: 'Type 2 Diabetes Mellitus',
      icdCode: 'I11.9',
      severity: 'Moderate',
      status: 'Active',
      treatmentPlan: 'ACE inhibitor therapy, lifestyle modifications, regular monitoring',
      followUpDate: '2025-09-21',
      notes: 'Patient shows good compliance with medication. Blood pressure well controlled.',
      createdAt: '2025-09-07T10:30:00Z'
    },
    {
      id: 'DIAG002',
      patientId: 'PAT002',
      patientName: 'Mary Johnson',
      age: 28,
      gender: 'Female',
      diagnosisDate: '2025-09-07',
      chiefComplaint: 'Severe headache with nausea',
      primaryDiagnosis: 'Migraine without Aura',
      secondaryDiagnosis: 'Tension-type Headache',
      icdCode: 'G43.909',
      severity: 'Severe',
      status: 'Active',
      treatmentPlan: 'Sumatriptan for acute episodes, preventive therapy with propranolol',
      followUpDate: '2025-09-14',
      notes: 'First episode. Patient education provided on trigger identification.',
      createdAt: '2025-09-07T11:15:00Z'
    },
    {
      id: 'DIAG003',
      patientId: 'PAT003',
      patientName: 'David Smith',
      age: 42,
      gender: 'Male',
      diagnosisDate: '2025-09-06',
      chiefComplaint: 'Follow-up hypertension',
      primaryDiagnosis: 'Essential Hypertension',
      secondaryDiagnosis: 'Dyslipidemia',
      icdCode: 'I10',
      severity: 'Mild',
      status: 'Controlled',
      treatmentPlan: 'Continue current antihypertensive therapy, statin therapy',
      followUpDate: '2025-10-06',
      notes: 'Blood pressure well controlled. Patient adherent to medications.',
      createdAt: '2025-09-06T14:20:00Z'
    },
    {
      id: 'DIAG004',
      patientId: 'PAT004',
      patientName: 'Sarah Wilson',
      age: 55,
      gender: 'Female',
      diagnosisDate: '2025-09-05',
      chiefComplaint: 'Diabetes routine check',
      primaryDiagnosis: 'Type 2 Diabetes Mellitus',
      secondaryDiagnosis: 'Diabetic Retinopathy',
      icdCode: 'E11.9',
      severity: 'Moderate',
      status: 'Active',
      treatmentPlan: 'Metformin, insulin therapy, ophthalmology referral',
      followUpDate: '2025-09-19',
      notes: 'HbA1c elevated at 8.2%. Medication adjustment needed.',
      createdAt: '2025-09-05T09:45:00Z'
    }
  ];

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

  const filteredDiagnoses = diagnoses.filter(diagnosis => {
    const matchesSearch = diagnosis.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         diagnosis.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         diagnosis.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         diagnosis.icdCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || diagnosis.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
        {filteredDiagnoses.map((diagnosis) => (
          <div
            key={diagnosis.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">
                      {diagnosis.patientName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{diagnosis.patientName}</h3>
                    <p className="text-sm text-gray-600">
                      {diagnosis.patientId} • {diagnosis.age}y {diagnosis.gender}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(diagnosis.status)}`}>
                    {diagnosis.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(diagnosis.diagnosisDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
              {/* Chief Complaint */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Chief Complaint</h4>
                <p className="text-sm text-gray-700">{diagnosis.chiefComplaint}</p>
              </div>

              {/* Primary Diagnosis */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Primary Diagnosis</h4>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{diagnosis.primaryDiagnosis}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">ICD: {diagnosis.icdCode}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getSeverityColor(diagnosis.severity)}`}>
                      {diagnosis.severity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Diagnosis */}
              {diagnosis.secondaryDiagnosis && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Secondary Diagnosis</h4>
                  <p className="text-sm text-gray-700">{diagnosis.secondaryDiagnosis}</p>
                </div>
              )}

              {/* Treatment Plan */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">Treatment Plan</h4>
                <p className="text-sm text-gray-700">{diagnosis.treatmentPlan}</p>
              </div>

              {/* Notes */}
              {diagnosis.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Clinical Notes</h4>
                  <p className="text-sm text-gray-700">{diagnosis.notes}</p>
                </div>
              )}

              {/* Follow-up Date */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Follow-up:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(diagnosis.followUpDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500 text-xs">
                    {new Date(diagnosis.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-600 text-sm font-medium rounded-md hover:bg-green-100 transition-colors">
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition-colors">
                    <Eye className="h-3 w-3" />
                    <span>View Full</span>
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {diagnosis.id}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDiagnoses.length === 0 && (
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
    </div>
  );
}
