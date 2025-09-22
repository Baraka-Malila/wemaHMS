'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Load sidebar preference from localStorage
    const savedSidebarState = localStorage.getItem('sidebar-collapsed');
    if (savedSidebarState) {
      setSidebarCollapsed(JSON.parse(savedSidebarState));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/login');
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="min-h-screen" style={{ background: '#F8F9FA' }}>
      {/* Top Header - Same as finance/pharmacy */}
      <header 
        className="bg-white border-b border-gray-200 px-6 py-3 fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[50px]"
      >
        {/* Left side - Toggle and Branding */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
            aria-label="Toggle Sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          
          {/* Admin Branding */}
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '20px',
            lineHeight: '25px',
            fontWeight: '700',
            color: '#1E40AF'
          }}>ADMIN</span>
        </div>
        
        {/* Remove center heading - now empty */}
        <div></div>
        
        <div className="flex items-center space-x-4">
          <button className="p-1.5 hover:bg-gray-100 rounded-lg" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg" aria-label="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button className="p-1.5 hover:bg-red-100 rounded-lg" aria-label="Logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="flex pt-[50px]">
        {/* Sidebar */}
        <aside 
          className={`${sidebarCollapsed ? 'w-[70px]' : 'w-[280px]'} border-r border-gray-200 h-screen sticky top-[50px] flex flex-col transition-all duration-300`}
          style={{ background: '#F8F9FA' }}
        >
          <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-6'} space-y-2`}>
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/admin/dashboard') 
                  ? 'text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`} 
              style={isActive('/admin/dashboard') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/admin/dashboard')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </div>
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/admin/staff') 
                  ? 'text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive('/admin/staff') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/admin/staff')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {!sidebarCollapsed && <span>Staff Management</span>}
            </div>
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/admin/patients') 
                  ? 'text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive('/admin/patients') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/admin/patients')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {!sidebarCollapsed && <span>Patient Records</span>}
            </div>
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/admin/pharmacy') 
                  ? 'text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive('/admin/pharmacy') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/admin/pharmacy')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              {!sidebarCollapsed && <span>Pharmacy Inventory</span>}
            </div>
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/admin/reports') 
                  ? 'text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive('/admin/reports') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/admin/reports')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              {!sidebarCollapsed && <span>Reports</span>}
            </div>
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/admin/analytics') 
                  ? 'text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive('/admin/analytics') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/admin/analytics')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
              {!sidebarCollapsed && <span>Analytics</span>}
            </div>
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/admin/settings') 
                  ? 'text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive('/admin/settings') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/admin/settings')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              {!sidebarCollapsed && <span>System Settings</span>}
            </div>
          </nav>
        </aside>

        {/* Main Content Container */}
        <main className="flex-1" style={{ background: '#F8F9FA', padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
