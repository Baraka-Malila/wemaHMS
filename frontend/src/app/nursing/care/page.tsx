'use client';

import { useState, useEffect } from 'react';
import { 
  Heart,
  Thermometer,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  Stethoscope,
  Droplets,
  Gauge,
  Plus,
  Edit,
  Eye,
  Search,
  Filter,
  Calendar,
  Bell
} from 'lucide-react';

export default function PatientCare() {
  const [activeTab, setActiveTab] = useState('vital-signs');
  const [selectedPatient, setSelectedPatient] = useState('PAT001');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with API calls
  const patients = [
    {
      id: 'PAT001',
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      room: 'A101',
      status: 'STABLE',
      admissionDate: '2024-09-05',
      condition: 'Post-operative care',
      lastVitals: '10:30 AM',
      alerts: 2
    },
    {
      id: 'PAT002',
      name: 'Mary Johnson',
      age: 62,
      gender: 'Female',
      room: 'A102',
      status: 'CRITICAL',
      admissionDate: '2024-09-06',
      condition: 'Cardiac monitoring',
      lastVitals: '11:45 AM',
      alerts: 0
    },
    {
      id: 'PAT003',
      name: 'David Smith',
      age: 38,
      gender: 'Male',
      room: 'B201',
      status: 'RECOVERING',
      admissionDate: '2024-09-04',
      condition: 'Pneumonia treatment',
      lastVitals: '9:15 AM',
      alerts: 1
    }
  ];

  const vitalSigns = [
    {
      id: 1,
      patientId: 'PAT001',
      timestamp: '2024-09-07 11:30:00',
      temperature: 98.6,
      bloodPressure: '120/80',
      heartRate: 72,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      recordedBy: 'Nurse Sarah',
      notes: 'Patient stable, good response to treatment'
    },
    {
      id: 2,
      patientId: 'PAT001',
      timestamp: '2024-09-07 07:30:00',
      temperature: 99.1,
      bloodPressure: '125/82',
      heartRate: 78,
      respiratoryRate: 18,
      oxygenSaturation: 97,
      recordedBy: 'Nurse Mike',
      notes: 'Slight fever, monitoring closely'
    }
  ];

  const medications = [
    {
      id: 1,
      patientId: 'PAT001',
      medication: 'Ibuprofen 400mg',
      dosage: '1 tablet',
      frequency: 'Every 8 hours',
      route: 'Oral',
      startDate: '2024-09-05',
      endDate: '2024-09-10',
      status: 'ACTIVE',
      lastGiven: '2024-09-07 08:00:00',
      nextDue: '2024-09-07 16:00:00',
      givenBy: 'Nurse Sarah'
    },
    {
      id: 2,
      patientId: 'PAT001',
      medication: 'Amoxicillin 500mg',
      dosage: '1 capsule',
      frequency: 'Every 12 hours',
      route: 'Oral',
      startDate: '2024-09-05',
      endDate: '2024-09-12',
      status: 'ACTIVE',
      lastGiven: '2024-09-07 06:00:00',
      nextDue: '2024-09-07 18:00:00',
      givenBy: 'Nurse Mike'
    }
  ];

  const nursingNotes = [
    {
      id: 1,
      patientId: 'PAT001',
      timestamp: '2024-09-07 12:00:00',
      type: 'ASSESSMENT',
      note: 'Patient is alert and oriented. Complaining of mild pain at surgical site (3/10). Incision site clean and dry, no signs of infection. Patient ambulating with assistance.',
      nurseName: 'Sarah Johnson',
      shift: 'Day Shift'
    },
    {
      id: 2,
      patientId: 'PAT001',
      timestamp: '2024-09-07 08:30:00',
      type: 'MEDICATION',
      note: 'Administered morning medications as prescribed. Patient tolerated well, no adverse reactions observed.',
      nurseName: 'Sarah Johnson',
      shift: 'Day Shift'
    },
    {
      id: 3,
      patientId: 'PAT001',
      timestamp: '2024-09-06 23:45:00',
      type: 'GENERAL',
      note: 'Patient rested well during night shift. No complaints of pain or discomfort. Vital signs stable throughout the night.',
      nurseName: 'Mike Davis',
      shift: 'Night Shift'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'STABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'RECOVERING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OBSERVATION':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'ASSESSMENT':
        return 'bg-blue-100 text-blue-800';
      case 'MEDICATION':
        return 'bg-green-100 text-green-800';
      case 'GENERAL':
        return 'bg-gray-100 text-gray-800';
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isVitalAbnormal = (vital: string, value: number | string) => {
    switch (vital) {
      case 'temperature':
        return typeof value === 'number' && (value < 97.0 || value > 99.5);
      case 'heartRate':
        return typeof value === 'number' && (value < 60 || value > 100);
      case 'respiratoryRate':
        return typeof value === 'number' && (value < 12 || value > 20);
      case 'oxygenSaturation':
        return typeof value === 'number' && value < 95;
      default:
        return false;
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPatientData = patients.find(p => p.id === selectedPatient);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Care</h1>
            <p className="text-gray-600 mt-1">Monitor patient vital signs, medications, and nursing care</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Add Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Patient Selection</h2>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => setSelectedPatient(patient.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedPatient === patient.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{patient.name}</h3>
                {patient.alerts > 0 && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <Bell className="h-4 w-4" />
                    <span className="text-xs font-medium">{patient.alerts}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>ID: {patient.id} | Room: {patient.room}</p>
                <p>{patient.age}yr {patient.gender} | {patient.condition}</p>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                  <span className="text-xs">Last vitals: {patient.lastVitals}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Details - Tab Navigation */}
      {selectedPatientData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedPatientData.name}</h2>
                <p className="text-gray-600">Room {selectedPatientData.room} | Admitted: {selectedPatientData.admissionDate}</p>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedPatientData.status)}`}>
                {selectedPatientData.status}
              </span>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('vital-signs')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'vital-signs'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vital Signs
              </button>
              <button
                onClick={() => setActiveTab('medications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'medications'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Medications
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notes'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Nursing Notes
              </button>
            </nav>
          </div>

          {/* Vital Signs Tab */}
          {activeTab === 'vital-signs' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Record Vitals</span>
                </button>
              </div>

              <div className="space-y-6">
                {vitalSigns.filter(vs => vs.patientId === selectedPatient).map((vital) => (
                  <div key={vital.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          {new Date(vital.timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Recorded by: {vital.recordedBy}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Thermometer className={`h-6 w-6 ${isVitalAbnormal('temperature', vital.temperature) ? 'text-red-500' : 'text-blue-500'}`} />
                        </div>
                        <p className="text-sm text-gray-600">Temperature</p>
                        <p className={`text-lg font-semibold ${isVitalAbnormal('temperature', vital.temperature) ? 'text-red-600' : 'text-gray-900'}`}>
                          {vital.temperature}°F
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Gauge className="h-6 w-6 text-purple-500" />
                        </div>
                        <p className="text-sm text-gray-600">Blood Pressure</p>
                        <p className="text-lg font-semibold text-gray-900">{vital.bloodPressure}</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Heart className={`h-6 w-6 ${isVitalAbnormal('heartRate', vital.heartRate) ? 'text-red-500' : 'text-red-400'}`} />
                        </div>
                        <p className="text-sm text-gray-600">Heart Rate</p>
                        <p className={`text-lg font-semibold ${isVitalAbnormal('heartRate', vital.heartRate) ? 'text-red-600' : 'text-gray-900'}`}>
                          {vital.heartRate} bpm
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Activity className={`h-6 w-6 ${isVitalAbnormal('respiratoryRate', vital.respiratoryRate) ? 'text-red-500' : 'text-green-500'}`} />
                        </div>
                        <p className="text-sm text-gray-600">Respiratory</p>
                        <p className={`text-lg font-semibold ${isVitalAbnormal('respiratoryRate', vital.respiratoryRate) ? 'text-red-600' : 'text-gray-900'}`}>
                          {vital.respiratoryRate} /min
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Droplets className={`h-6 w-6 ${isVitalAbnormal('oxygenSaturation', vital.oxygenSaturation) ? 'text-red-500' : 'text-blue-400'}`} />
                        </div>
                        <p className="text-sm text-gray-600">O2 Saturation</p>
                        <p className={`text-lg font-semibold ${isVitalAbnormal('oxygenSaturation', vital.oxygenSaturation) ? 'text-red-600' : 'text-gray-900'}`}>
                          {vital.oxygenSaturation}%
                        </p>
                      </div>
                    </div>

                    {vital.notes && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{vital.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medications Tab */}
          {activeTab === 'medications' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Active Medications</h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Administer Medication</span>
                </button>
              </div>

              <div className="space-y-4">
                {medications.filter(med => med.patientId === selectedPatient).map((medication) => (
                  <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{medication.medication}</h4>
                        <p className="text-sm text-gray-600">
                          {medication.dosage} - {medication.frequency} ({medication.route})
                        </p>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {medication.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Last Given</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(medication.lastGiven).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">by {medication.givenBy}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Next Due</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(medication.nextDue).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-sm font-medium text-gray-900">
                          {medication.startDate} to {medication.endDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-md hover:bg-green-100 transition-colors">
                        <CheckCircle className="h-4 w-4" />
                        <span>Mark Given</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nursing Notes Tab */}
          {activeTab === 'notes' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Nursing Notes</h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Add Note</span>
                </button>
              </div>

              <div className="space-y-4">
                {nursingNotes.filter(note => note.patientId === selectedPatient).map((note) => (
                  <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getNoteTypeColor(note.type)}`}>
                          {note.type}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(note.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {note.nurseName} - {note.shift}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
