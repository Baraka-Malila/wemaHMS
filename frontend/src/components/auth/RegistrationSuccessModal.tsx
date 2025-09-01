'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  employeeId: string;
  onClose: () => void;
}

const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  isOpen,
  employeeId,
  onClose
}) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(employeeId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = employeeId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContinueToLogin = () => {
    onClose();
    router.push(`/login?employeeId=${employeeId}&message=Account created successfully! You can login for 8 hours.`);
  };

  const handleSaveAndClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 transition-opacity"
        style={{ 
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={handleSaveAndClose}
      />
      
      {/* Modal Container */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div 
          className="bg-white relative w-full max-w-md transform transition-all"
          style={{
            background: '#FFFFFFFF',
            borderRadius: '16px',
            boxShadow: '0px 10px 25px rgba(23, 26, 31, 0.1), 0px 4px 10px rgba(23, 26, 31, 0.05)',
            padding: '32px 24px'
          }}
        >
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div 
              className="inline-flex items-center justify-center mx-auto"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #C8DEF6FF 0%, #4A90E2FF 100%)',
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
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
              </svg>
            </div>
            
            <h2 
              className="text-center"
              style={{
                fontFamily: 'Open Sans, sans-serif',
                fontSize: '24px',
                lineHeight: '32px',
                fontWeight: '700',
                color: '#2563EB',
                marginBottom: '8px'
              }}
            >
              🎉 Registration Successful!
            </h2>
          </div>

          {/* Employee ID Section */}
          <div 
            className="text-center p-4 rounded-lg"
            style={{
              background: 'linear-gradient(120deg, #F0F8FF 0%, #E6F3FF 100%)',
              border: '2px solid #C8DEF6FF',
              marginBottom: '24px'
            }}
          >
            <p 
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}
            >
              Your Employee ID:
            </p>
            <div className="flex items-center justify-center space-x-3">
              <span 
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '28px',
                  lineHeight: '36px',
                  fontWeight: '700',
                  color: '#1E40AF',
                  letterSpacing: '2px'
                }}
              >
                {employeeId}
              </span>
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: copied ? '#10B981' : '#4A90E2FF',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {copied ? (
                  <svg 
                    style={{
                      width: '18px',
                      height: '18px',
                      fill: '#FFFFFF'
                    }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                  </svg>
                ) : (
                  <svg 
                    style={{
                      width: '18px',
                      height: '18px',
                      fill: '#FFFFFF'
                    }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Important Notice */}
          <div 
            className="p-4 rounded-lg"
            style={{
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              marginBottom: '24px'
            }}
          >
            <div className="flex items-start space-x-3">
              <svg 
                style={{
                  width: '20px',
                  height: '20px',
                  fill: '#D97706',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
                viewBox="0 0 24 24"
              >
                <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
              </svg>
              <div>
                <p 
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '600',
                    color: '#92400E',
                    marginBottom: '4px'
                  }}
                >
                  IMPORTANT:
                </p>
                <ul 
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    lineHeight: '18px',
                    fontWeight: '400',
                    color: '#78350F',
                    paddingLeft: '16px'
                  }}
                >
                  <li>• Save this Employee ID securely</li>
                  <li>• You can login for 8 hours</li>
                  <li>• Admin approval needed for permanent access</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleContinueToLogin}
              className="flex-1 flex items-center justify-center border-none rounded-lg transition-all duration-200 hover:shadow-md"
              style={{
                height: '48px',
                padding: '0 20px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                fontWeight: '600',
                color: '#1E40AF',
                background: '#C8DEF6FF',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#B8D4F1FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#C8DEF6FF';
              }}
            >
              Continue to Login
            </button>
            
            <button
              onClick={handleSaveAndClose}
              className="flex-1 flex items-center justify-center border rounded-lg transition-all duration-200 hover:bg-gray-50"
              style={{
                height: '48px',
                padding: '0 20px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                lineHeight: '24px',
                fontWeight: '600',
                color: '#6B7280',
                background: '#FFFFFF',
                borderWidth: '2px',
                borderColor: '#E5E7EB',
                cursor: 'pointer'
              }}
            >
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccessModal;
