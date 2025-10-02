'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Activity,
  Server
} from 'lucide-react';
import RealTimeClock from '@/components/ui/RealTimeClock';
import auth from '@/lib/auth';

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
      const token = auth.getToken();
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
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-blue-100 mt-1">System Overview & Management</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-xs text-blue-100 mb-1">Current Time</p>
              <RealTimeClock className="text-white font-semibold text-xl" />
            </div>
          </div>
        </div>
      </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading dashboard data...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Row - Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Patients Today */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-600">Total Patients Today</h3>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {stats?.patients_today || 145}
                  </div>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {stats?.patients_change_percentage || 18}% than yesterday
                  </div>
                </div>

                {/* Active Staff Members */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-600">Active Staff Members</h3>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stats?.active_staff || 89}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    out of {stats?.total_staff || 120} total
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>• Doctors ({stats?.staff_breakdown?.DOCTOR || 25})</div>
                    <div>• Nurses ({stats?.staff_breakdown?.NURSE || 40})</div>
                    <div>• Admin ({stats?.staff_breakdown?.ADMIN || 24})</div>
                  </div>
                </div>

                {/* Appointments */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
                  <div className="flex items-center justify-between w-full mb-4">
                    <h3 className="text-sm font-semibold text-gray-600">Appointments</h3>
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="relative w-40 h-40 mb-4">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="35" fill="none" stroke="#E0E7FF" strokeWidth="14" />
                      <circle cx="60" cy="60" r="35" fill="none" stroke="#4F46E5" strokeWidth="14" strokeDasharray="175 50" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">
                        {stats?.appointments_today || 23}
                      </span>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    View Schedule
                  </button>
                </div>
              </div>

              {/* Middle Row - Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Revenue Summary - Line Chart */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-600">Daily Revenue Summary</h3>
                  </div>
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
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <h3 className="text-sm font-semibold text-gray-600">Pharmacy Inventory Alerts</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                      <div>
                        <div className="text-base font-medium text-gray-900">Paracetamol</div>
                        <div className="text-sm text-gray-600">Stock: 15 (Threshold: 20)</div>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                        Low Stock
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                      <div>
                        <div className="text-base font-medium text-gray-900">Amoxicillin</div>
                        <div className="text-sm text-gray-600">Stock: 8 (Threshold: 10)</div>
                      </div>
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                        Critical
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                      <div>
                        <div className="text-base font-medium text-gray-900">Insulin</div>
                        <div className="text-sm text-gray-600">Stock: 5 (Threshold: 10)</div>
                      </div>
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                        Critical
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                      <div>
                        <div className="text-base font-medium text-gray-900">Bandages</div>
                        <div className="text-sm text-gray-600">Stock: 9 (Threshold: 30)</div>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                        Low Stock
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row - Activities and Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activities */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <h3 className="text-sm font-semibold text-gray-600">Recent Activities</h3>
                  </div>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
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
                          <div className="text-base font-medium text-gray-900">{activity.message}</div>
                          <div className="text-sm text-gray-600">{activity.time_ago}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Server className="h-5 w-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-gray-600">System Status</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-gray-900">Main Servers</span>
                      <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                        Online
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-gray-900">Network Connectivity</span>
                      <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                        Online
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-gray-900">Pharmacy Scanners</span>
                      <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                        Warning
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-gray-900">Lab Equipment Interface</span>
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                        Offline
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
    </>
  );
}