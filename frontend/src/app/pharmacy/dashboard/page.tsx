'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Prescription {
  id: string;
  patientName: string;
  medications: string[];
  doctor: string;
  priority: 'High' | 'Medium' | 'Low';
}

export default function PharmacyDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
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

    // Simulate loading prescriptions data
    setTimeout(() => {
      setPrescriptions([
        {
          id: 'RX001',
          patientName: 'Alice Smith',
          medications: ['Amoxicillin 500mg (30 capsules)', 'Ibuprofen 200mg (15 tablets)'],
          doctor: 'Dr. Emily White',
          priority: 'High'
        },
        {
          id: 'RX002',
          patientName: 'John Doe',
          medications: ['Metformin 850mg (60 tablets)'],
          doctor: 'Dr. Robert Green',
          priority: 'Medium'
        },
        {
          id: 'RX003',
          patientName: 'Sarah Connor',
          medications: ['Hydrochlorothiazide 25mg (30 tablets)', 'Lisinopril 10mg (30 tablets)', 'Aspirin 81mg (90 tablets)'],
          doctor: 'Dr. Michael Brown',
          priority: 'High'
        },
        {
          id: 'RX004',
          patientName: 'David Lee',
          medications: ['Zolpidem 10mg (30 tablets)'],
          doctor: 'Dr. Olivia Black',
          priority: 'Low'
        },
        {
          id: 'RX005',
          patientName: 'Maria Garcia',
          medications: ['Levothyroxine 50mcg (90 tablets)'],
          doctor: 'Dr. Susan Davis',
          priority: 'Medium'
        },
        {
          id: 'RX006',
          patientName: 'Robert Johnson',
          medications: ['Atorvastatin 20mg (30 tablets)', 'Vitamin D 1000IU (60 capsules)'],
          doctor: 'Dr. William Taylor',
          priority: 'High'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getPriorityBadge = (priority: string) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      fontFamily: 'Inter, sans-serif'
    };

    switch (priority) {
      case 'High':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FCA5A5'
          }}>
            High
          </span>
        );
      case 'Medium':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#FEF3C7',
            color: '#D97706',
            border: '1px solid #FCD34D'
          }}>
            Medium
          </span>
        );
      case 'Low':
        return (
          <span style={{
            ...baseStyle,
            backgroundColor: '#DBEAFE',
            color: '#1D4ED8',
            border: '1px solid #93C5FD'
          }}>
            Low
          </span>
        );
      default:
        return priority;
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prescription.medications?.some(med => med.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         prescription.doctor?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === '' || prescription.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  return (
    <>
      {/* Main Content Header */}
      <div className="text-center mb-8">
        <h1 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '32px',
          lineHeight: '40px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '8px'
        }}>
          Efficient Prescription Management
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          lineHeight: '24px',
          fontWeight: '400',
          color: '#6B7280',
          marginBottom: '32px'
        }}>
          Quickly process prescriptions with a single scan.
        </p>
        
        {/* Scan to Dispense Button */}
        <button
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            fontWeight: '600',
            color: '#FFFFFF',
            backgroundColor: '#1E40AF',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1E40AF'}
          onClick={() => router.push('/pharmacy/scan')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7V5a2 2 0 0 1 2-2h2m0 0h8m-8 0v2m8-2v2m0-2h2a2 2 0 0 1 2 2v2m0 0v8m0-8h-2m2 8v2a2 2 0 0 1-2 2h-2m0 0H7m8 0v-2M7 19v2a2 2 0 0 1-2 2H3v-2m0 0V7"/>
          </svg>
          Scan to Dispense
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Today's Dispensed */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              lineHeight: '20px',
              fontWeight: '500',
              color: '#6B7280'
            }}>
              Today's Dispensed
            </h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '36px',
            lineHeight: '44px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '4px'
          }}>
            187
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            lineHeight: '16px',
            fontWeight: '400',
            color: '#059669'
          }}>
            +12% from yesterday
          </p>
        </div>

        {/* Critical Stock Alerts */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              lineHeight: '20px',
              fontWeight: '500',
              color: '#6B7280'
            }}>
              Critical Stock Alerts
            </h3>
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: '600',
                color: '#DC2626'
              }}>!</span>
            </div>
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '36px',
            lineHeight: '44px',
            fontWeight: '700',
            color: '#DC2626',
            marginBottom: '4px'
          }}>
            5
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            lineHeight: '16px',
            fontWeight: '400',
            color: '#6B7280'
          }}>
            Items requiring urgent reorder
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6">
        <h2 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '20px',
          lineHeight: '28px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '16px'
        }}>
          Pending Prescriptions Queue
        </h2>
        
        <div className="flex items-center gap-4 mb-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
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
              placeholder="Search patient or medication..."
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

          {/* Priority Filter */}
          <div className="min-w-[180px]">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                background: '#FFFFFF'
              }}
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
                }}>PATIENT NAME</th>
                <th className="text-left p-4" style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  lineHeight: '16px',
                  fontWeight: '600',
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>MEDICATIONS</th>
                <th className="text-left p-4" style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  lineHeight: '16px',
                  fontWeight: '600',
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>DOCTOR</th>
                <th className="text-left p-4" style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  lineHeight: '16px',
                  fontWeight: '600',
                  color: '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>PRIORITY</th>
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
              {filteredPrescriptions.map((prescription, index) => (
                <tr key={prescription.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-4" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '500',
                    color: '#171A1F'
                  }}>{prescription.patientName}</td>
                  <td className="p-4" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '400',
                    color: '#565D6D',
                    maxWidth: '300px'
                  }}>
                    {prescription.medications.map((med, idx) => (
                      <div key={idx} className="mb-1">{med}</div>
                    ))}
                  </td>
                  <td className="p-4" style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '400',
                    color: '#565D6D'
                  }}>{prescription.doctor}</td>
                  <td className="p-4">
                    {getPriorityBadge(prescription.priority)}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontWeight: '500',
                        color: '#1E40AF',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onClick={() => router.push(`/pharmacy/dispense/${prescription.id}`)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      Dispense
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
