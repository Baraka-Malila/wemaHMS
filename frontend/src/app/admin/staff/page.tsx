'use client';

import React, { useState, useEffect } from 'react';

export default function StaffManagement() {
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
      }}>Staff Management</h1>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading staff data...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Staff Summary Cards */}
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
              }}>Total Staff</h3>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '32px',
                lineHeight: '40px',
                fontWeight: '700',
                color: '#171A1F'
              }}>156</div>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: '400',
                color: '#565D6D'
              }}>Active employees</div>
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
              }}>On Duty</h3>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '32px',
                lineHeight: '40px',
                fontWeight: '700',
                color: '#171A1F'
              }}>89</div>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: '400',
                color: '#10B981'
              }}>Currently working</div>
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
              }}>Doctors</h3>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '32px',
                lineHeight: '40px',
                fontWeight: '700',
                color: '#171A1F'
              }}>42</div>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: '400',
                color: '#565D6D'
              }}>Medical professionals</div>
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
              }}>Nurses</h3>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '32px',
                lineHeight: '40px',
                fontWeight: '700',
                color: '#171A1F'
              }}>78</div>
              <div style={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: '400',
                color: '#565D6D'
              }}>Nursing staff</div>
            </div>
          </div>

          {/* Staff Table */}
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
              }}>Staff Directory</h3>
              
              <button
                className="px-4 py-2 rounded-lg text-white"
                style={{
                  background: '#1976D2',
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Add New Staff
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
                    }}>Name</th>
                    <th className="text-left py-3" style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontWeight: '600',
                      color: '#565D6D'
                    }}>Role</th>
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
                    { name: 'Dr. Sarah Johnson', role: 'Senior Doctor', department: 'Cardiology', status: 'On Duty' },
                    { name: 'Nurse Mary Wilson', role: 'Head Nurse', department: 'Emergency', status: 'On Duty' },
                    { name: 'Dr. Michael Chen', role: 'Surgeon', department: 'Surgery', status: 'Off Duty' },
                    { name: 'Nurse John Davis', role: 'Nurse', department: 'Pediatrics', status: 'On Duty' },
                    { name: 'Dr. Emily Brown', role: 'Doctor', department: 'General Medicine', status: 'On Duty' }
                  ].map((staff, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4" style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '16px',
                        lineHeight: '24px',
                        fontWeight: '500',
                        color: '#171A1F'
                      }}>{staff.name}</td>
                      <td className="py-4" style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontWeight: '400',
                        color: '#171A1F'
                      }}>{staff.role}</td>
                      <td className="py-4" style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '14px',
                        lineHeight: '20px',
                        fontWeight: '400',
                        color: '#565D6D'
                      }}>{staff.department}</td>
                      <td className="py-4">
                        <span 
                          className="px-3 py-1 rounded-full text-sm"
                          style={{
                            fontFamily: 'Roboto, sans-serif',
                            fontSize: '12px',
                            lineHeight: '16px',
                            fontWeight: '500',
                            background: staff.status === 'On Duty' ? '#F0FDF4' : '#FFF7ED',
                            color: staff.status === 'On Duty' ? '#166534' : '#C2410C'
                          }}
                        >
                          {staff.status}
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
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            style={{
                              fontFamily: 'Roboto, sans-serif',
                              fontSize: '14px'
                            }}
                          >
                            Remove
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
