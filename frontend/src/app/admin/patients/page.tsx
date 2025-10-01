'use client';

import React, { useState, useEffect } from 'react';
import { Users, Calendar, BedDouble, AlertCircle } from 'lucide-react';

export default function PatientsManagement() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Patient Management</h1>
        <p className="text-sm text-gray-600 mt-1">View and manage patient records</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading patient data...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Patient Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600">Total Patients</h3>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">1,234</div>
              <div className="text-sm text-gray-600 mt-1">Registered patients</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600">Today&apos;s Visits</h3>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">87</div>
              <div className="text-sm text-green-600 mt-1 font-medium">Appointments today</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600">In Treatment</h3>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <BedDouble className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">34</div>
              <div className="text-sm text-gray-600 mt-1">Currently admitted</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600">Emergency</h3>
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">8</div>
              <div className="text-sm text-red-600 mt-1 font-medium">Critical cases</div>
            </div>
          </div>

          {/* Patient List */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>

              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors">
                Add New Patient
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Patient ID
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Name
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Age
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Department
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Actions
                    </th>
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
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2 text-sm font-medium text-gray-900">
                        {patient.id}
                      </td>
                      <td className="py-4 px-2 text-base font-medium text-gray-900">
                        {patient.name}
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-600">
                        {patient.age}
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-600">
                        {patient.department}
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          patient.status === 'Critical' ? 'bg-red-50 text-red-600' :
                          patient.status === 'In Treatment' ? 'bg-green-50 text-green-700' :
                          patient.status === 'Waiting' ? 'bg-orange-50 text-orange-700' :
                          patient.status === 'Pre-op' ? 'bg-blue-50 text-blue-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {patient.status}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors">
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
