'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Patient {
  id: string;
  name: string;
  phone?: string; // Optional since some patients might not have phone numbers
  arrival_time: string;
  status: 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled';
  doctor: string;
}

export default function ReceptionDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

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

    // Simulate loading data
    setTimeout(() => {
      setPatients([
        {
          id: 'P001',
          name: 'Alice Johnson',
          phone: '+255123456789',
          arrival_time: '09:00 AM',
          status: 'Waiting',
          doctor: 'Dr. Evelyn Reed'
        },
        {
          id: 'P002',
          name: 'Robert Davis',
          phone: '+255123456790',
          arrival_time: '09:15 AM',
          status: 'In Progress',
          doctor: 'Dr. Michael Chen'
        },
        {
          id: 'P003',
          name: 'Sophia Lee',
          phone: '+255123456791',
          arrival_time: '09:30 AM',
          status: 'Waiting',
          doctor: 'Dr. Evelyn Reed'
        },
        {
          id: 'P004',
          name: 'David Kim',
          phone: '+255123456792',
          arrival_time: '09:45 AM',
          status: 'Completed',
          doctor: 'Dr. Sophia Miller'
        },
        {
          id: 'P005',
          name: 'Maria Garcia',
          phone: '+255123456793',
          arrival_time: '10:00 AM',
          status: 'Cancelled',
          doctor: 'Dr. Michael Chen'
        },
        {
          id: 'P006',
          name: 'James Wilson',
          phone: '+255123456794',
          arrival_time: '10:15 AM',
          status: 'Waiting',
          doctor: 'Dr. Evelyn Reed'
        },
        {
          id: 'P007',
          name: 'Olivia Brown',
          phone: '+255123456795',
          arrival_time: '10:30 AM',
          status: 'In Progress',
          doctor: 'Dr. Evelyn Reed'
        },
        {
          id: 'P008',
          name: 'Daniel White',
          phone: '+255123456796',
          arrival_time: '10:45 AM',
          status: 'Waiting',
          doctor: 'Dr. Sophia Miller'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      fontFamily: 'Roboto, sans-serif'
    };

    switch (status) {
      case 'Waiting':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#F0F9FF',
            color: '#0369A1',
            border: '1px solid #BAE6FD'
          }}>
            Waiting
          </span>
        );
      case 'In Progress':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#EFF6FF',
            color: '#1D4ED8',
            border: '1px solid #BFDBFE'
          }}>
            In Progress
          </span>
        );
      case 'Completed':
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
      case 'Cancelled':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA'
          }}>
            Cancelled
          </span>
        );
      default:
        return status;
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* Welcome Container - Fully responsive to sidebar */}
      <div 
        className="relative mb-8 transition-all duration-300"
        style={{
          width: '100%',
          height: '198px',
          background: '#F1F8FEFF',
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <option value="Waiting">Waiting</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
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
            onClick={() => router.push('/reception/new-patient')}
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
            onClick={() => router.push('/reception/existing-patient')}
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
                  }}>ID</th>
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
                  }}>ARRIVAL TIME</th>
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
                  }}>DOCTOR</th>
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
                      color: '#171A1F'
                    }}>{patient.id}</td>
                    <td className="p-4" style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '500',
                      color: '#171A1F'
                    }}>{patient.name}</td>
                    <td className="p-4" style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '400',
                      color: '#565D6D'
                    }}>{patient.phone || 'N/A'}</td>
                    <td className="p-4" style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '400',
                      color: '#565D6D'
                    }}>{patient.arrival_time}</td>
                    <td className="p-4">
                      {getStatusBadge(patient.status)}
                    </td>
                    <td className="p-4" style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '400',
                      color: '#565D6D'
                    }}>{patient.doctor}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        {/* View Button */}
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => router.push(`/reception/patients/${patient.id}`)}
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
                          onClick={() => router.push(`/reception/patients/${patient.id}/edit`)}
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
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${patient.name}?`)) {
                              setPatients(patients.filter(p => p.id !== patient.id));
                            }
                          }}
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
    </>
  );
}
