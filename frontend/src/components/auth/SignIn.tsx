'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import auth from '@/lib/auth';

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    employee_id: string;
    full_name: string;
    role: string;
    portal_access: string;
  };
  errors?: any;
}

const SignIn: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ employeeId?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-fill employee ID from URL params (from registration redirect)
  useEffect(() => {
    const employeeIdParam = searchParams.get('employeeId');
    const messageParam = searchParams.get('message');
    
    if (employeeIdParam || messageParam) {
      if (employeeIdParam) {
        setEmployeeId(employeeIdParam);
      }
      
      if (messageParam) {
        setSuccessMessage(messageParam);
        // Clear the message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      }
      
      // Clear URL parameters after using them (one-time auto-fill)
      router.replace('/login', undefined);
    }
  }, [searchParams, router]);

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    } else if (!/^[A-Z]{3}[0-9]{3}$/.test(employeeId.toUpperCase())) {
      newErrors.employeeId = 'Employee ID format: ABC123 (3 letters + 3 numbers)';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ||
                    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
                      ? `http://${window.location.hostname}:8000`
                      : 'http://localhost:8000');

      const response = await fetch(`${apiUrl}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: employeeId.toUpperCase(),
          password,
          remember_me: rememberMe,
        }),
      });

      const text = await response.text();
      const data: LoginResponse = text ? JSON.parse(text) : {};

      if (!response.ok) {
        // Handle 400 errors with specific error messages from backend
        setErrors({ general: data.message || `HTTP error! status: ${response.status}` });
        return;
      }

      if (data.success && data.token && data.user) {
        // Store authentication data using auth manager
        auth.setAuth(data.token, data.user, rememberMe);

        // Redirect based on user role/portal access
        const portalRoutes: { [key: string]: string } = {
          'admin': '/admin/dashboard',
          'pharmacy': '/pharmacy/dashboard',
          'reception': '/reception/dashboard',
          'doctor': '/doctor/dashboard',
          'lab': '/lab/dashboard',
          'nurse': '/nursing/dashboard',
          'nursing': '/nursing/dashboard',
          'finance': '/finance/dashboard',
        };

        const redirectPath = portalRoutes[data.user.portal_access] || '/dashboard';
        router.push(redirectPath);
      } else {
        setErrors({ general: data.message || 'Invalid Employee ID or password' });
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setErrors({ general: 'Connection failed. Please check if the server is running and try again.' });
      } else if (error instanceof SyntaxError) {
        setErrors({ general: 'Server response error. Please try again or contact support.' });
      } else {
        setErrors({ general: 'Network error. Please check your connection and try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Container - Further reduced */}
      <div 
        className="absolute top-0 left-0 w-full flex items-center justify-between px-6"
        style={{ 
          height: '50px', // Reduced from 60px
          background: '#FAFAFBFF',
          borderRadius: '0px 0px 6px 6px', // Smaller radius
          boxShadow: '0px 1px 3px rgba(23, 26, 31, 0.04), 0px 1px 2px rgba(23, 26, 31, 0.02)' // Lighter shadow
        }}
      >
        {/* Logo Section - Clean without emojis */}
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

      {/* Main Content Container - Responsive */}
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ 
          paddingTop: '70px', // Account for smaller header
          background: 'linear-gradient(120.14deg, #C8DEF6FF 50%, #F6C6E6FF 100%)'
        }}
      >
        {/* Main Form Container - Smaller and more compact */}
        <div 
          className="bg-white relative w-full"
          style={{
            maxWidth: '480px', // Much smaller width
            minHeight: '360px', // Reduced height
            background: '#FFFFFFFF',
            borderRadius: '12px', // Smaller radius
            boxShadow: '0px 3px 8px rgba(23, 26, 31, 0.06), 0px 1px 3px rgba(23, 26, 31, 0.03)', // Lighter shadow
            padding: '24px' // Reduced padding
          }}
        >
          {/* Sign in Title - Strong blue with Open Sans font */}
          <h1 
            className="text-center mb-6" // Reduced margin
            style={{
              fontFamily: 'Open Sans, sans-serif', // Clean Open Sans
              fontSize: '24px', // Smaller font
              lineHeight: '32px',
              fontWeight: '700', // Bold like your CSS specification
              color: '#2563EB', // Strong blue to match button
              marginTop: '4px'
            }}
          >
            Sign in
          </h1>
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg 
                  style={{
                    width: '20px',
                    height: '20px',
                    fill: '#10B981'
                  }}
                  viewBox="0 0 24 24"
                >
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                </svg>
                <p className="text-green-700 text-sm font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="space-y-5"> {/* Reduced spacing */}
            {/* Employee ID Field */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontFamily: 'Inter, sans-serif', // Changed to Inter
                  fontSize: '14px',
                  lineHeight: '22px',
                  fontWeight: '600', // Slightly less bold
                  color: '#374151' // Softer gray
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
                    height: '44px', // Slightly larger for better UX
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    fontFamily: 'Inter, sans-serif', // Changed to Inter
                    fontSize: '14px',
                    lineHeight: '22px',
                    fontWeight: '400',
                    background: '#F5F5F5', // Less transparent, more solid
                    borderRadius: '8px',
                    color: '#1F2937' // Darker text for better readability
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
            
            {/* Password Field */}
            <div>
              <label 
                className="block mb-2"
                style={{
                  fontFamily: 'Inter, sans-serif', // Changed to Inter
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border-0 rounded-lg outline-none transition-all duration-200 placeholder-gray-400"
                  style={{
                    height: '44px',
                    paddingLeft: '44px',
                    paddingRight: '44px',
                    fontFamily: 'Inter, sans-serif', // Changed to Inter
                    fontSize: '14px',
                    lineHeight: '22px',
                    fontWeight: '400',
                    background: '#F5F5F5', // Less transparent, more solid
                    borderRadius: '8px',
                    color: '#1F2937' // Darker text for better readability
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

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <div 
                  className="flex items-center justify-center border transition-colors"
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    borderWidth: '2px',
                    borderColor: rememberMe ? '#4A90E2FF' : '#D1D5DB',
                    background: rememberMe ? '#4A90E2FF' : 'transparent'
                  }}
                >
                  {rememberMe && (
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
                    fontFamily: 'Inter, sans-serif', // Changed to Inter
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
                href="/forgot-password"
                className="hover:underline transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif', // Changed to Inter
                  fontSize: '14px',
                  lineHeight: '22px',
                  fontWeight: '400',
                  color: '#4A90E2FF',
                  textDecoration: 'none'
                }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center border-none rounded-lg transition-all duration-200 hover:shadow-md"
              style={{
                height: '48px',
                padding: '0 24px',
                fontFamily: 'Inter, sans-serif', // Changed to Inter
                fontSize: '16px',
                lineHeight: '24px',
                fontWeight: '600', // Made bolder
                color: '#1E40AF', // Stronger blue - but let's test if it works with the theme
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
                'Sign in'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div 
            className="text-center mt-6"
            style={{
              fontFamily: 'Inter, sans-serif', // Changed to Inter
              fontSize: '14px',
              lineHeight: '22px',
              fontWeight: '400',
              color: '#6B7280' // Softer gray
            }}
          >
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="hover:underline transition-colors"
              style={{ 
                color: '#4A90E2FF',
                fontWeight: '500'
              }}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
