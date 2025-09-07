'use client';

import { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  FileText,
  TestTube,
  Pill,
  User,
  Phone,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye
} from 'lucide-react';

export default function PatientHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null);

  // Mock patient data with complete history
  const patients = [
    {
      id: 'PAT001',
      name: 'John Doe',
      age: 35,
      gender: 'Male',
      phone: '+255 123 456 789',
      address: '123 Main St, Dar es Salaam',
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      emergencyContact: 'Jane Doe - Wife (+255 987 654 321)',
      medicalHistory: 'Hypertension (2020), Type 2 Diabetes (2022)',
      visits: [
        {
          id: 'V001',
          date: '2025-09-07',
          time: '10:30 AM',
          type: 'Follow-up',
          chiefComplaint: 'Chest pain and shortness of breath',
          diagnosis: 'Hypertensive Heart Disease',
          prescriptions: [
            { name: 'Lisinopril 10mg', frequency: 'Once daily', duration: '30 days' },
            { name: 'Metformin 500mg', frequency: 'Twice daily', duration: '30 days' }
          ],
          labTests: [
            { name: 'Complete Blood Count', status: 'Pending', date: '2025-09-07' },
            { name: 'Lipid Profile', status: 'Pending', date: '2025-09-07' }
          ],
          vitalSigns: {
            bloodPressure: '140/90',
            temperature: '37.2°C',
            pulse: '85 bpm',
            weight: '75 kg',
            height: '175 cm'
          },
          notes: 'Patient shows good compliance with medication. Blood pressure well controlled.',
          followUp: '2025-09-21'
        },
        {
          id: 'V002',
          date: '2025-07-15',
          time: '2:00 PM',
          type: 'Routine Check',
          chiefComplaint: 'Diabetes routine monitoring',
          diagnosis: 'Type 2 Diabetes Mellitus - Well Controlled',
          prescriptions: [
            { name: 'Metformin 500mg', frequency: 'Twice daily', duration: '90 days' }
          ],
          labTests: [
            { name: 'HbA1c', status: 'Completed', result: '6.8%', date: '2025-07-15' },
            { name: 'Fasting Glucose', status: 'Completed', result: '125 mg/dL', date: '2025-07-15' }
          ],
          vitalSigns: {
            bloodPressure: '135/85',
            temperature: '36.8°C',
            pulse: '78 bpm',
            weight: '73 kg',
            height: '175 cm'
          },
          notes: 'Excellent diabetes control. Continue current regimen.',
          followUp: '2025-10-15'
        },
        {
          id: 'V003',
          date: '2025-05-20',
          time: '11:00 AM',
          type: 'Initial Consultation',
          chiefComplaint: 'Newly diagnosed hypertension',
          diagnosis: 'Essential Hypertension',
          prescriptions: [
            { name: 'Lisinopril 5mg', frequency: 'Once daily', duration: '30 days' }
          ],
          labTests: [
            { name: 'Basic Metabolic Panel', status: 'Completed', result: 'Normal', date: '2025-05-20' },
            { name: 'ECG', status: 'Completed', result: 'Normal sinus rhythm', date: '2025-05-20' }
          ],
          vitalSigns: {
            bloodPressure: '155/95',
            temperature: '36.5°C',
            pulse: '82 bpm',
            weight: '72 kg',
            height: '175 cm'
          },
          notes: 'New hypertension diagnosis. Patient counseled on lifestyle modifications.',
          followUp: '2025-06-20'
        }
      ]
    },
    {
      id: 'PAT002',
      name: 'Mary Johnson',
      age: 28,
      gender: 'Female',
      phone: '+255 987 654 321',
      address: '456 Oak Ave, Dar es Salaam',
      bloodGroup: 'A+',
      allergies: 'None known',
      emergencyContact: 'Robert Johnson - Father (+255 123 987 654)',
      medicalHistory: 'Migraine (2023)',
      visits: [
        {
          id: 'V004',
          date: '2025-09-07',
          time: '11:15 AM',
          type: 'Emergency',
          chiefComplaint: 'Severe headache with nausea',
          diagnosis: 'Migraine without Aura',
          prescriptions: [
            { name: 'Sumatriptan 50mg', frequency: 'As needed', duration: '6 tablets' },
            { name: 'Propranolol 40mg', frequency: 'Twice daily', duration: '30 days' }
          ],
          labTests: [
            { name: 'CT Scan Brain', status: 'Completed', result: 'No acute findings', date: '2025-09-07' }
          ],
          vitalSigns: {
            bloodPressure: '120/80',
            temperature: '37.0°C',
            pulse: '95 bpm',
            weight: '58 kg',
            height: '165 cm'
          },
          notes: 'First severe migraine episode. Patient educated on trigger identification.',
          followUp: '2025-09-14'
        }
      ]
    },
    {
      id: 'PAT003',
      name: 'David Smith',
      age: 42,
      gender: 'Male',
      phone: '+255 456 789 123',
      address: '789 Pine St, Dar es Salaam',
      bloodGroup: 'B+',
      allergies: 'Aspirin',
      emergencyContact: 'Sarah Smith - Wife (+255 321 654 987)',
      medicalHistory: 'Hypertension (2018), High cholesterol (2020)',
      visits: [
        {
          id: 'V005',
          date: '2025-09-06',
          time: '2:20 PM',
          type: 'Follow-up',
          chiefComplaint: 'Hypertension and cholesterol follow-up',
          diagnosis: 'Essential Hypertension, Dyslipidemia - Well Controlled',
          prescriptions: [
            { name: 'Amlodipine 5mg', frequency: 'Once daily', duration: '30 days' },
            { name: 'Atorvastatin 20mg', frequency: 'Once daily at bedtime', duration: '30 days' }
          ],
          labTests: [
            { name: 'Lipid Profile', status: 'Completed', result: 'Normal levels', date: '2025-09-06' }
          ],
          vitalSigns: {
            bloodPressure: '130/85',
            temperature: '36.8°C',
            pulse: '72 bpm',
            weight: '80 kg',
            height: '178 cm'
          },
          notes: 'Good compliance with medications. Continue current regimen.',
          followUp: '2025-12-06'
        }
      ]
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Follow-up':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Routine Check':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Initial Consultation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600';
      case 'Pending':
        return 'text-yellow-600';
      case 'In Progress':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

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
            placeholder="Search patients by name, ID, or phone number..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Patient List */}
      {!selectedPatient && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPatient(patient.id)}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-lg font-semibold text-green-600">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-600">{patient.id} • {patient.age}y {patient.gender}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{patient.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{patient.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <History className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{patient.visits.length} visits</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last visit:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(patient.visits[0]?.date || '').toLocaleDateString()}
                  </span>
                </div>
              </div>

              {patient.allergies !== 'None known' && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                    <span className="text-xs font-medium text-yellow-800">Allergies: {patient.allergies}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Patient Detail View */}
      {selectedPatient && (
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setSelectedPatient(null)}
            className="flex items-center space-x-2 text-green-600 hover:text-green-700"
          >
            <span>← Back to Patient List</span>
          </button>

          {(() => {
            const patient = patients.find(p => p.id === selectedPatient);
            if (!patient) return null;

            return (
              <>
                {/* Patient Summary */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-green-600">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                      <p className="text-lg text-gray-600">{patient.id} • {patient.age} years old, {patient.gender}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
                      <div className="space-y-1 text-sm text-gray-700">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{patient.address}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Medical Information</h4>
                      <div className="space-y-1 text-sm text-gray-700">
                        <p><span className="font-medium">Blood Group:</span> {patient.bloodGroup}</p>
                        <p><span className="font-medium">Allergies:</span> {patient.allergies}</p>
                        <p><span className="font-medium">Medical History:</span> {patient.medicalHistory}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Emergency Contact</h4>
                      <p className="text-sm text-gray-700">{patient.emergencyContact}</p>
                    </div>
                  </div>
                </div>

                {/* Visit History */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Visit History ({patient.visits.length} visits)</h3>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {patient.visits.map((visit) => (
                      <div key={visit.id} className="p-6">
                        {/* Visit Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{visit.diagnosis}</h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-600">
                                  {new Date(visit.date).toLocaleDateString()} at {visit.time}
                                </span>
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getVisitTypeColor(visit.type)}`}>
                                  {visit.type}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setExpandedVisit(expandedVisit === visit.id ? null : visit.id)}
                            className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                          >
                            <span className="text-sm">
                              {expandedVisit === visit.id ? 'Collapse' : 'Expand'}
                            </span>
                            {expandedVisit === visit.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {/* Chief Complaint */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Chief Complaint</h5>
                          <p className="text-sm text-gray-700">{visit.chiefComplaint}</p>
                        </div>

                        {/* Expanded Details */}
                        {expandedVisit === visit.id && (
                          <div className="space-y-4">
                            {/* Vital Signs */}
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Vital Signs</h5>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                <div className="bg-gray-50 p-2 rounded text-center">
                                  <p className="text-xs text-gray-600">Blood Pressure</p>
                                  <p className="text-sm font-medium">{visit.vitalSigns.bloodPressure}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-center">
                                  <p className="text-xs text-gray-600">Temperature</p>
                                  <p className="text-sm font-medium">{visit.vitalSigns.temperature}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-center">
                                  <p className="text-xs text-gray-600">Pulse</p>
                                  <p className="text-sm font-medium">{visit.vitalSigns.pulse}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-center">
                                  <p className="text-xs text-gray-600">Weight</p>
                                  <p className="text-sm font-medium">{visit.vitalSigns.weight}</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded text-center">
                                  <p className="text-xs text-gray-600">Height</p>
                                  <p className="text-sm font-medium">{visit.vitalSigns.height}</p>
                                </div>
                              </div>
                            </div>

                            {/* Prescriptions */}
                            {visit.prescriptions.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                  <Pill className="h-4 w-4" />
                                  <span>Prescriptions ({visit.prescriptions.length})</span>
                                </h5>
                                <div className="space-y-2">
                                  {visit.prescriptions.map((prescription, index) => (
                                    <div key={index} className="bg-blue-50 p-3 rounded-lg">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-blue-900">{prescription.name}</span>
                                        <span className="text-sm text-blue-700">{prescription.duration}</span>
                                      </div>
                                      <p className="text-sm text-blue-800 mt-1">{prescription.frequency}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Lab Tests */}
                            {visit.labTests.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                  <TestTube className="h-4 w-4" />
                                  <span>Lab Tests ({visit.labTests.length})</span>
                                </h5>
                                <div className="space-y-2">
                                  {visit.labTests.map((test, index) => (
                                    <div key={index} className="bg-purple-50 p-3 rounded-lg">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-purple-900">{test.name}</span>
                                        <span className={`text-sm font-medium ${getTestStatusColor(test.status)}`}>
                                          {test.status}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between mt-1">
                                        <span className="text-sm text-purple-700">
                                          {new Date(test.date).toLocaleDateString()}
                                        </span>
                                        {'result' in test && test.result && (
                                          <span className="text-sm text-purple-800 font-medium">
                                            Result: {test.result}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Clinical Notes */}
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span>Clinical Notes</span>
                              </h5>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-700">{visit.notes}</p>
                              </div>
                            </div>

                            {/* Follow-up */}
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Follow-up scheduled:</span>
                              <span className="font-medium text-gray-900">
                                {new Date(visit.followUp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* No Results */}
      {!selectedPatient && filteredPatients.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'No patient records available.'}
          </p>
        </div>
      )}
    </div>
  );
}
