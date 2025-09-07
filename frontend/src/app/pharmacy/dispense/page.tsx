'use client';

import React from 'react';

export default function DispensePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '32px',
        lineHeight: '40px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '16px'
      }}>
        Dispense Medications
      </h1>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        lineHeight: '24px',
        fontWeight: '400',
        color: '#6B7280',
        marginBottom: '32px'
      }}>
        Process and dispense medications to patients.
      </p>
      
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" strokeWidth="1.5">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <h3 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '18px',
          lineHeight: '28px',
          fontWeight: '600',
          color: '#111827',
          marginBottom: '8px'
        }}>
          Dispense Medications Feature
        </h3>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: '400',
          color: '#6B7280'
        }}>
          This feature will be implemented to handle medication dispensing workflow.
        </p>
      </div>
    </div>
  );
}
