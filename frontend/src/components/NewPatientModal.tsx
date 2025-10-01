'use client';

import React, { useState } from 'react';
import auth from '@/lib/auth';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewPatientModal({ isOpen, onClose, onSuccess }: NewPatientModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    phone_number: '',
    gender: 'MALE',
    date_of_birth: '',
    patient_type: 'NORMAL',
    patient_category: 'OUTPATIENT',
    nhif_card_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address: '',
    blood_group: 'UNKNOWN',
    allergies: '',
    chronic_conditions: '',
    weight: '',
    height: '',
    tribe: '',
    occupation: '',
    temperature: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    pulse_rate: '',
    respiratory_rate: '',
    file_fee_paid: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate patient type and requirements
    if (formData.patient_type === 'NHIF' && !formData.nhif_card_number.trim()) {
      alert('NHIF card number is required for NHIF patients.');
      return;
    }

    // Validate file fee payment for normal patients
    if (formData.patient_type === 'NORMAL' && !formData.file_fee_paid) {
      alert('Please mark the file fee as paid before registering the normal patient.');
      return;
    }

    // For NHIF patients, auto-mark file fee as paid (covered by insurance)
    if (formData.patient_type === 'NHIF') {
      formData.file_fee_paid = true;
    }

    setLoading(true);

    try {
      // Clean up data - convert empty strings to undefined for optional numeric fields
      const cleanedData = {
        ...formData,
        weight: formData.weight === '' ? undefined : formData.weight,
        height: formData.height === '' ? undefined : formData.height,
        temperature: formData.temperature === '' ? undefined : formData.temperature,
        blood_pressure_systolic: formData.blood_pressure_systolic === '' ? undefined : formData.blood_pressure_systolic,
        blood_pressure_diastolic: formData.blood_pressure_diastolic === '' ? undefined : formData.blood_pressure_diastolic,
        pulse_rate: formData.pulse_rate === '' ? undefined : formData.pulse_rate,
        respiratory_rate: formData.respiratory_rate === '' ? undefined : formData.respiratory_rate,
      };

      const token = auth.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reception/register-patient/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData)
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Patient registered successfully! ID: ${data.patient_id}`);
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          first_name: '',
          middle_name: '',
          last_name: '',
          phone_number: '',
          gender: 'MALE',
          date_of_birth: '',
          patient_type: 'NORMAL',
          patient_category: 'OUTPATIENT',
          nhif_card_number: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
          address: '',
          blood_group: 'UNKNOWN',
          allergies: '',
          chronic_conditions: '',
          weight: '',
          height: '',
          tribe: '',
          occupation: '',
          temperature: '',
          blood_pressure_systolic: '',
          blood_pressure_diastolic: '',
          pulse_rate: '',
          respiratory_rate: '',
          file_fee_paid: false
        });
      } else {
        const errorData = await response.json();
        console.error('Registration error:', errorData);
        alert(`Error: ${errorData.error || errorData.message || JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Error registering patient:', error);
      alert('Error registering patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '20px',
            fontWeight: '600',
            color: '#171A1F'
          }}>Register New Patient</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData(prev => ({ ...prev, first_name: value }));
                }}
                required
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Middle Name *</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData(prev => ({ ...prev, middle_name: value }));
                }}
                required
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData(prev => ({ ...prev, last_name: value }));
                }}
                required
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Phone Number *</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number || ''}
                onChange={handleInputChange}
                required
                placeholder="+255..."
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth || ''}
                onChange={handleInputChange}
                required
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Patient Type *</label>
              <select
                name="patient_type"
                value={formData.patient_type}
                onChange={handleInputChange}
                required
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              >
                <option value="NORMAL">Normal Patient (Pays fees)</option>
                <option value="NHIF">NHIF Insurance Patient</option>
              </select>
            </div>

            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Patient Category *</label>
              <select
                name="patient_category"
                value={formData.patient_category}
                onChange={handleInputChange}
                required
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              >
                <option value="OUTPATIENT">Outpatient (Visiting)</option>
                <option value="INPATIENT">Inpatient (Admitted)</option>
              </select>
            </div>

            {formData.patient_type === 'NHIF' && (
              <div>
                <label style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#171A1F'
                }}>NHIF Card Number *</label>
                <input
                  type="text"
                  name="nhif_card_number"
                  value={formData.nhif_card_number || ''}
                  onChange={handleInputChange}
                  required={formData.patient_type === 'NHIF'}
                  placeholder="Enter NHIF card number"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                />
              </div>
            )}

            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Blood Group</label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleInputChange}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              >
                <option value="UNKNOWN">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Tribe</label>
              <input
                type="text"
                name="tribe"
                value={formData.tribe}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData(prev => ({ ...prev, tribe: value }));
                }}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData(prev => ({ ...prev, occupation: value }));
                }}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Physical Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight || ''}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height || ''}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Vital Signs */}
          <div className="mb-4">
            <h3 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              color: '#171A1F',
              marginBottom: '12px'
            }}>Vital Signs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#171A1F'
                }}>Temperature (°C)</label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature || ''}
                  onChange={handleInputChange}
                  step="0.1"
                  min="30"
                  max="50"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                  placeholder="36.5"
                />
              </div>

              <div>
                <label style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#171A1F'
                }}>Systolic BP (mmHg)</label>
                <input
                  type="number"
                  name="blood_pressure_systolic"
                  value={formData.blood_pressure_systolic || ''}
                  onChange={handleInputChange}
                  min="50"
                  max="300"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                  placeholder="120"
                />
              </div>

              <div>
                <label style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#171A1F'
                }}>Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  name="blood_pressure_diastolic"
                  value={formData.blood_pressure_diastolic || ''}
                  onChange={handleInputChange}
                  min="30"
                  max="200"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                  placeholder="80"
                />
              </div>

              <div>
                <label style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#171A1F'
                }}>Pulse Rate (bpm)</label>
                <input
                  type="number"
                  name="pulse_rate"
                  value={formData.pulse_rate || ''}
                  onChange={handleInputChange}
                  min="30"
                  max="250"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                  placeholder="72"
                />
              </div>

              <div>
                <label style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#171A1F'
                }}>Respiratory Rate (b/m)</label>
                <input
                  type="number"
                  name="respiratory_rate"
                  value={formData.respiratory_rate || ''}
                  onChange={handleInputChange}
                  min="5"
                  max="60"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                  placeholder="16"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Emergency Contact Name</label>
              <input
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name || ''}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData(prev => ({ ...prev, emergency_contact_name: value }));
                }}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Emergency Contact Phone</label>
              <input
                type="tel"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone || ''}
                onChange={handleInputChange}
                placeholder="+255..."
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              color: '#171A1F'
            }}>Address</label>
            <textarea
              name="address"
              value={formData.address || ''}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setFormData(prev => ({ ...prev, address: value }));
              }}
              rows={2}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
            />
          </div>

          {/* Medical Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Allergies</label>
              <textarea
                name="allergies"
                value={formData.allergies || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#171A1F'
              }}>Chronic Conditions</label>
              <textarea
                name="chronic_conditions"
                value={formData.chronic_conditions || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* File Fee Payment */}
          <div className="border-t border-gray-200 pt-4">
            <h3 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              color: '#171A1F',
              marginBottom: '12px'
            }}>File Fee Payment</h3>
            
            {formData.patient_type === 'NHIF' ? (
              // NHIF Patient - No fee required
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1D4ED8'
                  }}>
                    NHIF Patient - File fee covered by insurance (0 TZS)
                  </p>
                </div>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  color: '#6B7280',
                  marginTop: '4px'
                }}>
                  NHIF Card: {formData.nhif_card_number || 'Enter card number above'}
                </p>
              </div>
            ) : (
              // Normal Patient - Fee required
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="file_fee_paid"
                    checked={formData.file_fee_paid}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '500', color: '#92400E' }}>
                    Mark File Fee as Paid (2000 TZS - Required)
                  </span>
                </label>

                <p className="mt-2 text-xs text-amber-700">
                  ⚠️ File fee (2000 TZS) must be paid before registering a normal patient
                </p>
              </div>
            )}

            {formData.file_fee_paid && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  color: '#16A34A'
                }}>
                  ✅ File Fee Status: Paid - Amount: 2000.00 TZS
                </p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#565D6D'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-950 disabled:opacity-50 transition-colors"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {loading ? 'Registering...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
