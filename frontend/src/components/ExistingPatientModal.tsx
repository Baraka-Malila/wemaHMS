'use client';

import React, { useState } from 'react';

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

interface ExistingPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: Patient) => void;
  onCheckInPatient?: (patient: Patient) => void;
}

export default function ExistingPatientModal({ isOpen, onClose, onSelectPatient, onCheckInPatient }: ExistingPatientModalProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search term');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/patients/search/?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        alert('Error searching patients');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      alert('Error searching patients. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusBadge = (status: string) => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '8px',
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '20px',
            fontWeight: '600',
            color: '#171A1F'
          }}>Find Existing Patient</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Search Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-3">
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
                placeholder="Search by name, phone number, or patient ID (PAT123)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px'
                }}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Searching patients...</div>
            </div>
          ) : hasSearched ? (
            searchResults.length > 0 ? (
              <div className="space-y-3">
                <h3 style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#171A1F'
                }}>
                  Found {searchResults.length} patient(s)
                </h3>
                
                <div className="space-y-2">
                  {searchResults.map((patient) => (
                    <div
                      key={patient.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        onSelectPatient(patient);
                        onClose();
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#171A1F'
                            }}>
                              {patient.full_name}
                            </h4>
                            <span style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#0F74C7'
                            }}>
                              {patient.patient_id}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '12px',
                                fontWeight: '500',
                                color: '#9CA3AF'
                              }}>
                                Phone:
                              </span>
                              <div style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                color: '#565D6D'
                              }}>
                                {patient.phone_number || 'N/A'}
                              </div>
                            </div>
                            
                            <div>
                              <span style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '12px',
                                fontWeight: '500',
                                color: '#9CA3AF'
                              }}>
                                Age/Gender:
                              </span>
                              <div style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                color: '#565D6D'
                              }}>
                                {patient.age} / {patient.gender}
                              </div>
                            </div>
                            
                            <div>
                              <span style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '12px',
                                fontWeight: '500',
                                color: '#9CA3AF'
                              }}>
                                Status:
                              </span>
                              <div className="mt-1">
                                {getStatusBadge(patient.current_status)}
                              </div>
                            </div>
                            
                            <div>
                              <span style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '12px',
                                fontWeight: '500',
                                color: '#9CA3AF'
                              }}>
                                Location:
                              </span>
                              <div style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                color: '#565D6D'
                              }}>
                                {patient.current_location || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex gap-2">
                          {/* Check In Button - only for completed patients */}
                          {patient.current_status === 'COMPLETED' && onCheckInPatient && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCheckInPatient(patient);
                              }}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                              title="Check In for New Visit"
                            >
                              ✓ Check In
                            </button>
                          )}
                          
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">No patients found</div>
                <div className="text-sm text-gray-400">
                  Try searching with different keywords: patient ID (PAT123), full name, or phone number
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">Start by searching for a patient</div>
              <div className="text-sm text-gray-400">
                Enter patient ID (PAT123), full name, or phone number above
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
