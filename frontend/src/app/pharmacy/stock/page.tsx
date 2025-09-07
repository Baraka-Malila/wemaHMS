'use client';

import React from 'react';

export default function StockPage() {
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
        Stock Management
      </h1>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        lineHeight: '24px',
        fontWeight: '400',
        color: '#6B7280',
        marginBottom: '32px'
      }}>
        Monitor and manage pharmacy inventory levels.
      </p>
      
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
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
          Stock Management Feature
        </h3>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          lineHeight: '20px',
          fontWeight: '400',
          color: '#6B7280'
        }}>
          This feature will be implemented to handle inventory tracking and alerts.
        </p>
      </div>
    </div>
  );
}
