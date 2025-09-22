'use client';

import React, { useState, useEffect } from 'react';
import auth from '@/lib/auth';

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onCheckIn?: () => void;
}

interface PatientDetails {
  id: string;
  patient_id: string;
  full_name: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  age: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  blood_group: string;
  allergies?: string;
  chronic_conditions?: string;
  weight?: number;
  height?: number;
  bmi?: number;
  current_status: string;
  current_location?: string;
  file_fee_paid: boolean;
  file_fee_amount: number;
  patient_type?: string;
  nhif_card_number?: string;
  tribe?: string;
  created_at: string;
  updated_at: string;
}

export default function PatientDetailsModal({ isOpen, onClose, patientId, onEdit, onDelete, onCheckIn }: PatientDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<PatientDetails | null>(null);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientDetails();
    }
  }, [isOpen, patientId]);

  const fetchPatientDetails = async () => {
    setLoading(true);
    try {
      const token = auth.getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/patients/${patientId}/`,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPatient(data);
      } else {
        alert('Error loading patient details');
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      alert('Error loading patient details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseStyle = {
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '14px',
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
          <div>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '20px',
              fontWeight: '600',
              color: '#171A1F'
            }}>Patient Details</h2>
            {patient && (
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#565D6D',
                marginTop: '4px'
              }}>
                {patient.patient_id} - {patient.full_name}
              </p>
            )}
          </div>
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

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading patient details...</div>
            </div>
          ) : patient ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#171A1F',
                  marginBottom: '16px'
                }}>Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                      Full Name
                    </label>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                      {patient.full_name}
                    </p>
                  </div>
                  
                  <div>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                      Patient ID
                    </label>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#0F74C7', marginTop: '4px', fontWeight: '500' }}>
                      {patient.patient_id}
                    </p>
                  </div>
                  
                  <div>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                      Phone Number
                    </label>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                      {patient.phone_number}
                    </p>
                  </div>
                  
                  <div>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                      Gender
                    </label>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                      {patient.gender}
                    </p>
                  </div>
                  
                  <div>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                      Age
                    </label>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                      {patient.age} years
                    </p>
                  </div>
                  
                  <div>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                      Date of Birth
                    </label>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                      {new Date(patient.date_of_birth).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                      Blood Group
                    </label>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                      {patient.blood_group}
                    </p>
                  </div>
                  
                  {patient.tribe && (
                    <div>
                      <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                        Tribe
                      </label>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                        {patient.tribe}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Physical Information */}
              {(patient.weight || patient.height) && (
                <div>
                  <h3 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#171A1F',
                    marginBottom: '16px'
                  }}>Physical Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {patient.weight && (
                      <div>
                        <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                          Weight
                        </label>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                          {patient.weight} kg
                        </p>
                      </div>
                    )}
                    
                    {patient.height && (
                      <div>
                        <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                          Height
                        </label>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                          {patient.height} cm
                        </p>
                      </div>
                    )}
                    
                    {patient.bmi && (
                      <div>
                        <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                          BMI
                        </label>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                          {patient.bmi}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
                <div>
                  <h3 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#171A1F',
                    marginBottom: '16px'
                  }}>Emergency Contact</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patient.emergency_contact_name && (
                      <div>
                        <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                          Contact Name
                        </label>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                          {patient.emergency_contact_name}
                        </p>
                      </div>
                    )}
                    
                    {patient.emergency_contact_phone && (
                      <div>
                        <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                          Contact Phone
                        </label>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                          {patient.emergency_contact_phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medical Information */}
              {(patient.allergies || patient.chronic_conditions) && (
                <div>
                  <h3 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#171A1F',
                    marginBottom: '16px'
                  }}>Medical Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patient.allergies && (
                      <div>
                        <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                          Allergies
                        </label>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                          {patient.allergies}
                        </p>
                      </div>
                    )}
                    
                    {patient.chronic_conditions && (
                      <div>
                        <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                          Chronic Conditions
                        </label>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                          {patient.chronic_conditions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Current Status */}
              <div>
                <h3 style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#171A1F',
                  marginBottom: '16px'
                }}>Current Status</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                      Status
                    </label>
                    <div style={{ marginTop: '4px' }}>
                      {getStatusBadge(patient.current_status)}
                    </div>
                  </div>
                  
                  {patient.current_location && (
                    <div>
                      <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: '500', color: '#9CA3AF' }}>
                        Current Location
                      </label>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F', marginTop: '4px' }}>
                        {patient.current_location}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              {patient.address && (
                <div>
                  <h3 style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#171A1F',
                    marginBottom: '16px'
                  }}>Address</h3>
                  
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#171A1F' }}>
                    {patient.address}
                  </p>
                </div>
              )}

              {/* File Fee Status */}
              <div>
                <h3 style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#171A1F',
                  marginBottom: '16px'
                }}>File Fee Status</h3>
                
                <div className="flex items-center gap-4">
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: patient.file_fee_paid ? '#F0FDF4' : '#FEF2F2',
                    color: patient.file_fee_paid ? '#166534' : '#DC2626',
                    border: patient.file_fee_paid ? '1px solid #BBF7D0' : '1px solid #FECACA'
                  }}>
                    {patient.file_fee_paid ? 'Paid' : 'Pending'}
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#565D6D' }}>
                    Amount: {patient.file_fee_amount} TZS
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">Failed to load patient details</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              color: '#565D6D'
            }}
          >
            Close
          </button>
          
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Edit Patient
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Delete Patient
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
