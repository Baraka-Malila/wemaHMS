'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
            ❄️ WEMA HMS 🏥
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
                Privacy Policy
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
              {/* Section 1: Introduction */}
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
                  1. Introduction
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
                  WEMA Hospital Management System (HMS) is committed to protecting the privacy and confidentiality of all medical information, patient data, and user information. This Privacy Policy explains how we collect, use, protect, and handle your information in compliance with healthcare privacy regulations including HIPAA, GDPR, and local data protection laws.
                </p>
              </section>

              {/* Section 2: Information We Collect */}
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
                  2. Information We Collect
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 
                      style={{
                        fontFamily: 'Open Sans, sans-serif',
                        fontSize: '18px',
                        lineHeight: '24px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}
                    >
                      2.1 User Account Information
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                        Employee ID and role information
                      </li>
                      <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                        Full name and contact information (email, phone)
                      </li>
                      <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                        Professional credentials and department assignment
                      </li>
                      <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                        Login credentials and session information
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 
                      style={{
                        fontFamily: 'Open Sans, sans-serif',
                        fontSize: '18px',
                        lineHeight: '24px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}
                    >
                      2.2 Patient Health Information (PHI)
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                        Medical records and treatment history
                      </li>
                      <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                        Diagnostic information and test results
                      </li>
                      <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                        Prescription and medication data
                      </li>
                      <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                        Insurance and billing information
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 
                      style={{
                        fontFamily: 'Open Sans, sans-serif',
                        fontSize: '18px',
                        lineHeight: '24px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '8px'
                      }}
                    >
                      2.3 System Usage Data
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                        Login times and session duration
                      </li>
                      <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                        Pages accessed and actions performed
                      </li>
                      <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                        IP addresses and device information (for security)
                      </li>
                      <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                        Error logs and system performance data
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 3: How We Use Information */}
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
                  3. How We Use Your Information
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
                    <strong>3.1 Primary Healthcare Operations:</strong> To provide, coordinate, and manage patient care, medical treatments, and hospital operations.
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
                    <strong>3.2 User Authentication and Access Control:</strong> To verify user identity, manage access permissions, and maintain system security.
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
                    <strong>3.3 Quality Improvement:</strong> To analyze system usage, improve healthcare delivery, and enhance patient safety measures.
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
                    <strong>3.4 Legal Compliance:</strong> To meet regulatory requirements, support legal proceedings when required, and ensure compliance with healthcare laws.
                  </p>
                </div>
              </section>

              {/* Section 4: Information Sharing */}
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
                  4. Information Sharing and Disclosure
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
                    <strong>We DO NOT sell, rent, or trade your personal information.</strong> We only share information in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      <strong>Healthcare Team:</strong> With authorized medical professionals directly involved in patient care
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      <strong>Legal Requirements:</strong> When required by law, court orders, or regulatory authorities
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      <strong>Emergency Situations:</strong> To prevent serious harm to patients or public health
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      <strong>Business Associates:</strong> With HIPAA-compliant service providers under strict confidentiality agreements
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 5: Data Security */}
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
                  5. Data Security Measures
                </h2>
                <div className="space-y-3">
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
                    We implement comprehensive security measures to protect your information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      <strong>Encryption:</strong> All data is encrypted in transit and at rest using industry-standard protocols
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      <strong>Access Controls:</strong> Role-based access with unique user credentials and session management
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      <strong>Audit Logs:</strong> Comprehensive logging of all system access and data modifications
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      <strong>Regular Security Updates:</strong> Continuous monitoring and updating of security measures
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      <strong>Physical Security:</strong> Secure server infrastructure with restricted physical access
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 6: Data Retention */}
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
                  6. Data Retention and Disposal
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
                    <strong>6.1 Medical Records:</strong> Patient health information is retained according to legal requirements and medical record retention policies (typically 7-10 years after last treatment).
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
                    <strong>6.2 User Account Data:</strong> Staff account information is retained for the duration of employment plus 3 years for audit purposes.
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
                    <strong>6.3 System Logs:</strong> Access logs and audit trails are maintained for 1 year for security monitoring purposes.
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
                    <strong>6.4 Secure Disposal:</strong> All data is securely destroyed using NIST-approved methods when retention periods expire.
                  </p>
                </div>
              </section>

              {/* Section 7: Your Rights */}
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
                  7. Your Privacy Rights
                </h2>
                <div className="space-y-3">
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
                    Under healthcare privacy laws, you have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      <strong>Access:</strong> Request access to your personal information held in the system
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      <strong>Correction:</strong> Request correction of inaccurate or incomplete information
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      <strong>Restriction:</strong> Request limitations on how your information is used or disclosed
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      <strong>Complaint:</strong> File complaints about privacy practices with hospital administration or regulatory authorities
                    </li>
                    <li style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#374151' }}>
                      <strong>Breach Notification:</strong> Be notified promptly of any security breaches affecting your information
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 8: Cookies and Tracking */}
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
                  8. Cookies and Session Management
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
                  We use essential cookies and session tokens to maintain user authentication and system functionality. These are necessary for the system to operate and are not used for tracking or advertising purposes. Session data is automatically cleared when you log out or after periods of inactivity.
                </p>
              </section>

              {/* Section 9: Third-Party Services */}
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
                  9. Third-Party Services
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
                  Our system may integrate with HIPAA-compliant third-party healthcare services for laboratory results, imaging, or pharmacy systems. All third-party integrations are subject to strict business associate agreements and maintain the same level of privacy protection as our internal systems.
                </p>
              </section>

              {/* Section 10: Updates to Privacy Policy */}
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
                  10. Privacy Policy Updates
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
                  We may update this Privacy Policy to reflect changes in healthcare regulations, system capabilities, or privacy practices. Users will be notified of material changes through the system interface and email notifications. Continued use of the system after updates constitutes acceptance of the revised policy.
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
                  Privacy Officer Contact
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
                  For privacy-related questions, concerns, or to exercise your rights:<br />
                  <strong>WEMA Hospital Privacy Officer</strong><br />
                  Email: privacy@wemahms.com<br />
                  Phone: +255 (0) 123 456 789<br />
                  Address: WEMA Hospital, Privacy Office<br />
                  P.O. Box 12345, Dar es Salaam, Tanzania
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
