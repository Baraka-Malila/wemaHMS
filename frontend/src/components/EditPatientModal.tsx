'use client';

import React, { useState, useEffect } from 'react';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSuccess: () => void;
}

interface PatientData {
  full_name: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  address: string;
  blood_group: string;
  allergies: string;
  chronic_conditions: string;
  weight: string;
  height: string;
  tribe: string;
}

export default function EditPatientModal({ isOpen, onClose, patientId, onSuccess }: EditPatientModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PatientData>({
    full_name: '',
    phone_number: '',
    gender: 'MALE',
    date_of_birth: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address: '',
    blood_group: 'UNKNOWN',
    allergies: '',
    chronic_conditions: '',
    weight: '',
    height: '',
    tribe: ''
  });

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientData();
    }
  }, [isOpen, patientId]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
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
        setFormData({
          full_name: data.full_name || '',
          phone_number: data.phone_number || '',
          gender: data.gender || 'MALE',
          date_of_birth: data.date_of_birth || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          address: data.address || '',
          blood_group: data.blood_group || 'UNKNOWN',
          allergies: data.allergies || '',
          chronic_conditions: data.chronic_conditions || '',
          weight: data.weight ? data.weight.toString() : '',
          height: data.height ? data.height.toString() : '',
          tribe: data.tribe || ''
        });
      } else {
        alert('Error loading patient data');
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
      alert('Error loading patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('auth_token');
      
      // Prepare data - only send non-empty values
      const updateData: any = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value && value.toString().trim() !== '') {
          updateData[key] = value;
        }
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reception/patients/${patientId}/details/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(`Patient updated successfully!`);
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to update patient'}`);
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Error updating patient. Please try again.');
    } finally {
      setSaving(false);
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
          }}>Edit Patient</h2>
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
              <div className="text-gray-500">Loading patient data...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#171A1F'
                  }}>Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
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
                  }}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
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
                    value={formData.date_of_birth}
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
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    value={formData.weight}
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
                    value={formData.height}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                  />
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
                    value={formData.emergency_contact_name}
                    onChange={handleInputChange}
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
                  }}>Emergency Contact Phone</label>
                  <input
                    type="tel"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleInputChange}
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
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    value={formData.allergies}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Known allergies (medications, foods, etc.)"
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
                    value={formData.chronic_conditions}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Diabetes, hypertension, etc."
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                  />
                </div>
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
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {saving ? 'Updating...' : 'Update Patient'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
