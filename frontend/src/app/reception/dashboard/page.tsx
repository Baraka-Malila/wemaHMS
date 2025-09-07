'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NewPatientModal from '@/components/NewPatientModal';
import ExistingPatientModal from '@/components/ExistingPatientModal';
import PatientDetailsModal from '@/components/PatientDetailsModal';
import EditPatientModal from '@/components/EditPatientModal';

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  phone_number?: string;
  age: number;
  gender: string;
  current_status: string;
  current_location: string;
  created_at: string;
}

interface DashboardStats {
  total_patients_today: number;
  patients_waiting: number;
  total_revenue_today: number;
  pending_payments: number;
}

export default function ReceptionDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_patients_today: 0,
    patients_waiting: 0,
    total_revenue_today: 0,
    pending_payments: 0
  });
  
  // Modal states
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showExistingPatientModal, setShowExistingPatientModal] = useState(false);
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reception/dashboard/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard API response:', data);
        
        // Update dashboard stats
        setDashboardStats({
          total_patients_today: data.today_registrations || 0,
          patients_waiting: data.patients_waiting || 0,
          total_revenue_today: 0,
          pending_payments: data.pending_file_fees || 0
        });
        
        // Use todays_active_queue as primary patient list, fallback to recent_registrations
        const patientData = data.todays_active_queue || data.recent_registrations || [];
        if (patientData.length > 0) {
          const transformedPatients = patientData.map((patient: any) => ({
            id: patient.id,
            patient_id: patient.patient_id,
            full_name: patient.full_name,
            phone_number: patient.phone_number,
            age: patient.age,
            gender: patient.gender,
            current_status: patient.current_status,
            current_location: patient.current_location,
            created_at: patient.created_at
          }));
          setPatients(transformedPatients);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Search patients (only when user searches)
  const searchPatients = async (query: string = '') => {
    if (!query.trim()) {
      // If no query, reload dashboard data to show recent patients
      await fetchDashboardData();
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/patients/search/?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Search API response:', data);
        if (data.results) {
          // Transform API data to match our interface
          const transformedPatients = data.results.map((patient: any) => ({
            id: patient.id,
            patient_id: patient.patient_id,
            full_name: patient.full_name,
            phone_number: patient.phone_number,
            age: patient.age,
            gender: patient.gender,
            current_status: patient.current_status,
            current_location: patient.current_location,
            created_at: patient.created_at
          }));
          setPatients(transformedPatients);
        }
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      // Keep existing data on error
    }
  };

  useEffect(() => {
    // Get current user data
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Load API data
    const loadData = async () => {
      await fetchDashboardData(); // This will load both stats and recent patients
      setLoading(false);
    };

    loadData();
  }, []);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await searchPatients(query);
  };

  const getStatusBadge = (status: string) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      fontFamily: 'Inter, sans-serif'
    };

    switch (status) {
      case 'REGISTERED':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#EFF6FF',
            color: '#1D4ED8',
            border: '1px solid #BFDBFE'
          }}>
            Registered
          </span>
        );
      case 'WAITING_DOCTOR':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#F0F9FF',
            color: '#0369A1',
            border: '1px solid #BAE6FD'
          }}>
            Waiting Doctor
          </span>
        );
      case 'WITH_DOCTOR':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#FEF3C7',
            color: '#D97706',
            border: '1px solid #FDE68A'
          }}>
            With Doctor
          </span>
        );
      case 'WAITING_LAB':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#F3E8FF',
            color: '#7C3AED',
            border: '1px solid #DDD6FE'
          }}>
            Waiting Lab
          </span>
        );
      case 'IN_LAB':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#ECFDF5',
            color: '#059669',
            border: '1px solid #A7F3D0'
          }}>
            In Lab
          </span>
        );
      case 'WAITING_PHARMACY':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#FEF2E2',
            color: '#EA580C',
            border: '1px solid #FED7AA'
          }}>
            Waiting Pharmacy
          </span>
        );
      case 'COMPLETED':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#F0FDF4',
            color: '#166534',
            border: '1px solid #BBF7D0'
          }}>
            Completed
          </span>
        );
      case 'PAYMENT_PENDING':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA'
          }}>
            Payment Pending
          </span>
        );
      default:
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#F3F4F6',
            color: '#374151',
            border: '1px solid #D1D5DB'
          }}>
            {status}
          </span>
        );
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.patient_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.phone_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || patient.current_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectExistingPatient = (patient: Patient) => {
    // Show patient details when selected from existing patient search
    setSelectedPatientId(patient.patient_id);
    setShowPatientDetailsModal(true);
  };

  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowPatientDetailsModal(true);
  };

  const handleEditPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowEditPatientModal(true);
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (!confirm(`Are you sure you want to delete ${patient.full_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/patients/${patient.patient_id}/delete/`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        alert(`Patient ${patient.full_name} deleted successfully`);
        // Refresh the patient list
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to delete patient'}`);
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Error deleting patient. Please try again.');
    }
  };

  const handleCheckInPatient = async (patient: Patient) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/patients/${patient.patient_id}/status/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            current_status: 'WAITING_DOCTOR',
            current_location: 'Waiting Area',
            notes: 'Patient checked in at reception'
          })
        }
      );

      if (response.ok) {
        alert(`${patient.full_name} checked in successfully`);
        // Refresh the dashboard to update status
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || errorData.message || 'Failed to check in patient'}`);
      }
    } catch (error) {
      console.error('Error checking in patient:', error);
      alert('Error checking in patient. Please try again.');
    }
  };

  return (
    <>
      {/* Welcome Container - Fully responsive to sidebar */}
      <div 
        className="relative mb-8 transition-all duration-300"
        style={{
          width: '100%',
          height: '198px',
          background: '#EBF4FF',
          borderRadius: '16px',
          boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.05), 0px 0px 2px rgba(23, 26, 31, 0.08)'
        }}
      >
        {/* Welcome Text */}
        <h1 
          style={{
            position: 'absolute',
            top: '66px',
            left: '24px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            fontWeight: '700',
            color: '#19191FFF',
            margin: 0
          }}
        >
          Welcome, {currentUser?.full_name || 'Dr. Emekal'}
        </h1>
        
        <p 
          style={{
            position: 'absolute',
            top: '110px',
            left: '24px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            fontWeight: '400',
            color: '#565D6D',
            margin: 0
          }}
        >
          Your reception dashboard for seamless patient management.
        </p>
        
        {/* Welcome Image - Responsive positioning */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            width: '200px',
            height: '150px'
          }}
        >
          <Image
            src="/assets/welcome.png"
            alt="Welcome"
            width={200}
            height={150}
            style={{
              borderRadius: '0px'
            }}
          />
        </div>
      </div>

      {/* Search and Action Buttons */}
      <div className="flex items-center justify-between mb-8 gap-4">
        {/* Search and Filter Container */}
        <div className="flex items-center gap-4" style={{ flex: '0 0 50%' }}>
          {/* Search Bar - Truncated */}
          <div className="relative flex-1">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#9CA3AF" 
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, phone, or ID"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                background: '#FFFFFF'
              }}
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                background: '#FFFFFF'
              }}
            >
              <option value="">All Statuses</option>
              <option value="REGISTERED">Registered</option>
              <option value="WAITING_DOCTOR">Waiting Doctor</option>
              <option value="WITH_DOCTOR">With Doctor</option>
              <option value="WAITING_LAB">Waiting Lab</option>
              <option value="IN_LAB">In Lab</option>
              <option value="WAITING_PHARMACY">Waiting Pharmacy</option>
              <option value="COMPLETED">Completed</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
            </select>
          </div>
        </div>

        {/* Action Buttons - Exact CSS from Visily */}
        <div className="flex gap-3">
          {/* NEW PATIENT Button */}
          <button 
            className="transition-colors"
            style={{
              width: '170px',
              height: '56px',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              fontWeight: '600',
              color: '#FFFFFFFF',
              background: '#47A72FFF',
              opacity: 1,
              border: 'none',
              borderRadius: '10px',
              boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.05), 0px 0px 2px rgba(23, 26, 31, 0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3A8826FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#47A72FFF';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.background = '#2D6A1EFF';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.background = '#3A8826FF';
            }}
            onClick={() => setShowNewPatientModal(true)}
          >
            NEW PATIENT
          </button>
          
          {/* EXISTING PATIENT Button */}
          <button 
            className="transition-colors"
            style={{
              width: '210px',
              height: '56px',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              fontWeight: '600',
              color: '#0F74C7FF',
              background: '#FFFFFFFF',
              opacity: 1,
              borderRadius: '10px',
              borderWidth: '1px',
              borderColor: '#0F74C7FF',
              borderStyle: 'solid',
              boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.05), 0px 0px 2px rgba(23, 26, 31, 0.08)'
            }}
            onClick={() => setShowExistingPatientModal(true)}
          >
            EXISTING PATIENT
          </button>
        </div>
      </div>

      {/* Real-time Patient Queue */}
      <div className="bg-white rounded-xl border border-gray-200" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)' }}>
        <div className="p-6 border-b border-gray-200">
          <h3 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '20px',
            lineHeight: '28px',
            fontWeight: '600',
            color: '#171A1F'
          }}>Real-time Patient Queue</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">Loading patient queue...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: '600',
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>PATIENT ID</th>
                  <th className="text-left p-4" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: '600',
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>NAME</th>
                  <th className="text-left p-4" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: '600',
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>PHONE</th>
                  <th className="text-left p-4" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: '600',
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>AGE/GENDER</th>
                  <th className="text-left p-4" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: '600',
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>STATUS</th>
                  <th className="text-left p-4" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: '600',
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>LOCATION</th>
                  <th className="text-right p-4" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: '600',
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, index) => (
                  <tr key={patient.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4" style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '500',
                      color: '#0F74C7'
                    }}>{patient.patient_id}</td>
                    <td className="p-4" style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '500',
                      color: '#171A1F'
                    }}>{patient.full_name}</td>
                    <td className="p-4" style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '400',
                      color: '#565D6D'
                    }}>{patient.phone_number || 'N/A'}</td>
                    <td className="p-4" style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '400',
                      color: '#565D6D'
                    }}>{patient.age} / {patient.gender}</td>
                    <td className="p-4">
                      {getStatusBadge(patient.current_status)}
                    </td>
                    <td className="p-4" style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '400',
                      color: '#565D6D'
                    }}>{patient.current_location || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {/* Check In Button - only show for patients not already checked in or waiting */}
                        {patient.current_status === 'REGISTERED' && (
                          <button 
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            onClick={() => handleCheckInPatient(patient)}
                            title="Check In Patient"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            Check In
                          </button>
                        )}
                        
                        {/* View Button */}
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => handleViewPatient(patient.patient_id)}
                          title="View Patient"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        
                        {/* Edit Button */}
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => handleEditPatient(patient.patient_id)}
                          title="Edit Patient"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        
                        {/* Delete Button */}
                        <button 
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          onClick={() => handleDeletePatient(patient)}
                          title="Delete Patient"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewPatientModal
        isOpen={showNewPatientModal}
        onClose={() => setShowNewPatientModal(false)}
        onSuccess={() => {
          // Refresh the dashboard data after successful registration
          fetchDashboardData();
        }}
      />

      <ExistingPatientModal
        isOpen={showExistingPatientModal}
        onClose={() => setShowExistingPatientModal(false)}
        onSelectPatient={handleSelectExistingPatient}
      />

      <PatientDetailsModal
        isOpen={showPatientDetailsModal}
        onClose={() => {
          setShowPatientDetailsModal(false);
          setSelectedPatientId('');
        }}
        patientId={selectedPatientId}
        onEdit={() => {
          setShowPatientDetailsModal(false);
          setShowEditPatientModal(true);
        }}
        onDelete={() => {
          // Find the patient and call delete
          const patient = patients.find(p => p.patient_id === selectedPatientId);
          if (patient) {
            setShowPatientDetailsModal(false);
            handleDeletePatient(patient);
          }
        }}
      />

      <EditPatientModal
        isOpen={showEditPatientModal}
        onClose={() => {
          setShowEditPatientModal(false);
          setSelectedPatientId('');
        }}
        patientId={selectedPatientId}
        onSuccess={() => {
          // Refresh the patient list after successful update
          fetchDashboardData();
        }}
      />
    </>
  );
}
