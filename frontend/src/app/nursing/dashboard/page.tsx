'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Patient {
  id: string;
  name: string;
  room: string;
  condition: string;
  status: 'Stable' | 'Critical' | 'Monitoring';
}

export default function NursingDashboard() {
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

    // Simulate loading patients data
    setTimeout(() => {
      setPatients([
        {
          id: 'P001',
          name: 'Alice Johnson',
          room: 'A101',
          condition: 'Post-operative care',
          status: 'Stable'
        },
        {
          id: 'P002',
          name: 'Robert Davis',
          room: 'A102',
          condition: 'Cardiac monitoring',
          status: 'Critical'
        },
        {
          id: 'P003',
          name: 'Sophia Lee',
          room: 'B201',
          condition: 'Recovery',
          status: 'Monitoring'
        },
        {
          id: 'P004',
          name: 'David Kim',
          room: 'B202',
          condition: 'Pneumonia treatment',
          status: 'Stable'
        },
        {
          id: 'P005',
          name: 'Maria Garcia',
          room: 'C301',
          condition: 'Diabetes management',
          status: 'Stable'
        },
        {
          id: 'P006',
          name: 'James Wilson',
          room: 'C302',
          condition: 'Hypertension monitoring',
          status: 'Monitoring'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter patients based on search and status
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.room.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === '' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: '#F8F9FA',
        fontFamily: 'Inter, sans-serif'
      }}
    >
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
          Welcome, {currentUser?.full_name || 'Nurse'}
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
          Your nursing dashboard for comprehensive patient care.
        </p>
      </div>

      {/* Search and Action Buttons */}
      <div className="flex items-center justify-between mb-8 gap-4">
        {/* Search and Filter Container */}
        <div className="flex items-center gap-4" style={{ flex: '0 0 50%' }}>
          {/* Search Bar */}
          <div className="relative flex-1">
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              minWidth: '120px'
            }}
          >
            <option value="">All Status</option>
            <option value="Stable">Stable</option>
            <option value="Critical">Critical</option>
            <option value="Monitoring">Monitoring</option>
          </select>
        </div>

        {/* Action Buttons Container */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/nursing/care')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            Patient Care
          </button>

          <button
            onClick={() => router.push('/nursing/wards')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Ward Management
          </button>
        </div>
      </div>

      {/* Patients List */}
      <div className="grid gap-4">
        {filteredPatients.map((patient) => (
          <div 
            key={patient.id}
            className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            style={{
              border: '1px solid rgba(229, 231, 235, 0.6)',
              boxShadow: '0px 0px 1px rgba(23, 26, 31, 0.05), 0px 0px 2px rgba(23, 26, 31, 0.08)'
            }}
            onClick={() => router.push('/nursing/care')}
          >
            <div className="flex items-center justify-between">
              {/* Patient Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#19191F',
                      margin: 0
                    }}
                  >
                    {patient.name}
                  </h3>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      patient.status === 'Critical' 
                        ? 'bg-red-100 text-red-800' 
                        : patient.status === 'Monitoring'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {patient.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span 
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#565D6D',
                        fontWeight: '500'
                      }}
                    >
                      Patient ID:
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#19191F',
                        marginLeft: '8px'
                      }}
                    >
                      {patient.id}
                    </span>
                  </div>
                  <div>
                    <span 
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#565D6D',
                        fontWeight: '500'
                      }}
                    >
                      Room:
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#19191F',
                        marginLeft: '8px'
                      }}
                    >
                      {patient.room}
                    </span>
                  </div>
                  <div>
                    <span 
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#565D6D',
                        fontWeight: '500'
                      }}
                    >
                      Condition:
                    </span>
                    <span 
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: '#19191F',
                        marginLeft: '8px'
                      }}
                    >
                      {patient.condition}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Arrow */}
              <div className="ml-4">
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="text-gray-400"
                >
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            className="mx-auto text-gray-400 mb-4"
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <p 
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              color: '#565D6D'
            }}
          >
            No patients found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}
