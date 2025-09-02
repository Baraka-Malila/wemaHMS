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
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [pharmacyAlerts, setPharmacyAlerts] = useState<PharmacyAlert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch all dashboard data
      const [statsRes, activitiesRes, revenueRes, pharmacyRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats/', {
          headers: { 'Authorization': `Token ${token}` }
        }),
        fetch('/api/admin/activities/', {
          headers: { 'Authorization': `Token ${token}` }
        }),
        fetch('/api/admin/dashboard/revenue/', {
          headers: { 'Authorization': `Token ${token}` }
        }),
        fetch('/api/admin/pharmacy/alerts/', {
          headers: { 'Authorization': `Token ${token}` }
        })
      ]);

      if (statsRes.ok) setDashboardStats(await statsRes.json());
      if (activitiesRes.ok) setActivities(await activitiesRes.json());
      if (revenueRes.ok) setRevenueData(await revenueRes.json());
      if (pharmacyRes.ok) setPharmacyAlerts(await pharmacyRes.json());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/login');
  };

  return (
    <div className="page">
      {/* Top Header Container */}
      <div className="header-container">
        <div className="admin-text">ADMIN</div>
        
        {/* Header Icons */}
        <div className="header-icons">
          <div className="icon-bell">🔔</div>
          <div className="icon-settings">⚙️</div>
          <div className="icon-logout" onClick={handleLogout}>🚪</div>
        </div>
      </div>

      {/* Sidebar Container */}
      <div className="sidebar-container">
        {/* Logo and WemaHMS text */}
        <div className="logo-section">
          <div className="logo-icon">❄️</div>
          <div className="wema-text">WemaHMS</div>
        </div>

        {/* Sidebar Menu */}
        <div className="sidebar-menu">
          <div className="sidebar-menu-item selected">
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            Dashboard
          </div>
          <div className="sidebar-menu-item">
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M16 7c0-2.76-2.24-5-5-5s-5 2.24-5 5c0 2.76 2.24 5 5 5s5-2.24 5-5zm4 12c0-.55-.45-1-1-1s-1 .45-1 1-.45 1-1 1H7c-.55 0-1-.45-1-1s-.45-1-1-1-1 .45-1 1c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2z"/>
            </svg>
            Staff Management
          </div>
          <div className="sidebar-menu-item">
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
            Patient Records
          </div>
          <div className="sidebar-menu-item">
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M17.5 11.5c0 3-2.5 5.5-5.5 5.5s-5.5-2.5-5.5-5.5S9 6 12 6s5.5 2.5 5.5 5.5zm-1.5 0c0-2.2-1.8-4-4-4s-4 1.8-4 4 1.8 4 4 4 4-1.8 4-4z"/>
            </svg>
            Pharmacy Inventory
          </div>
          <div className="sidebar-menu-item">
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
            Reports
          </div>
          <div className="sidebar-menu-item">
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
            Analytics
          </div>
          <div className="sidebar-menu-item">
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
            System Settings
          </div>
        </div>

        {/* Logout at bottom of sidebar */}
        <div className="sidebar-logout" onClick={handleLogout}>
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Logout
        </div>
      </div>

      {/* Main Content Container */}
      <div className="main-container">
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading dashboard data...</div>
        ) : (
          <>
            {/* Dashboard Cards */}
            <div className="dashboard-cards">
              {/* Total Patients Card */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Total Patients Today</h3>
                </div>
                <div className="card-value">{dashboardStats?.patients_today || 145}</div>
                <div className="card-change positive">
                  ↑ {dashboardStats?.patients_change_percentage || 18}% than yesterday
                </div>
              </div>

              {/* Active Staff Card */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Active Staff Members</h3>
                </div>
                <div className="card-value">{dashboardStats?.active_staff || 89}</div>
                <div className="card-subtitle">
                  out of {dashboardStats?.total_staff || 120} total
                </div>
                <div className="staff-breakdown">
                  <div className="staff-item">🟢 Doctors ({dashboardStats?.staff_breakdown?.DOCTOR || 25})</div>
                  <div className="staff-item">🔵 Nurses ({dashboardStats?.staff_breakdown?.NURSE || 40})</div>
                  <div className="staff-item">🟡 Admin ({dashboardStats?.staff_breakdown?.ADMIN || 24})</div>
                </div>
              </div>

              {/* Appointments Card */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Upcoming Appointments</h3>
                </div>
                <div className="card-value">{dashboardStats?.appointments_today || 23}</div>
                <div className="card-subtitle">for today</div>
                <button className="view-schedule-btn">View Schedule</button>
              </div>
            </div>

            {/* Charts and Activities Section */}
            <div className="charts-section">
              {/* Left side - Charts */}
              <div className="charts-left">
                {/* Revenue Chart */}
                <div className="chart-container">
                  <h3>Daily Revenue Summary</h3>
                  <div className="revenue-chart">
                    {/* Simple chart representation */}
                    <div className="chart-placeholder">📈 Revenue Chart</div>
                  </div>
                </div>
              </div>

              {/* Right side - Donut Chart */}
              <div className="charts-right">
                <div className="donut-chart-container">
                  <div className="donut-chart">
                    <div className="donut-center">{dashboardStats?.appointments_today || 23}</div>
                  </div>
                  <button className="view-schedule-btn">View Schedule</button>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="bottom-section">
              {/* Recent Activities */}
              <div className="activities-section">
                <h3>Recent Activities</h3>
                <div className="activities-list">
                  {activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'patient_admission' ? '👥' : 
                         activity.type === 'staff_update' ? '👨‍⚕️' :
                         activity.type === 'medication_added' ? '💊' :
                         activity.type === 'staff_clockin' ? '🕐' : '⚙️'}
                      </div>
                      <div className="activity-content">
                        <div className="activity-message">{activity.message}</div>
                        <div className="activity-time">{activity.time_ago}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="right-sidebar">
                {/* Pharmacy Alerts */}
                <div className="pharmacy-alerts">
                  <h3>Pharmacy Inventory Alerts</h3>
                  <div className="alerts-list">
                    {pharmacyAlerts?.critical?.map((item, index) => (
                      <div key={index} className="alert-item critical">
                        <div className="alert-name">{item.name}</div>
                        <div className="alert-stock">Stock: {item.stock} (Threshold: {item.threshold})</div>
                        <div className="alert-badge critical">Critical</div>
                      </div>
                    ))}
                    {pharmacyAlerts?.low_stock?.map((item, index) => (
                      <div key={index} className="alert-item low-stock">
                        <div className="alert-name">{item.name}</div>
                        <div className="alert-stock">Stock: {item.stock} (Threshold: {item.threshold})</div>
                        <div className="alert-badge low">Low Stock</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Status */}
                <div className="system-status">
                  <h3>System Status</h3>
                  <div className="status-list">
                    <div className="status-item">
                      <div className="status-name">Main Servers</div>
                      <div className="status-indicator online">Online</div>
                    </div>
                    <div className="status-item">
                      <div className="status-name">Network Connectivity</div>
                      <div className="status-indicator online">Online</div>
                    </div>
                    <div className="status-item">
                      <div className="status-name">Pharmacy Scanners</div>
                      <div className="status-indicator warning">Warning</div>
                    </div>
                    <div className="status-item">
                      <div className="status-name">Lab Equipment Interface</div>
                      <div className="status-indicator offline">Offline</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        /* WemaHMS - Admin Dashboard v-2 */
        .page {
          position: relative;
          width: 100vw;
          height: 100vh;
          background: #FAFAFBFF;
          font-family: 'Open Sans', sans-serif;
        }

        /* Top Header Container */
        .header-container {
          position: absolute;
          top: 0px;
          left: 16px;
          width: calc(100vw - 32px);
          height: 64px;
          background: #FAFAFBFF;
          border-radius: 0px 0px 10px 10px;
          box-shadow: 0px 0px 1px rgba(23, 26, 31, 0.08), 0px 0px 2px rgba(23, 26, 31, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .admin-text {
          position: absolute;
          top: 17px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Open Sans', sans-serif;
          font-size: 25px;
          line-height: 25px;
          font-weight: 700;
          color: #4A90E2FF;
        }

        .header-icons {
          position: absolute;
          top: 17px;
          right: 24px;
          display: flex;
          gap: 16px;
        }

        .icon-bell, .icon-settings, .icon-logout {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 50%;
          background: rgba(74, 144, 226, 0.1);
          font-size: 16px;
          transition: background 0.2s;
        }

        .icon-bell:hover, .icon-settings:hover, .icon-logout:hover {
          background: rgba(74, 144, 226, 0.2);
        }

        /* Sidebar Container */
        .sidebar-container {
          position: absolute;
          top: 0px;
          left: 0px;
          width: 256px;
          height: 100vh;
          background: #FFFFFF;
          border-radius: 0px 10px 10px 0px;
          border-width: 1px;
          border-color: #DEE1E6FF;
          border-style: solid;
          padding: 0;
        }

        .logo-section {
          position: absolute;
          top: 20px;
          left: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-icon {
          font-size: 24px;
        }

        .wema-text {
          font-family: 'Open Sans', sans-serif;
          font-size: 25px;
          line-height: 25px;
          font-weight: 700;
          color: #4A90E2FF;
        }

        /* Sidebar Menu */
        .sidebar-menu {
          position: absolute;
          top: 80px;
          left: 8px;
          width: 238px;
          display: flex;
          flex-direction: column;
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          line-height: 22px;
          font-weight: 400;
          opacity: 1;
        }

        /* Sidebar Menu - Item */
        .sidebar-menu-item {
          padding: 16px 16px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          color: #565D6DFF;
          background: transparent;
          border-radius: 0px;
          gap: 8px;
          cursor: pointer;
          white-space: nowrap;
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          line-height: 22px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .sidebar-menu-item:hover {
          background: rgba(200, 222, 246, 0.3);
          color: #195599FF;
        }

        /* Selected item */
        .sidebar-menu-item.selected {
          position: relative;
          font-weight: 700;
          color: #195599FF;
          background: #C8DEF6FF;
        }

        /* Sidebar Menu - Icon */
        .sidebar-menu svg.icon {
          width: 24px;
          height: 24px;
          fill: currentColor;
        }

        .sidebar-logout {
          position: absolute;
          bottom: 20px;
          left: 8px;
          width: 238px;
          padding: 16px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: #565D6DFF;
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .sidebar-logout:hover {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }

        .sidebar-logout svg.icon {
          width: 24px;
          height: 24px;
          fill: currentColor;
        }

        /* Main Content Container */
        .main-container {
          position: absolute;
          top: 64px;
          left: 276px;
          width: calc(100vw - 296px);
          height: calc(100vh - 64px);
          background: #FAFAFBFF;
          border-radius: 0px 0px 0px 0px;
          padding: 24px;
          overflow-y: auto;
        }

        .dashboard-header h1 {
          font-family: 'Open Sans', sans-serif;
          font-size: 28px;
          font-weight: 600;
          color: #1E2128FF;
          margin-bottom: 24px;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          font-size: 18px;
          color: #565D6DFF;
        }

        /* Dashboard Cards */
        .dashboard-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        .dashboard-card {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0px 2px 8px rgba(23, 26, 31, 0.04);
          border: 1px solid #F0F1F3;
        }

        .card-header h3 {
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #565D6DFF;
          margin: 0 0 12px 0;
        }

        .card-value {
          font-family: 'Open Sans', sans-serif;
          font-size: 48px;
          font-weight: 700;
          color: #1E2128FF;
          line-height: 1.2;
          margin-bottom: 8px;
        }

        .card-change {
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          font-weight: 500;
        }

        .card-change.positive {
          color: #22C55E;
        }

        .card-subtitle {
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          color: #565D6DFF;
          margin-bottom: 16px;
        }

        .staff-breakdown {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 12px;
        }

        .staff-item {
          font-family: 'Roboto', sans-serif;
          font-size: 12px;
          color: #565D6DFF;
        }

        .view-schedule-btn {
          background: #4A90E2FF;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-family: 'Roboto', sans-serif;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .view-schedule-btn:hover {
          background: #357ABD;
        }

        /* Charts Section */
        .charts-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }

        .chart-container {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0px 2px 8px rgba(23, 26, 31, 0.04);
          border: 1px solid #F0F1F3;
        }

        .chart-container h3 {
          font-family: 'Roboto', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #1E2128FF;
          margin-bottom: 20px;
        }

        .chart-placeholder {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F8F9FA;
          border-radius: 8px;
          color: #565D6DFF;
          font-size: 18px;
        }

        .donut-chart-container {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0px 2px 8px rgba(23, 26, 31, 0.04);
          border: 1px solid #F0F1F3;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .donut-chart {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: conic-gradient(#4A90E2FF 0deg 270deg, #E5F2FF 270deg 360deg);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .donut-chart::before {
          content: '';
          position: absolute;
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 50%;
        }

        .donut-center {
          position: relative;
          z-index: 1;
          font-family: 'Open Sans', sans-serif;
          font-size: 32px;
          font-weight: 700;
          color: #1E2128FF;
        }

        /* Bottom Section */
        .bottom-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .activities-section {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0px 2px 8px rgba(23, 26, 31, 0.04);
          border: 1px solid #F0F1F3;
        }

        .activities-section h3 {
          font-family: 'Roboto', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #1E2128FF;
          margin-bottom: 20px;
        }

        .activities-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          background: #F8F9FA;
        }

        .activity-icon {
          font-size: 20px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .activity-content {
          flex: 1;
        }

        .activity-message {
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          color: #1E2128FF;
          margin-bottom: 4px;
        }

        .activity-time {
          font-family: 'Roboto', sans-serif;
          font-size: 12px;
          color: #565D6DFF;
        }

        .right-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .pharmacy-alerts, .system-status {
          background: #FFFFFF;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0px 2px 8px rgba(23, 26, 31, 0.04);
          border: 1px solid #F0F1F3;
        }

        .pharmacy-alerts h3, .system-status h3 {
          font-family: 'Roboto', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #1E2128FF;
          margin-bottom: 16px;
        }

        .alert-item {
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          position: relative;
        }

        .alert-item.critical {
          background: #FEF2F2;
          border-left: 4px solid #DC2626;
        }

        .alert-item.low-stock {
          background: #FFFBEB;
          border-left: 4px solid #F59E0B;
        }

        .alert-name {
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #1E2128FF;
        }

        .alert-stock {
          font-family: 'Roboto', sans-serif;
          font-size: 12px;
          color: #565D6DFF;
          margin: 4px 0;
        }

        .alert-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .alert-badge.critical {
          background: #DC2626;
          color: white;
        }

        .alert-badge.low {
          background: #F59E0B;
          color: white;
        }

        .status-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .status-name {
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          color: #1E2128FF;
        }

        .status-indicator {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-indicator.online {
          background: #10B981;
          color: white;
        }

        .status-indicator.warning {
          background: #F59E0B;
          color: white;
        }

        .status-indicator.offline {
          background: #EF4444;
          color: white;
        }
      `}</style>
    </div>
  );
}
