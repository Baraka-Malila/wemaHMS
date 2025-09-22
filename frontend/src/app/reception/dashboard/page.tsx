'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NewPatientModal from '@/components/NewPatientModal';
import ExistingPatientModal from '@/components/ExistingPatientModal';
import PatientDetailsModal from '@/components/PatientDetailsModal';
import EditPatientModal from '@/components/EditPatientModal';
import auth from '@/lib/auth';

interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  phone_number?: string;
  age: number;
  gender: string;
  patient_type: string;
  nhif_card_number?: string;
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
  const [modalStack, setModalStack] = useState<string[]>([]);

  // Load ALL non-completed patients (FIFO queue)
  const loadActiveQueuePatients = async () => {
    try {
      const token = auth.getToken();

      // Make multiple calls to get all patients since search API has limits
      // Try different prefixes to get all patients
      const searchQueries = ['PAT', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
      let allPatients: any[] = [];

      for (const query of searchQueries) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/patients/search/?q=${query}&limit=100`,
            {
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.results) {
              allPatients = [...allPatients, ...data.results];
            }
          }
        } catch (error) {
          console.log(`Error searching for ${query}:`, error);
        }
      }

      // Remove duplicates based on patient_id
      const uniquePatients = allPatients.filter((patient, index, self) =>
        index === self.findIndex(p => p.patient_id === patient.patient_id)
      );

      // Filter to only non-completed patients
      const queuePatients = uniquePatients.filter((patient: any) =>
        patient.current_status !== 'COMPLETED'
      );

      // Sort by created_at for FIFO (First In, First Out)
      queuePatients.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      const transformedPatients = queuePatients.map((patient: any) => ({
        id: patient.id,
        patient_id: patient.patient_id,
        full_name: patient.full_name,
        phone_number: patient.phone_number,
        age: patient.age,
        gender: patient.gender,
        patient_type: patient.patient_type || 'NORMAL',
        nhif_card_number: patient.nhif_card_number,
        current_status: patient.current_status,
        current_location: patient.current_location,
        created_at: patient.created_at
      }));

      setPatients(transformedPatients);
      console.log(`Loaded ${transformedPatients.length} patients in queue (FIFO order)`);
    } catch (error) {
      console.error('Error loading active queue patients:', error);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = auth.getToken();
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
        
        // Load all active queue patients (not just today's)
        await loadActiveQueuePatients();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Search patients in TODAY'S QUEUE ONLY (not all database)
  const searchPatients = async (query: string = '') => {
    if (!query.trim()) {
      // If no query, reload dashboard data to show today's queue
      await fetchDashboardData();
      return;
    }

    try {
      const token = auth.getToken();
      const activeStatuses = ['REGISTERED', 'FILE_FEE_PAID', 'WAITING_DOCTOR', 'WITH_DOCTOR', 'WAITING_LAB', 'IN_LAB', 'LAB_RESULTS_READY', 'WAITING_PHARMACY', 'IN_PHARMACY'];

      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/patients/search/?q=${encodeURIComponent(query)}&limit=100`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Queue Search API response:', data);
        if (data.results) {
          // Filter by active statuses on the frontend since backend doesn't support multiple statuses
          const activePatients = data.results.filter((patient: any) =>
            activeStatuses.includes(patient.current_status)
          );

          const transformedPatients = activePatients.map((patient: any) => ({
            id: patient.id,
            patient_id: patient.patient_id,
            full_name: patient.full_name,
            phone_number: patient.phone_number,
            age: patient.age,
            gender: patient.gender,
            patient_type: patient.patient_type || 'NORMAL',
            nhif_card_number: patient.nhif_card_number,
            current_status: patient.current_status,
            current_location: patient.current_location,
            created_at: patient.created_at
          }));
          setPatients(transformedPatients);
        }
      }
    } catch (error) {
      console.error('Error searching queue patients:', error);
      // Keep existing data on error
    }
  };

  useEffect(() => {
    // Get current user data
    const user = auth.getUser();
    if (user) {
      setCurrentUser(user);
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
    setModalStack(['existing']);
    setShowExistingPatientModal(false);
    setShowPatientDetailsModal(true);
  };

  const handleViewPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setModalStack([]);
    setShowPatientDetailsModal(true);
  };

  const handleClosePatientDetails = () => {
    if (modalStack.includes('existing')) {
      setShowPatientDetailsModal(false);
      setModalStack([]);
      setShowExistingPatientModal(true);
    } else {
      setShowPatientDetailsModal(false);
      setSelectedPatientId('');
      setModalStack([]);
    }
  };

  const handleEditFromDetails = () => {
    setModalStack(modalStack.includes('existing') ? ['existing', 'details'] : ['details']);
    setShowPatientDetailsModal(false);
    setShowEditPatientModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditPatientModal(false);
    if (modalStack.includes('details')) {
      setModalStack(modalStack.filter(m => m !== 'edit'));
      setShowPatientDetailsModal(true);
    } else {
      setSelectedPatientId('');
      setModalStack([]);
    }
  };

  const handleEditPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setShowEditPatientModal(true);
  };


  const handleCheckInPatient = async (patient: Patient) => {
    try {
      const token = auth.getToken();
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
      {/* Welcome Section */}
      <div 
        className="rounded-lg p-6 mb-8"
        style={{
          background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
          border: '1px solid rgba(229, 231, 235, 0.6)',
          boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.05), 0px 0px 2px rgba(23, 26, 31, 0.08)'
        }}
      >
        {/* Welcome Text */}
        <h1 
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            fontWeight: '700',
            color: '#FFFFFF',
            margin: 0
          }}
        >
          Welcome, {currentUser?.full_name || 'Reception Staff'}
        </h1>
        
        <p 
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            fontWeight: '400',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '8px 0 0 0'
          }}
        >
          Your reception dashboard for seamless patient management.
        </p>
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
                  }}>TYPE</th>
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
                      {patient.patient_type === 'NHIF' ? (
                        <div className="flex flex-col">
                          <span style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: '#3B82F6',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginBottom: '2px'
                          }}>
                            NHIF
                          </span>
                          {patient.nhif_card_number && (
                            <span style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '11px',
                              color: '#9CA3AF'
                            }}>
                              {patient.nhif_card_number}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: '#10B981',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          NORMAL
                        </span>
                      )}
                    </td>
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
                            className="px-3 py-1 bg-blue-900 text-white text-sm rounded-lg hover:bg-blue-950 transition-colors"
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
        onClose={handleClosePatientDetails}
        patientId={selectedPatientId}
        onEdit={handleEditFromDetails}
      />

      <EditPatientModal
        isOpen={showEditPatientModal}
        onClose={handleCloseEdit}
        patientId={selectedPatientId}
        onSuccess={() => {
          fetchDashboardData();
          handleCloseEdit();
        }}
      />
    </>
  );
}
