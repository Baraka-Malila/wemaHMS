'use client';

import React from 'react';

export default function PatientCarePage() {
  const patients = [
    {
      id: 'P001',
      name: 'John Smith',
      age: 45,
      room: '101',
      condition: 'Post-Surgery',
      vitals: { temp: '98.6°F', bp: '120/80', hr: '72 bpm' },
      lastCheck: '2 hours ago'
    },
    {
      id: 'P002',
      name: 'Mary Johnson',
      age: 67,
      room: '102',
      condition: 'Diabetes Monitoring',
      vitals: { temp: '99.1°F', bp: '130/85', hr: '68 bpm' },
      lastCheck: '1 hour ago'
    },
    {
      id: 'P003',
      name: 'Robert Davis',
      age: 34,
      room: '103',
      condition: 'Recovery',
      vitals: { temp: '98.4°F', bp: '115/75', hr: '75 bpm' },
      lastCheck: '30 minutes ago'
    }
  ];

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 style={{
          fontSize: '28px',
          lineHeight: '35px',
          fontWeight: '700',
          color: '#1F2937',
          marginBottom: '8px'
        }}>Patient Care</h1>
        <p style={{
          fontSize: '16px',
          lineHeight: '20px',
          fontWeight: '400',
          color: '#6B7280'
        }}>Monitor and manage patient care activities</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p style={{
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '500',
                color: '#6B7280'
              }}>Total Patients</p>
              <p style={{
                fontSize: '32px',
                lineHeight: '40px',
                fontWeight: '700',
                color: '#1F2937'
              }}>24</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p style={{
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '500',
                color: '#6B7280'
              }}>Critical Care</p>
              <p style={{
                fontSize: '32px',
                lineHeight: '40px',
                fontWeight: '700',
                color: '#1F2937'
              }}>3</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p style={{
                fontSize: '14px',
                lineHeight: '18px',
                fontWeight: '500',
                color: '#6B7280'
              }}>Pending Tasks</p>
              <p style={{
                fontSize: '32px',
                lineHeight: '40px',
                fontWeight: '700',
                color: '#1F2937'
              }}>7</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 style={{
            fontSize: '18px',
            lineHeight: '23px',
            fontWeight: '600',
            color: '#1F2937'
          }}>Current Patients</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th style={{
                  fontSize: '12px',
                  lineHeight: '15px',
                  fontWeight: '500',
                  color: '#6B7280',
                  textAlign: 'left',
                  padding: '12px 24px'
                }}>PATIENT</th>
                <th style={{
                  fontSize: '12px',
                  lineHeight: '15px',
                  fontWeight: '500',
                  color: '#6B7280',
                  textAlign: 'left',
                  padding: '12px 24px'
                }}>ROOM</th>
                <th style={{
                  fontSize: '12px',
                  lineHeight: '15px',
                  fontWeight: '500',
                  color: '#6B7280',
                  textAlign: 'left',
                  padding: '12px 24px'
                }}>CONDITION</th>
                <th style={{
                  fontSize: '12px',
                  lineHeight: '15px',
                  fontWeight: '500',
                  color: '#6B7280',
                  textAlign: 'left',
                  padding: '12px 24px'
                }}>VITALS</th>
                <th style={{
                  fontSize: '12px',
                  lineHeight: '15px',
                  fontWeight: '500',
                  color: '#6B7280',
                  textAlign: 'left',
                  padding: '12px 24px'
                }}>LAST CHECK</th>
                <th style={{
                  fontSize: '12px',
                  lineHeight: '15px',
                  fontWeight: '500',
                  color: '#6B7280',
                  textAlign: 'left',
                  padding: '12px 24px'
                }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div style={{
                        fontSize: '14px',
                        lineHeight: '18px',
                        fontWeight: '500',
                        color: '#1F2937'
                      }}>{patient.name}</div>
                      <div style={{
                        fontSize: '12px',
                        lineHeight: '15px',
                        fontWeight: '400',
                        color: '#6B7280'
                      }}>{patient.id} • Age {patient.age}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span style={{
                      fontSize: '14px',
                      lineHeight: '18px',
                      fontWeight: '500',
                      color: '#1F2937'
                    }}>{patient.room}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span style={{
                      fontSize: '14px',
                      lineHeight: '18px',
                      fontWeight: '400',
                      color: '#6B7280'
                    }}>{patient.condition}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div style={{
                        fontSize: '12px',
                        lineHeight: '15px',
                        fontWeight: '400',
                        color: '#6B7280'
                      }}>T: {patient.vitals.temp}</div>
                      <div style={{
                        fontSize: '12px',
                        lineHeight: '15px',
                        fontWeight: '400',
                        color: '#6B7280'
                      }}>BP: {patient.vitals.bp}</div>
                      <div style={{
                        fontSize: '12px',
                        lineHeight: '15px',
                        fontWeight: '400',
                        color: '#6B7280'
                      }}>HR: {patient.vitals.hr}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span style={{
                      fontSize: '14px',
                      lineHeight: '18px',
                      fontWeight: '400',
                      color: '#6B7280'
                    }}>{patient.lastCheck}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                        style={{
                          fontSize: '12px',
                          lineHeight: '15px',
                          fontWeight: '500'
                        }}
                      >
                        Update Vitals
                      </button>
                      <button
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
                        style={{
                          fontSize: '12px',
                          lineHeight: '15px',
                          fontWeight: '500'
                        }}
                      >
                        View Chart
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
