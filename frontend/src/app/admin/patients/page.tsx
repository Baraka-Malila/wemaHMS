'use client';

import React, { useState, useEffect } from 'react';

export default function PatientsManagement() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6" style={{ 
        fontFamily: 'Open Sans, sans-serif',
        fontSize: '24px',
        lineHeight: '32px',
        fontWeight: '600',
        color: '#171A1F'
      }}>Patient Management</h1>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading patient data...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Patient Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl" style={{ 
              background: '#F8F9FA',
              border: '1px solid rgba(229, 231, 235, 0.6)',
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)'
            }}>
              <h3 className="mb-2" style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: '600',
                color: '#565D6D'
              }}>Total Patients</h3>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '32px',
                lineHeight: '40px',
                fontWeight: '700',
                color: '#171A1F'
              }}>1,234</div>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: '400',
                color: '#565D6D'
              }}>Registered patients</div>
            </div>

            <div className="p-6 rounded-xl" style={{ 
              background: '#F8F9FA',
              border: '1px solid rgba(229, 231, 235, 0.6)',
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)'
            }}>
              <h3 className="mb-2" style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: '600',
                color: '#565D6D'
              }}>Today's Visits</h3>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '32px',
                lineHeight: '40px',
                fontWeight: '700',
                color: '#171A1F'
              }}>87</div>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: '400',
                color: '#10B981'
              }}>Appointments today</div>
            </div>

            <div className="p-6 rounded-xl" style={{ 
              background: '#F8F9FA',
              border: '1px solid rgba(229, 231, 235, 0.6)',
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)'
            }}>
              <h3 className="mb-2" style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: '600',
                color: '#565D6D'
              }}>In Treatment</h3>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '32px',
                lineHeight: '40px',
                fontWeight: '700',
                color: '#171A1F'
              }}>34</div>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: '400',
                color: '#565D6D'
              }}>Currently admitted</div>
            </div>

            <div className="p-6 rounded-xl" style={{ 
              background: '#F8F9FA',
              border: '1px solid rgba(229, 231, 235, 0.6)',
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)'
            }}>
              <h3 className="mb-2" style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: '600',
                color: '#565D6D'
              }}>Emergency</h3>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '32px',
                lineHeight: '40px',
                fontWeight: '700',
                color: '#171A1F'
              }}>8</div>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: '400',
                color: '#EF4444'
              }}>Critical cases</div>
            </div>
          </div>

          {/* Patient List */}
          <div className="p-6 rounded-xl" style={{ 
            background: '#F8F9FA',
            border: '1px solid rgba(229, 231, 235, 0.6)',
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)'
          }}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '18px',
                lineHeight: '24px',
                fontWeight: '600',
                color: '#171A1F'
              }}>Recent Patients</h3>
              
              <button
                className="px-4 py-2 rounded-lg text-white"
                style={{
                  background: '#1976D2',
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Add New Patient
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3" style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '600',
                      color: '#565D6D'
                    }}>Patient ID</th>
                    <th className="text-left py-3" style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '600',
                      color: '#565D6D'
                    }}>Name</th>
                    <th className="text-left py-3" style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '600',
                      color: '#565D6D'
                    }}>Age</th>
                    <th className="text-left py-3" style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '600',
                      color: '#565D6D'
                    }}>Department</th>
                    <th className="text-left py-3" style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '600',
                      color: '#565D6D'
                    }}>Status</th>
                    <th className="text-left py-3" style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '600',
                      color: '#565D6D'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'P001', name: 'Alice Johnson', age: 45, department: 'Cardiology', status: 'In Treatment' },
                    { id: 'P002', name: 'Bob Smith', age: 62, department: 'Orthopedics', status: 'Waiting' },
                    { id: 'P003', name: 'Carol Brown', age: 28, department: 'Emergency', status: 'Critical' },
                    { id: 'P004', name: 'David Wilson', age: 35, department: 'General Medicine', status: 'Discharged' },
                    { id: 'P005', name: 'Eva Martinez', age: 52, department: 'Surgery', status: 'Pre-op' }
                  ].map((patient, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4" style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontWeight: '500',
                        color: '#171A1F'
                      }}>{patient.id}</td>
                      <td className="py-4" style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '16px',
                        lineHeight: '24px',
                        fontWeight: '500',
                        color: '#171A1F'
                      }}>{patient.name}</td>
                      <td className="py-4" style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontWeight: '400',
                        color: '#565D6D'
                      }}>{patient.age}</td>
                      <td className="py-4" style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontWeight: '400',
                        color: '#565D6D'
                      }}>{patient.department}</td>
                      <td className="py-4">
                        <span 
                          className="px-3 py-1 rounded-full text-sm"
                          style={{
                            fontFamily: 'Roboto, sans-serif',
                            fontSize: '12px',
                            lineHeight: '16px',
                            fontWeight: '500',
                            background: patient.status === 'Critical' ? '#FEF2F2' : 
                                       patient.status === 'In Treatment' ? '#F0FDF4' :
                                       patient.status === 'Waiting' ? '#FFF7ED' :
                                       patient.status === 'Pre-op' ? '#F0F9FF' : '#F9FAFB',
                            color: patient.status === 'Critical' ? '#DC2626' : 
                                   patient.status === 'In Treatment' ? '#166534' :
                                   patient.status === 'Waiting' ? '#C2410C' :
                                   patient.status === 'Pre-op' ? '#0284C7' : '#374151'
                          }}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            style={{
                              fontFamily: 'Roboto, sans-serif',
                              fontSize: '14px'
                            }}
                          >
                            View
                          </button>
                          <button
                            className="text-green-600 hover:text-green-800"
                            style={{
                              fontFamily: 'Roboto, sans-serif',
                              fontSize: '14px'
                            }}
                          >
                            Edit
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
      )}
    </>
  );
}
