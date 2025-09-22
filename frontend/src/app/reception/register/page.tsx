'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import auth from '@/lib/auth';

interface PatientData {
  full_name: string;
  date_of_birth: string;
  gender: string;
  phone_number: string;
  email: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_history: string;
  allergies: string;
  current_medications: string;
}

export default function RegisterPatient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PatientData>({
    full_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_history: '',
    allergies: '',
    current_medications: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = auth.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/reception/register-patient/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Patient registered successfully!');
        router.push('/reception/dashboard');
      } else {
        alert(data.message || 'Failed to register patient');
      }
    } catch (error) {
      console.error('Error registering patient:', error);
      alert('Error registering patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '24px' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 style={{
            fontSize: '28px',
            lineHeight: '35px',
            fontWeight: '700',
            color: '#1F2937',
            marginBottom: '8px'
          }}>Register New Patient</h1>
          <p style={{
            fontSize: '16px',
            lineHeight: '20px',
            fontWeight: '400',
            color: '#6B7280'
          }}>Fill in the patient information to create a new medical record</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information Section */}
            <div className="md:col-span-2">
              <h2 style={{
                fontSize: '18px',
                lineHeight: '23px',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '16px'
              }}>Personal Information</h2>
            </div>

            <div>
              <label style={{
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '500',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <div>
              <label style={{
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '500',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <div>
              <label style={{
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '500',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>

            <div>
              <label style={{
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '500',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>Phone Number *</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                placeholder="+255..."
              />
            </div>

            <div>
              <label style={{
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '500',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <div className="md:col-span-2">
              <label style={{
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '500',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            {/* Emergency Contact Section */}
            <div className="md:col-span-2 mt-6">
              <h2 style={{
                fontSize: '18px',
                lineHeight: '23px',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '16px'
              }}>Emergency Contact</h2>
            </div>

            <div>
              <label style={{
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '500',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>Emergency Contact Name</label>
              <input
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <div>
              <label style={{
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '500',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>Emergency Contact Phone</label>
              <input
                type="tel"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                placeholder="+255..."
              />
            </div>

            {/* Medical Information Section */}
            <div className="md:col-span-2 mt-6">
              <h2 style={{
                fontSize: '18px',
                lineHeight: '23px',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '16px'
              }}>Medical Information</h2>
            </div>

            <div className="md:col-span-2">
              <label style={{
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '500',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>Medical History</label>
              <textarea
                name="medical_history"
                value={formData.medical_history}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                placeholder="Previous medical conditions, surgeries, etc."
              />
            </div>

            <div>
              <label style={{
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '500',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>Allergies</label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                placeholder="Drug allergies, food allergies, etc."
              />
            </div>

            <div>
              <label style={{
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '500',
                color: '#374151',
                display: 'block',
                marginBottom: '8px'
              }}>Current Medications</label>
              <textarea
                name="current_medications"
                value={formData.current_medications}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                placeholder="Current medications and dosages"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/reception/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}
            >
              {loading ? 'Registering...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
