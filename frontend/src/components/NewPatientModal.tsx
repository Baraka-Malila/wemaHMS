'use client';

import React, { useState } from 'react';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewPatientModal({ isOpen, onClose, onSuccess }: NewPatientModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
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
    tribe: '',
    file_fee_paid: false,
    file_fee_amount: 2000.00
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
    
    // Validate file fee payment
    if (!formData.file_fee_paid) {
      alert('Please mark the file fee as paid before registering the patient.');
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reception/register-patient/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Patient registered successfully! ID: ${data.patient_id}`);
        onSuccess();
        onClose();
        // Reset form
        setFormData({
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
          tribe: '',
          file_fee_paid: false,
          file_fee_amount: 2000.00
        });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to register patient'}`);
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

          {/* File Fee Payment */}
          <div className="border-t border-gray-200 pt-4">
            <h3 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              color: '#171A1F',
              marginBottom: '12px'
            }}>File Fee Payment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#171A1F'
                }}>File Fee Amount (TZS)</label>
                <input
                  type="number"
                  name="file_fee_amount"
                  value={formData.file_fee_amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                  readOnly
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="file_fee_paid"
                    checked={formData.file_fee_paid}
                    onChange={handleInputChange}
                    className="mr-3 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#171A1F'
                  }}>
                    Mark as Paid
                  </span>
                </label>
              </div>
            </div>

            {formData.file_fee_paid && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  color: '#16A34A'
                }}>
                  ✅ File Fee Status: Paid - Amount: {formData.file_fee_amount.toFixed(2)} TZS
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
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
