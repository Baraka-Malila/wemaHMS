'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Container - Same as auth pages */}
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
            WEMA HMS
          </span>
        </div>
        
        {/* Back to Sign Up */}
        <Link
          href="/register"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            color: '#4A90E2FF',
            textDecoration: 'none'
          }}
        >
          <span>← Back to Sign Up</span>
        </Link>
      </div>

      {/* Main Content */}
      <div 
        className="min-h-screen pt-20 pb-8"
        style={{ 
          background: 'linear-gradient(120.14deg, #C8DEF6FF 50%, #F6C6E6FF 100%)'
        }}
      >
        <div className="max-w-4xl mx-auto px-6">
          {/* Content Container */}
          <div 
            className="bg-white rounded-lg shadow-lg p-8"
            style={{
              background: '#FFFFFFFF',
              borderRadius: '12px',
              boxShadow: '0px 3px 8px rgba(23, 26, 31, 0.06), 0px 1px 3px rgba(23, 26, 31, 0.03)'
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 
                style={{
                  fontFamily: 'Open Sans, sans-serif',
                  fontSize: '32px',
                  lineHeight: '40px',
                  fontWeight: '700',
                  color: '#2563EB',
                  marginBottom: '8px'
                }}
              >
                Terms of Use
              </h1>
              <p 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  lineHeight: '24px',
                  fontWeight: '400',
                  color: '#6B7280'
                }}
              >
                WEMA Hospital Management System
              </p>
              <p 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  lineHeight: '20px',
                  fontWeight: '400',
                  color: '#9CA3AF',
                  marginTop: '4px'
                }}
              >
                Last Updated: September 2, 2025
              </p>
            </div>

            {/* Content */}
            <div className="space-y-8">
              {/* Section 1: Acceptance of Terms */}
              <section>
                <h2 
                  style={{
                    fontFamily: 'Open Sans, sans-serif',
                    fontSize: '20px',
                    lineHeight: '28px',
                    fontWeight: '600',
                    color: '#1F2937',
                    marginBottom: '16px'
                  }}
                >
                  1. Acceptance of Terms
                </h2>
                <p 
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: '400',
                    color: '#374151',
                    marginBottom: '12px'
                  }}
                >
                  By accessing and using the WEMA Hospital Management System (HMS), you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this system.
                </p>
              </section>

              {/* Section 2: System Purpose and Scope */}
              <section>
                <h2 
                  style={{
                    fontFamily: 'Open Sans, sans-serif',
                    fontSize: '20px',
                    lineHeight: '28px',
                    fontWeight: '600',
                    color: '#1F2937',
                    marginBottom: '16px'
                  }}
                >
                  2. System Purpose and Scope
                </h2>
                <p 
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: '400',
                    color: '#374151',
                    marginBottom: '12px'
                  }}
                >
                  WEMA HMS is designed exclusively for healthcare professionals and authorized staff members to manage hospital operations, patient records, medical data, and administrative functions. The system is intended for internal use only within authorized healthcare facilities.
                </p>
              </section>

              {/* Section 3: User Eligibility and Access */}
              <section>
                <h2 
                  style={{
                    fontFamily: 'Open Sans, sans-serif',
                    fontSize: '20px',
                    lineHeight: '28px',
                    fontWeight: '600',
                    color: '#1F2937',
                    marginBottom: '16px'
                  }}
                >
                  3. User Eligibility and Access
                </h2>
                <div className="space-y-3">
                  <p 
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      lineHeight: '24px',
                      fontWeight: '400',
                      color: '#374151'
                    }}
                  >
                    <strong>3.1 Authorized Users:</strong> Access is restricted to licensed healthcare professionals, authorized medical staff, and administrative personnel who have been granted explicit permission by hospital administration.
                  </p>
                  <p 
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      lineHeight: '24px',
                      fontWeight: '400',
                      color: '#374151'
                    }}
                  >
                    <strong>3.2 Employee Verification:</strong> All users must possess a valid Employee ID and complete the registration process subject to administrative approval.
                  </p>
                  <p 
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      lineHeight: '24px',
                      fontWeight: '400',
                      color: '#374151'
                    }}
                  >
                    <strong>3.3 Account Security:</strong> Users are responsible for maintaining the confidentiality of their login credentials and must not share access with unauthorized individuals.
                  </p>
                </div>
              </section>

              {/* Section 4: Acceptable Use Policy */}
              <section>
                <h2 
                  style={{
                    fontFamily: 'Open Sans, sans-serif',
                    fontSize: '20px',
                    lineHeight: '28px',
                    fontWeight: '600',
                    color: '#1F2937',
                    marginBottom: '16px'
                  }}
                >
                  4. Acceptable Use Policy
                </h2>
                <div className="space-y-3">
                  <p 
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      lineHeight: '24px',
                      fontWeight: '400',
                      color: '#374151'
                    }}
                  >
                    <strong>You MUST:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      Use the system solely for legitimate medical and administrative purposes
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      Maintain patient confidentiality and comply with HIPAA regulations
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      Report any security breaches or suspicious activities immediately
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      Log out properly after each session
                    </li>
                  </ul>
                  
                  <p 
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      lineHeight: '24px',
                      fontWeight: '400',
                      color: '#374151',
                      marginTop: '16px'
                    }}
                  >
                    <strong>You MUST NOT:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      Access patient records without legitimate medical need
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      Share login credentials or allow unauthorized access
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      Attempt to bypass security measures or access restricted areas
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      Export or copy patient data without proper authorization
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 5: Data Protection and Confidentiality */}
              <section>
                <h2 
                  style={{
                    fontFamily: 'Open Sans, sans-serif',
                    fontSize: '20px',
                    lineHeight: '28px',
                    fontWeight: '600',
                    color: '#1F2937',
                    marginBottom: '16px'
                  }}
                >
                  5. Data Protection and Confidentiality
                </h2>
                <p 
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: '400',
                    color: '#374151',
                    marginBottom: '12px'
                  }}
                >
                  All medical records, patient information, and healthcare data within this system are strictly confidential and protected under healthcare privacy laws. Users must comply with all applicable data protection regulations including but not limited to HIPAA, GDPR, and local healthcare privacy laws.
                </p>
              </section>

              {/* Section 6: System Availability */}
              <section>
                <h2 
                  style={{
                    fontFamily: 'Open Sans, sans-serif',
                    fontSize: '20px',
                    lineHeight: '28px',
                    fontWeight: '600',
                    color: '#1F2937',
                    marginBottom: '16px'
                  }}
                >
                  6. System Availability
                </h2>
                <p 
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: '400',
                    color: '#374151',
                    marginBottom: '12px'
                  }}
                >
                  While we strive for 99.9% uptime, the system may be temporarily unavailable due to maintenance, updates, or unforeseen technical issues. Critical medical decisions should never depend solely on system availability. Always maintain backup procedures for emergency situations.
                </p>
              </section>

              {/* Section 7: Liability and Disclaimers */}
              <section>
                <h2 
                  style={{
                    fontFamily: 'Open Sans, sans-serif',
                    fontSize: '20px',
                    lineHeight: '28px',
                    fontWeight: '600',
                    color: '#1F2937',
                    marginBottom: '16px'
                  }}
                >
                  7. Liability and Disclaimers
                </h2>
                <p 
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: '400',
                    color: '#374151',
                    marginBottom: '12px'
                  }}
                >
                  The WEMA HMS is provided as a tool to assist healthcare operations. Medical professionals remain fully responsible for their clinical decisions and patient care. The system developers and administrators are not liable for medical decisions made using this software.
                </p>
              </section>

              {/* Section 8: Termination */}
              <section>
                <h2 
                  style={{
                    fontFamily: 'Open Sans, sans-serif',
                    fontSize: '20px',
                    lineHeight: '28px',
                    fontWeight: '600',
                    color: '#1F2937',
                    marginBottom: '16px'
                  }}
                >
                  8. Account Termination
                </h2>
                <p 
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: '400',
                    color: '#374151',
                    marginBottom: '12px'
                  }}
                >
                  User accounts may be terminated immediately for violation of these terms, security breaches, unauthorized access attempts, or upon termination of employment. Users must return all system access credentials upon account termination.
                </p>
              </section>

              {/* Section 9: Updates to Terms */}
              <section>
                <h2 
                  style={{
                    fontFamily: 'Open Sans, sans-serif',
                    fontSize: '20px',
                    lineHeight: '28px',
                    fontWeight: '600',
                    color: '#1F2937',
                    marginBottom: '16px'
                  }}
                >
                  9. Updates to Terms
                </h2>
                <p 
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: '400',
                    color: '#374151',
                    marginBottom: '12px'
                  }}
                >
                  These terms may be updated periodically to reflect changes in regulations, system capabilities, or operational requirements. Users will be notified of significant changes and continued use constitutes acceptance of updated terms.
                </p>
              </section>

              {/* Contact Information */}
              <section 
                className="bg-gray-50 p-6 rounded-lg"
                style={{
                  background: '#F9FAFB',
                  borderRadius: '8px'
                }}
              >
                <h2 
                  style={{
                    fontFamily: 'Open Sans, sans-serif',
                    fontSize: '20px',
                    lineHeight: '28px',
                    fontWeight: '600',
                    color: '#1F2937',
                    marginBottom: '16px'
                  }}
                >
                  Contact Information
                </h2>
                <p 
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    lineHeight: '24px',
                    fontWeight: '400',
                    color: '#374151'
                  }}
                >
                  For questions about these Terms of Use, please contact:<br />
                  <strong>WEMA Hospital Administration</strong><br />
                  Email: admin@wemahms.com<br />
                  Phone: +255 (0) 123 456 789
                </p>
              </section>
            </div>

            {/* Back to Sign Up Button */}
            <div className="text-center mt-8">
              <Link
                href="/register"
                className="inline-flex items-center justify-center border-none rounded-lg transition-all duration-200 hover:shadow-md"
                style={{
                  height: '48px',
                  padding: '0 32px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  lineHeight: '24px',
                  fontWeight: '600',
                  color: '#1E40AF',
                  background: '#C8DEF6FF',
                  textDecoration: 'none'
                }}
              >
                Back to Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
