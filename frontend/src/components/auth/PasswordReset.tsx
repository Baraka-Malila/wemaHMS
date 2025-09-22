'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PasswordResetResponse {
  success: boolean;
  message: string;
  token?: string;
  expires_in?: number;
  errors?: any;
}

const PasswordReset: React.FC = () => {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [errors, setErrors] = useState<{ employeeId?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenGenerated, setTokenGenerated] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    } else if (!/^[A-Z]{3}[0-9]{3}$/.test(employeeId.toUpperCase())) {
      newErrors.employeeId = 'Employee ID format: ABC123 (3 letters + 3 numbers)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateToken = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/password-reset-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: employeeId.toUpperCase(),
        }),
      });

      const text = await response.text();
      const data: PasswordResetResponse = text ? JSON.parse(text) : {};

      if (!response.ok) {
        // Handle 400 errors with specific error messages from backend
        setErrors({ general: data.message || `HTTP error! status: ${response.status}` });
        return;
      }

      if (data.success && data.token) {
        setGeneratedToken(data.token);
        setTokenGenerated(true);
      } else {
        setErrors({ general: data.message || 'Failed to generate token. Please try again.' });
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(generatedToken);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedToken;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Container - Same as other auth pages */}
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
            AUTH
          </span>
        </div>
        
        {/* Clean Header Icons - Consistent with other portals */}
        <div className="flex items-center space-x-2">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg" aria-label="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
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
        {/* Main Form Container */}
        <div 
          className="bg-white relative w-full"
          style={{
            maxWidth: '480px',
            minHeight: tokenGenerated ? '480px' : '420px',
            background: '#FFFFFFFF',
            borderRadius: '12px',
            boxShadow: '0px 3px 8px rgba(23, 26, 31, 0.06), 0px 1px 3px rgba(23, 26, 31, 0.03)',
            padding: '24px'
          }}
        >
          {/* Password Reset Title */}
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
            Password reset
          </h1>
          
          {!tokenGenerated ? (
            <>
              {/* General Error Message */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleGenerateToken} noValidate className="space-y-5">
                {/* Employee ID Field */}
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
                    Employee ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="employeeId"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="Enter your employee ID"
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
                  {errors.employeeId && (
                    <p className="text-red-500 text-sm mt-2">{errors.employeeId}</p>
                  )}
                </div>

                {/* Remember Me and Back to Login */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="hidden"
                    />
                    <div 
                      className="flex items-center justify-center border transition-colors"
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        borderWidth: '2px',
                        borderColor: '#D1D5DB',
                        background: 'transparent'
                      }}
                    />
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
                      Remember me
                    </span>
                  </label>

                  <Link
                    href="/login"
                    className="hover:underline transition-colors"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      lineHeight: '22px',
                      fontWeight: '400',
                      color: '#4A90E2FF',
                      textDecoration: 'none'
                    }}
                  >
                    Back to login
                  </Link>
                </div>

                {/* Generate Token Button */}
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
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
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
                    'Generate Token'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Token Generated View */
            <div className="text-center space-y-6">
              {/* Success Icon */}
              <div 
                className="inline-flex items-center justify-center mx-auto"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  marginBottom: '16px'
                }}
              >
                <svg 
                  style={{
                    width: '32px',
                    height: '32px',
                    fill: '#FFFFFF'
                  }}
                  viewBox="0 0 24 24"
                >
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
                </svg>
              </div>

              <h2 
                style={{
                  fontFamily: 'Open Sans, sans-serif',
                  fontSize: '20px',
                  lineHeight: '28px',
                  fontWeight: '600',
                  color: '#2563EB',
                  marginBottom: '8px'
                }}
              >
                Token Generated Successfully!
              </h2>

              {/* Token Display */}
              <div 
                className="p-6 rounded-lg"
                style={{
                  background: 'linear-gradient(120deg, #F0F8FF 0%, #E6F3FF 100%)',
                  border: '2px solid #C8DEF6FF'
                }}
              >
                <p 
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px'
                  }}
                >
                  Your Reset Token:
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <span 
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '32px',
                      lineHeight: '40px',
                      fontWeight: '700',
                      color: '#1E40AF',
                      letterSpacing: '4px'
                    }}
                  >
                    {generatedToken}
                  </span>
                  <button
                    onClick={copyToken}
                    className="flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: '#4A90E2FF',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <svg 
                      style={{
                        width: '20px',
                        height: '20px',
                        fill: '#FFFFFF'
                      }}
                      viewBox="0 0 24 24"
                    >
                      <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div 
                className="p-4 rounded-lg text-left"
                style={{
                  background: '#FEF3C7',
                  border: '1px solid #F59E0B'
                }}
              >
                <p 
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: '600',
                    color: '#92400E',
                    textAlign: 'center'
                  }}
                >
                  Physically reach out to Admin with the token below for password reset completion!
                </p>
              </div>

              {/* Back to Login */}
              <Link
                href="/login"
                className="inline-flex items-center justify-center border-none rounded-lg transition-all duration-200 hover:shadow-md"
                style={{
                  height: '48px',
                  padding: '0 32px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  lineHeight: '24px',
                  fontWeight: '600',
                  color: '#6B7280',
                  background: '#F9FAFB',
                  border: '2px solid #E5E7EB',
                  textDecoration: 'none'
                }}
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
