'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegistrationSuccessModal from './RegistrationSuccessModal';

interface SignUpResponse {
  success: boolean;
  message: string;
  employee_id?: string;
  user?: {
    id: string;
    employee_id: string;
    full_name: string;
    role: string;
    portal_access: string;
  };
  errors?: any;
}

const SignUp: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    department: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [generatedEmployeeId, setGeneratedEmployeeId] = useState('');
  const [errors, setErrors] = useState<{
    fullName?: string;
    department?: string;
    phoneNumber?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form persistence: Save form data to localStorage when user navigates to terms/privacy
  useEffect(() => {
    const savedFormData = localStorage.getItem('wema_signup_form_data');
    const savedAgreeToTerms = localStorage.getItem('wema_signup_agree_terms');
    
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
    
    if (savedAgreeToTerms) {
      setAgreeToTerms(savedAgreeToTerms === 'true');
    }
  }, []);

  // Save form data whenever it changes
  useEffect(() => {
    if (formData.fullName || formData.email || formData.phoneNumber) {
      localStorage.setItem('wema_signup_form_data', JSON.stringify(formData));
    }
  }, [formData]);

  // Save terms agreement when it changes
  useEffect(() => {
    localStorage.setItem('wema_signup_agree_terms', agreeToTerms.toString());
  }, [agreeToTerms]);

  // Clear saved data on successful submission
  const clearSavedData = () => {
    localStorage.removeItem('wema_signup_form_data');
    localStorage.removeItem('wema_signup_agree_terms');
  };

  // Clear saved data when component unmounts (navigating to different auth page)
  useEffect(() => {
    return () => {
      // Only clear if not going to terms/privacy pages
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/terms') && !currentPath.includes('/privacy') && !currentPath.includes('/register')) {
        clearSavedData();
      }
    };
  }, []);

  const departments = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'RECEPTION', label: 'Reception' },
    { value: 'DOCTOR', label: 'Doctor' },
    { value: 'NURSE', label: 'Nurse' },
    { value: 'PHARMACY', label: 'Pharmacy' },
    { value: 'LAB', label: 'Lab Technician' },
    { value: 'FINANCE', label: 'Finance' },
  ];

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    if (!formData.department) {
      newErrors.department = 'Department/Role is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the Terms of Use and Privacy Policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName.trim(),
          role: formData.department,
          phone_number: formData.phoneNumber.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirm_password: formData.confirmPassword,
        }),
      });

      const text = await response.text();
      const data: SignUpResponse = text ? JSON.parse(text) : {};

      if (!response.ok) {
        // Handle 400 errors with specific error messages from backend
        if (data.errors) {
          // Map backend field errors to frontend error state
          const backendErrors: typeof errors = {};
          
          // Map backend field names to frontend field names
          if (data.errors.full_name) {
            backendErrors.fullName = data.errors.full_name[0];
          }
          if (data.errors.role) {
            backendErrors.department = data.errors.role[0];
          }
          if (data.errors.phone_number) {
            backendErrors.phoneNumber = data.errors.phone_number[0];
          }
          if (data.errors.email) {
            backendErrors.email = data.errors.email[0];
          }
          if (data.errors.password) {
            backendErrors.password = data.errors.password[0];
          }
          if (data.errors.confirm_password) {
            backendErrors.confirmPassword = data.errors.confirm_password[0];
          }
          if (data.errors.non_field_errors) {
            backendErrors.general = data.errors.non_field_errors[0];
          }
          
          // If no specific field errors, show general message
          if (Object.keys(backendErrors).length === 0) {
            backendErrors.general = data.message || 'Validation error occurred';
          }
          
          setErrors(backendErrors);
        } else {
          setErrors({ general: data.message || `HTTP error! status: ${response.status}` });
        }
        return;
      }

      if (data.success && data.employee_id) {
        // Clear saved form data on successful registration
        clearSavedData();
        // Show success modal instead of redirecting immediately
        setGeneratedEmployeeId(data.employee_id);
        setShowModal(true);
      } else {
        setErrors({ general: data.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Container - Same as sign-in */}
      <div 
        className="absolute top-0 left-0 w-full flex items-center justify-between px-6"
        style={{ 
          height: '50px',
          background: '#FAFAFBFF',
          borderRadius: '0px 0px 6px 6px',
          boxShadow: '0px 1px 3px rgba(23, 26, 31, 0.04), 0px 1px 2px rgba(23, 26, 31, 0.02)'
        }}
      >
        {/* Logo Section */}
        <div className="flex items-center">
          <span 
            className="font-bold"
            style={{ 
              fontFamily: 'Open Sans, sans-serif',
              fontSize: '18px',
              lineHeight: '18px',
              fontWeight: '700',
              color: '#4A90E2FF'
            }}
          >
            ❄️ AUTH 🛡️
          </span>
        </div>
        
        {/* Header Icons */}
        <div className="flex items-center space-x-2">
          <div 
            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
            style={{ fontSize: '10px' }}
          >
            🔔
          </div>
          <div 
            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
            style={{ fontSize: '10px' }}
          >
            ⚙️
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ 
          paddingTop: '70px',
          background: 'linear-gradient(120.14deg, #C8DEF6FF 50%, #F6C6E6FF 100%)'
        }}
      >
        {/* Main Form Container - Taller for more fields */}
        <div 
          className="bg-white relative w-full"
          style={{
            maxWidth: '480px',
            minHeight: '680px', // Taller for more fields
            background: '#FFFFFFFF',
            borderRadius: '12px',
            boxShadow: '0px 3px 8px rgba(23, 26, 31, 0.06), 0px 1px 3px rgba(23, 26, 31, 0.03)',
            padding: '24px'
          }}
        >
          {/* Sign up Title */}
          <h1 
            className="text-center mb-6"
            style={{
              fontFamily: 'Open Sans, sans-serif',
              fontSize: '24px',
              lineHeight: '32px',
              fontWeight: '700',
              color: '#2563EB',
              marginTop: '4px'
            }}
          >
            Sign up
          </h1>
          
          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  lineHeight: '22px',
                  fontWeight: '600',
                  color: '#374151'
                }}
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border-0 rounded-lg outline-none transition-all duration-200 placeholder-gray-400"
                  style={{
                    height: '44px',
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    fontWeight: '400',
                    background: '#F5F5F5',
                    borderRadius: '8px',
                    color: '#1F2937'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = '#FFFFFF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#F5F5F5';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <svg 
                  className="absolute pointer-events-none"
                  style={{
                    top: '14px',
                    left: '14px',
                    width: '16px',
                    height: '16px',
                    fill: '#9CA3AF'
                  }}
                  viewBox="0 0 24 24"
                >
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-2">{errors.fullName}</p>
              )}
            </div>

            {/* Department/Role Field */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  lineHeight: '22px',
                  fontWeight: '600',
                  color: '#374151'
                }}
              >
                Department/Role
              </label>
              <div className="relative">
                <select
                  name="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full border-0 rounded-lg outline-none transition-all duration-200 appearance-none cursor-pointer"
                  style={{
                    height: '44px',
                    paddingLeft: '44px',
                    paddingRight: '44px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    fontWeight: '400',
                    background: '#F5F5F5',
                    borderRadius: '8px',
                    color: formData.department ? '#1F2937' : '#9CA3AF'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = '#FFFFFF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#F5F5F5';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
                <svg 
                  className="absolute pointer-events-none"
                  style={{
                    top: '14px',
                    left: '14px',
                    width: '16px',
                    height: '16px',
                    fill: '#9CA3AF'
                  }}
                  viewBox="0 0 24 24"
                >
                  <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19Z" />
                </svg>
                <svg 
                  className="absolute pointer-events-none"
                  style={{
                    top: '18px',
                    right: '14px',
                    width: '12px',
                    height: '12px',
                    fill: '#9CA3AF'
                  }}
                  viewBox="0 0 24 24"
                >
                  <path d="M7,10L12,15L17,10H7Z" />
                </svg>
              </div>
              {errors.department && (
                <p className="text-red-500 text-sm mt-2">{errors.department}</p>
              )}
            </div>

            {/* Phone Number Field */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  lineHeight: '22px',
                  fontWeight: '600',
                  color: '#374151'
                }}
              >
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full border-0 rounded-lg outline-none transition-all duration-200 placeholder-gray-400"
                  style={{
                    height: '44px',
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    fontWeight: '400',
                    background: '#F5F5F5',
                    borderRadius: '8px',
                    color: '#1F2937'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = '#FFFFFF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#F5F5F5';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <svg 
                  className="absolute pointer-events-none"
                  style={{
                    top: '14px',
                    left: '14px',
                    width: '16px',
                    height: '16px',
                    fill: '#9CA3AF'
                  }}
                  viewBox="0 0 24 24"
                >
                  <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />
                </svg>
              </div>
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-2">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  lineHeight: '22px',
                  fontWeight: '600',
                  color: '#374151'
                }}
              >
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="How others see you"
                  className="w-full border-0 rounded-lg outline-none transition-all duration-200 placeholder-gray-400"
                  style={{
                    height: '44px',
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    fontWeight: '400',
                    background: '#F5F5F5',
                    borderRadius: '8px',
                    color: '#1F2937'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = '#FFFFFF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#F5F5F5';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <svg 
                  className="absolute pointer-events-none"
                  style={{
                    top: '14px',
                    left: '14px',
                    width: '16px',
                    height: '16px',
                    fill: '#9CA3AF'
                  }}
                  viewBox="0 0 24 24"
                >
                  <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z" />
                </svg>
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">{errors.email}</p>
              )}
            </div>
            
            {/* Password Field */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  lineHeight: '22px',
                  fontWeight: '600',
                  color: '#374151'
                }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border-0 rounded-lg outline-none transition-all duration-200 placeholder-gray-400"
                  style={{
                    height: '44px',
                    paddingLeft: '44px',
                    paddingRight: '44px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    fontWeight: '400',
                    background: '#F5F5F5',
                    borderRadius: '8px',
                    color: '#1F2937'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = '#FFFFFF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#F5F5F5';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <svg 
                  className="absolute pointer-events-none"
                  style={{
                    top: '14px',
                    left: '14px',
                    width: '16px',
                    height: '16px',
                    fill: '#9CA3AF'
                  }}
                  viewBox="0 0 24 24"
                >
                  <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                  style={{
                    top: '10px',
                    right: '10px',
                    width: '24px',
                    height: '24px'
                  }}
                >
                  <svg 
                    style={{
                      width: '16px',
                      height: '16px',
                      fill: '#9CA3AF'
                    }}
                    viewBox="0 0 24 24"
                  >
                    {showPassword ? (
                      <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z" />
                    ) : (
                      <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-2">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  lineHeight: '22px',
                  fontWeight: '600',
                  color: '#374151'
                }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Enter your password again"
                  className="w-full border-0 rounded-lg outline-none transition-all duration-200 placeholder-gray-400"
                  style={{
                    height: '44px',
                    paddingLeft: '44px',
                    paddingRight: '44px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    fontWeight: '400',
                    background: '#F5F5F5',
                    borderRadius: '8px',
                    color: '#1F2937'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = '#FFFFFF';
                    e.target.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = '#F5F5F5';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <svg 
                  className="absolute pointer-events-none"
                  style={{
                    top: '14px',
                    left: '14px',
                    width: '16px',
                    height: '16px',
                    fill: '#9CA3AF'
                  }}
                  viewBox="0 0 24 24"
                >
                  <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                  style={{
                    top: '10px',
                    right: '10px',
                    width: '24px',
                    height: '24px'
                  }}
                >
                  <svg 
                    style={{
                      width: '16px',
                      height: '16px',
                      fill: '#9CA3AF'
                    }}
                    viewBox="0 0 24 24"
                  >
                    {showConfirmPassword ? (
                      <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z" />
                    ) : (
                      <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                    )}
                  </svg>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="hidden"
                />
                <div 
                  className="flex items-center justify-center border transition-colors mt-1"
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    borderWidth: '2px',
                    borderColor: agreeToTerms ? '#4A90E2FF' : '#D1D5DB',
                    background: agreeToTerms ? '#4A90E2FF' : 'transparent',
                    flexShrink: 0
                  }}
                >
                  {agreeToTerms && (
                    <svg 
                      style={{
                        width: '12px',
                        height: '12px',
                        fill: '#FFFFFF'
                      }}
                      viewBox="0 0 24 24"
                    >
                      <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                    </svg>
                  )}
                </div>
                <span 
                  className="ml-3"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '22px',
                    fontWeight: '400',
                    color: '#374151'
                  }}
                >
                  By signing up, I agree with the{' '}
                  <Link
                    href="/terms"
                    className="hover:underline"
                    style={{ color: '#4A90E2FF', fontWeight: '500' }}
                  >
                    Terms of Use
                  </Link>
                  {' '} &{' '}
                  <Link
                    href="/privacy"
                    className="hover:underline"
                    style={{ color: '#4A90E2FF', fontWeight: '500' }}
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-sm mt-1">{errors.terms}</p>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center border-none rounded-lg transition-all duration-200 hover:shadow-md"
              style={{
                height: '48px',
                padding: '0 24px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                fontWeight: '600',
                color: '#1E40AF',
                background: '#C8DEF6FF',
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: '24px'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#B8D4F1FF';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#C8DEF6FF';
                }
              }}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign up'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div 
            className="text-center mt-6"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              lineHeight: '22px',
              fontWeight: '400',
              color: '#6B7280'
            }}
          >
            Already have an account?{' '}
            <Link
              href="/login"
              className="hover:underline transition-colors"
              style={{ 
                color: '#4A90E2FF',
                fontWeight: '500'
              }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
      
      {/* Registration Success Modal */}
      <RegistrationSuccessModal
        isOpen={showModal}
        employeeId={generatedEmployeeId}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default SignUp;
