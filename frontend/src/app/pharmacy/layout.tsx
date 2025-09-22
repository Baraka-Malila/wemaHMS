'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import auth from '@/lib/auth';

export default function PharmacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const token = auth.getToken();
    const user = auth.getUser();
    
    if (!token || !user) {
      router.push('/login');
      return;
    }

    try {
      // User data already parsed by auth manager
      setCurrentUser(user);
      
      // Check if user has pharmacy access
      if (user.role !== 'PHARMACY' && user.role !== 'ADMIN') {
        router.push('/login');
        return;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    auth.clearAuth();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
        {/* Left side - Toggle and Branding */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
            aria-label="Toggle Sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          
          {/* Pharmacy Branding */}
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '20px',
            lineHeight: '25px',
            fontWeight: '700',
            color: '#1E40AF'
          }}>PHARMACY</span>
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
        {/* Sidebar - Pharmacy specific navigation */}
        <aside 
          className={`${sidebarCollapsed ? 'w-[70px]' : 'w-[280px]'} border-r border-gray-200 h-screen sticky top-[50px] flex flex-col transition-all duration-300`}
          style={{ background: '#F8F9FA' }}
        >
          <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-6'} space-y-2`}>
            {/* Dashboard */}
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/pharmacy/dashboard') 
                  ? 'text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`} 
              style={isActive('/pharmacy/dashboard') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/pharmacy/dashboard')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </div>

            {/* Dispense Meds */}
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/pharmacy/dispense') 
                  ? 'text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive('/pharmacy/dispense') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/pharmacy/dispense')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              {!sidebarCollapsed && <span>Dispense Meds</span>}
            </div>

            {/* Stock Check */}
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/pharmacy/stock') 
                  ? 'text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive('/pharmacy/stock') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/pharmacy/stock')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
              </svg>
              {!sidebarCollapsed && <span>Stock Check</span>}
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
