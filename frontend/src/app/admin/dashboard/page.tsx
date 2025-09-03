'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  patients_today: number;
  patients_yesterday: number;
  patients_change_percentage: number;
  active_staff: number;
  total_staff: number;
  staff_breakdown: {
    [key: string]: number;
  };
  appointments_today: number;
  scheduled_appointments: number;
  walk_in_appointments: number;
}

interface Activity {
  id: number;
  type: string;
  type_display: string;
  message: string;
  timestamp: string;
  time_ago: string;
  metadata: any;
}

interface RevenueData {
  daily_revenue: Array<{
    day: string;
    amount: number;
  }>;
}

interface PharmacyAlert {
  critical: Array<{
    name: string;
    stock: number;
    threshold: number;
  }>;
  low_stock: Array<{
    name: string;
    stock: number;
    threshold: number;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [pharmacyAlerts, setPharmacyAlerts] = useState<PharmacyAlert | null>(null);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch dashboard stats from real API
      try {
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/dashboard/stats/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        } else {
          console.warn('Dashboard stats API not available, using mock data');
          // Fallback to mock data
          setStats({
            patients_today: 145,
            patients_yesterday: 123,
            patients_change_percentage: 18,
            active_staff: 89,
            total_staff: 120,
            staff_breakdown: {
              DOCTOR: 25,
              NURSE: 40,
              ADMIN: 24
            },
            appointments_today: 23,
            scheduled_appointments: 18,
            walk_in_appointments: 5
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Fallback to mock data
        setStats({
          patients_today: 145,
          patients_yesterday: 123,
          patients_change_percentage: 18,
          active_staff: 89,
          total_staff: 120,
          staff_breakdown: {
            DOCTOR: 25,
            NURSE: 40,
            ADMIN: 24
          },
          appointments_today: 23,
          scheduled_appointments: 18,
          walk_in_appointments: 5
        });
      }

      // Fetch activities from real API
      try {
        const activitiesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/activities/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          setActivities(activitiesData.activities || activitiesData);
        } else {
          console.warn('Activities API not available, using mock data');
          // Fallback to mock data
          setActivities([
            {
              id: 1,
              type: 'patient_admission',
              type_display: 'Patient Admission',
              message: 'Patient John Doe admitted to Ward 3A (Mock)',
              timestamp: '2025-09-03T10:30:00Z',
              time_ago: '10 min ago',
              metadata: {}
            },
            {
              id: 2,
              type: 'staff_update',
              type_display: 'Staff Update',
              message: 'Dr. Jane Smith updated patient record (Mock)',
              timestamp: '2025-09-03T10:15:00Z',
              time_ago: '15 min ago',
              metadata: {}
            },
            {
              id: 3,
              type: 'system_backup',
              type_display: 'System Backup',
              message: 'System backup completed successfully',
              timestamp: '2025-09-03T09:30:00Z',
              time_ago: '3 hours ago',
              metadata: {}
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        // Fallback to mock data
        setActivities([
          {
            id: 1,
            type: 'patient_admission',
            type_display: 'Patient Admission',
            message: 'Patient John Doe admitted to Ward 3A (Mock)',
            timestamp: '2025-09-03T10:30:00Z',
            time_ago: '10 min ago',
            metadata: {}
          },
          {
            id: 2,
            type: 'staff_update',
            type_display: 'Staff Update',
            message: 'Dr. Jane Smith updated patient record (Mock)',
            timestamp: '2025-09-03T10:15:00Z',
            time_ago: '15 min ago',
            metadata: {}
          },
          {
            id: 3,
            type: 'system_backup',
            type_display: 'System Backup',
            message: 'System backup completed successfully',
            timestamp: '2025-09-03T09:30:00Z',
            time_ago: '3 hours ago',
            metadata: {}
          }
        ]);
      }

      // Fetch pharmacy alerts from real API
      try {
        const pharmacyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/pharmacy/alerts/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (pharmacyResponse.ok) {
          const pharmacyData = await pharmacyResponse.json();
          setPharmacyAlerts(pharmacyData);
        } else {
          console.warn('Pharmacy alerts API not available, using mock data');
          // Fallback to mock data
          setPharmacyAlerts({
            critical: [
              { name: 'Amoxicillin (Mock)', stock: 8, threshold: 10 },
              { name: 'Insulin (Mock)', stock: 5, threshold: 10 }
            ],
            low_stock: [
              { name: 'Paracetamol (Mock)', stock: 15, threshold: 20 },
              { name: 'Bandages (Mock)', stock: 9, threshold: 30 }
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching pharmacy alerts:', error);
        // Fallback to mock data
        setPharmacyAlerts({
          critical: [
            { name: 'Amoxicillin (Mock)', stock: 8, threshold: 10 },
            { name: 'Insulin (Mock)', stock: 5, threshold: 10 }
          ],
          low_stock: [
            { name: 'Paracetamol (Mock)', stock: 15, threshold: 20 },
            { name: 'Bandages (Mock)', stock: 9, threshold: 30 }
          ]
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6" style={{ 
        fontFamily: 'Open Sans, sans-serif',
        fontSize: '24px',
        lineHeight: '32px',
        fontWeight: '600',
        color: '#171A1F'
      }}>Dashboard Overview</h1>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading dashboard data...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Row - Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Patients Today - Special Blue Card */}
                <div 
                  className="p-6 rounded-xl"
                  style={{ 
                    background: '#F2F7FD',
                    border: '1px solid rgba(229, 231, 235, 0.6)',
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <h3 className="mb-2" style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '600',
                    color: '#565D6D'
                  }}>Total Patients Today</h3>
                  <div className="mb-1" style={{
                    fontFamily: 'Open Sans, sans-serif',
                    fontSize: '48px',
                    lineHeight: '56px',
                    fontWeight: '700',
                    color: '#171A1F'
                  }}>145</div>
                  <div style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '400',
                    color: '#10B981'
                  }}>↑ 18% than yesterday</div>
                </div>

                {/* Active Staff Members */}
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
                  }}>Active Staff Members</h3>
                  <div className="mb-1" style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '32px',
                    lineHeight: '40px',
                    fontWeight: '700',
                    color: '#171A1F'
                  }}>89</div>
                  <div className="mb-3" style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '400',
                    color: '#565D6D'
                  }}>out of 120 total</div>
                  <div className="space-y-1" style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: '400',
                    color: '#565D6D'
                  }}>
                    <div>• Doctors (25)</div>
                    <div>• Nurses (40)</div>
                    <div>• Admin (24)</div>
                  </div>
                </div>

                {/* Upcoming Appointments - Donut Chart */}
                <div className="p-4 rounded-xl flex flex-col items-center justify-center" style={{ 
                  background: '#F8F9FA',
                  border: '1px solid rgba(229, 231, 235, 0.6)',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)'
                }}>
                  <div className="mb-3" style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '600',
                    color: '#565D6D'
                  }}>Appointments</div>
                  <div className="relative w-40 h-40 mb-3">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="35"
                        fill="none"
                        stroke="#C7D2FE"
                        strokeWidth="14"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="35"
                        fill="none"
                        stroke="#4A90E2"
                        strokeWidth="14"
                        strokeDasharray="175 50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '28px',
                        lineHeight: '32px',
                        fontWeight: '700',
                        color: '#171A1F'
                      }}>23</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-white text-sm rounded-md hover:opacity-90" style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '12px',
                    lineHeight: '16px',
                    fontWeight: '500',
                    background: '#4A90E2'
                  }}>
                    View Schedule
                  </button>
                </div>
              </div>

              {/* Middle Row - Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Revenue Summary - Line Chart */}
                <div className="lg:col-span-2 p-6 rounded-xl" style={{ 
                  background: '#F8F9FA',
                  border: '1px solid rgba(229, 231, 235, 0.6)',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)'
                }}>
                  <h3 className="mb-3" style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '600',
                    color: '#565D6D'
                  }}>Daily Revenue Summary</h3>
                  <div className="relative h-[320px] w-full">
                    <svg className="w-full h-full" viewBox="0 0 700 320">
                      {/* Grid lines - Horizontal */}
                      <g stroke="#f3f4f6" strokeWidth="1">
                        <line x1="50" y1="40" x2="650" y2="40" />
                        <line x1="50" y1="88" x2="650" y2="88" />
                        <line x1="50" y1="136" x2="650" y2="136" />
                        <line x1="50" y1="184" x2="650" y2="184" />
                        <line x1="50" y1="232" x2="650" y2="232" />
                        <line x1="50" y1="280" x2="650" y2="280" />
                      </g>
                      
                      {/* Y-axis scale labels */}
                      <text x="35" y="45" textAnchor="end" className="text-xs fill-gray-500">$75k</text>
                      <text x="35" y="93" textAnchor="end" className="text-xs fill-gray-500">$60k</text>
                      <text x="35" y="141" textAnchor="end" className="text-xs fill-gray-500">$45k</text>
                      <text x="35" y="189" textAnchor="end" className="text-xs fill-gray-500">$30k</text>
                      <text x="35" y="237" textAnchor="end" className="text-xs fill-gray-500">$15k</text>
                      <text x="35" y="285" textAnchor="end" className="text-xs fill-gray-500">$0</text>
                      
                      {/* Line chart path matching the image */}
                      <path
                        d="M 80 280 L 180 240 L 280 136 L 380 156 L 480 88 L 580 58 L 620 48"
                        fill="none"
                        stroke="#4A90E2"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Data points */}
                      <circle cx="80" cy="280" r="4" fill="#4A90E2" />
                      <circle cx="180" cy="240" r="4" fill="#4A90E2" />
                      <circle cx="280" cy="136" r="4" fill="#4A90E2" />
                      <circle cx="380" cy="156" r="4" fill="#4A90E2" />
                      <circle cx="480" cy="88" r="4" fill="#4A90E2" />
                      <circle cx="580" cy="58" r="4" fill="#4A90E2" />
                      <circle cx="620" cy="48" r="4" fill="#4A90E2" />
                      
                      {/* X-axis labels */}
                      <text x="80" y="305" textAnchor="middle" className="text-xs fill-gray-500">Mon</text>
                      <text x="180" y="305" textAnchor="middle" className="text-xs fill-gray-500">Tue</text>
                      <text x="280" y="305" textAnchor="middle" className="text-xs fill-gray-500">Wed</text>
                      <text x="380" y="305" textAnchor="middle" className="text-xs fill-gray-500">Thu</text>
                      <text x="480" y="305" textAnchor="middle" className="text-xs fill-gray-500">Fri</text>
                      <text x="580" y="305" textAnchor="middle" className="text-xs fill-gray-500">Sat</text>
                      <text x="620" y="305" textAnchor="middle" className="text-xs fill-gray-500">Sun</text>
                    </svg>
                  </div>
                </div>

                {/* Pharmacy Inventory Alerts */}
                <div className="p-6 rounded-xl" style={{ 
                  background: '#F8F9FA',
                  border: '1px solid rgba(229, 231, 235, 0.6)',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)'
                }}>
                  <h3 className="mb-4" style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '600',
                    color: '#565D6D'
                  }}>Pharmacy Inventory Alerts</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: '#F3F4F6' }}>
                      <div>
                        <div style={{
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '16px',
                          lineHeight: '24px',
                          fontWeight: '500',
                          color: '#171A1F'
                        }}>Paracetamol</div>
                        <div style={{
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '14px',
                          lineHeight: '20px',
                          fontWeight: '400',
                          color: '#565D6D'
                        }}>Stock: 15 (Threshold: 20)</div>
                      </div>
                      <span 
                        className="rounded-full"
                        style={{
                          height: '22px',
                          paddingLeft: '6px',
                          paddingRight: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '12px',
                          lineHeight: '20px',
                          fontWeight: '600',
                          background: '#F3F4F6',
                          color: '#171A1F',
                          borderRadius: '10px'
                        }}
                      >Low Stock</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: '#F3F4F6' }}>
                      <div>
                        <div style={{
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '16px',
                          lineHeight: '24px',
                          fontWeight: '500',
                          color: '#171A1F'
                        }}>Amoxicillin</div>
                        <div style={{
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '14px',
                          lineHeight: '20px',
                          fontWeight: '400',
                          color: '#565D6D'
                        }}>Stock: 8 (Threshold: 10)</div>
                      </div>
                      <span 
                        className="text-white rounded-full"
                        style={{
                          height: '22px',
                          paddingLeft: '6px',
                          paddingRight: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '12px',
                          lineHeight: '20px',
                          fontWeight: '600',
                          background: '#D0021B',
                          borderRadius: '10px'
                        }}
                      >Critical</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: '#F3F4F6' }}>
                      <div>
                        <div style={{
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '16px',
                          lineHeight: '24px',
                          fontWeight: '500',
                          color: '#171A1F'
                        }}>Insulin</div>
                        <div style={{
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '14px',
                          lineHeight: '20px',
                          fontWeight: '400',
                          color: '#565D6D'
                        }}>Stock: 5 (Threshold: 10)</div>
                      </div>
                      <span 
                        className="text-white rounded-full"
                        style={{
                          height: '22px',
                          paddingLeft: '6px',
                          paddingRight: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '12px',
                          lineHeight: '20px',
                          fontWeight: '600',
                          background: '#D0021B',
                          borderRadius: '10px'
                        }}
                      >Critical</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: '#F3F4F6' }}>
                      <div>
                        <div style={{
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '16px',
                          lineHeight: '24px',
                          fontWeight: '500',
                          color: '#171A1F'
                        }}>Bandages</div>
                        <div style={{
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '14px',
                          lineHeight: '20px',
                          fontWeight: '400',
                          color: '#565D6D'
                        }}>Stock: 9 (Threshold: 30)</div>
                      </div>
                      <span 
                        className="rounded-full"
                        style={{
                          height: '22px',
                          paddingLeft: '6px',
                          paddingRight: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '12px',
                          lineHeight: '20px',
                          fontWeight: '600',
                          background: '#F3F4F6',
                          color: '#171A1F',
                          borderRadius: '10px'
                        }}
                      >Low Stock</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row - Activities and Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activities */}
                <div className="lg:col-span-2 p-6 rounded-xl" style={{ 
                  background: '#F8F9FA',
                  border: '1px solid rgba(229, 231, 235, 0.6)',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)'
                }}>
                  <h3 className="mb-4" style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '600',
                    color: '#565D6D'
                  }}>Recent Activities</h3>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: '#F3F4F6' }}>
                          {activity.type === 'patient_admission' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                          ) : activity.type === 'staff_update' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                              <circle cx="9" cy="7" r="4"/>
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                          ) : activity.type === 'medication_added' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5">
                              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                              <line x1="8" y1="21" x2="16" y2="21"/>
                              <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                          ) : activity.type === 'staff_clockin' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12,6 12,12 16,14"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
                              <circle cx="12" cy="12" r="3"/>
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div style={{
                            fontFamily: 'Roboto, sans-serif',
                            fontSize: '16px',
                            lineHeight: '24px',
                            fontWeight: '500',
                            color: '#171A1F'
                          }}>{activity.message}</div>
                          <div style={{
                            fontFamily: 'Roboto, sans-serif',
                            fontSize: '14px',
                            lineHeight: '20px',
                            fontWeight: '400',
                            color: '#565D6D'
                          }}>{activity.time_ago}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Status */}
                <div className="p-6 rounded-xl" style={{ 
                  background: '#F8F9FA',
                  border: '1px solid rgba(229, 231, 235, 0.6)',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)'
                }}>
                  <h3 className="mb-4" style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: '14px',
                    lineHeight: '20px',
                    fontWeight: '600',
                    color: '#565D6D'
                  }}>System Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '16px',
                        lineHeight: '24px',
                        fontWeight: '500',
                        color: '#171A1F'
                      }}>Main Servers</span>
                      <span 
                        className="text-white rounded-full"
                        style={{
                          height: '22px',
                          paddingLeft: '6px',
                          paddingRight: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '12px',
                          lineHeight: '20px',
                          fontWeight: '600',
                          background: '#10B981',
                          borderRadius: '10px'
                        }}
                      >Online</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '16px',
                        lineHeight: '24px',
                        fontWeight: '500',
                        color: '#171A1F'
                      }}>Network Connectivity</span>
                      <span 
                        className="text-white rounded-full"
                        style={{
                          height: '22px',
                          paddingLeft: '6px',
                          paddingRight: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '12px',
                          lineHeight: '20px',
                          fontWeight: '600',
                          background: '#10B981',
                          borderRadius: '10px'
                        }}
                      >Online</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '16px',
                        lineHeight: '24px',
                        fontWeight: '500',
                        color: '#171A1F'
                      }}>Pharmacy Scanners</span>
                      <span 
                        className="text-white rounded-full"
                        style={{
                          height: '22px',
                          paddingLeft: '6px',
                          paddingRight: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '12px',
                          lineHeight: '20px',
                          fontWeight: '600',
                          background: '#F59E0B',
                          borderRadius: '10px'
                        }}
                      >Warning</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '16px',
                        lineHeight: '24px',
                        fontWeight: '500',
                        color: '#171A1F'
                      }}>Lab Equipment Interface</span>
                      <span 
                        className="text-white rounded-full"
                        style={{
                          height: '22px',
                          paddingLeft: '6px',
                          paddingRight: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'Roboto, sans-serif',
                          fontSize: '12px',
                          lineHeight: '20px',
                          fontWeight: '600',
                          background: '#EF4444',
                          borderRadius: '10px'
                        }}
                      >Offline</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
    </>
  );
}