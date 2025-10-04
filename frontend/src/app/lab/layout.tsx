'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import auth from '@/lib/auth';
import {
  TestTube,
  Activity,
  ClipboardList,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Microscope
} from 'lucide-react';
import NotificationsDropdown from '@/components/lab/NotificationsDropdown';
import SettingsDropdown from '@/components/shared/SettingsDropdown';

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const token = auth.getToken();
    const userData = auth.getUser();

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    if (userData.role !== 'LAB') {
      router.push('/login');
      return;
    }

    setUser(userData);

    // Load sidebar preference from localStorage
    const savedSidebarState = localStorage.getItem('sidebar-collapsed');
    if (savedSidebarState) {
      setSidebarCollapsed(JSON.parse(savedSidebarState));
    }
  }, [router]);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  const handleLogout = () => {
    auth.clearAuth();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  if (!user) {
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
      <header className="bg-white border-b border-gray-200 px-6 py-3 fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[50px]">
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
          
          {/* Lab Branding */}
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '20px',
            lineHeight: '25px',
            fontWeight: '700',
            color: '#1E40AF'
          }}>LABORATORY</span>
        </div>
        
        {/* Remove center heading - now empty */}
        <div></div>
        
        <div className="flex items-center space-x-2">
          <NotificationsDropdown />
          <SettingsDropdown />
          <button
            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
            aria-label="Logout"
            onClick={handleLogout}
          >
            <LogOut className="h-[18px] w-[18px] text-red-600" />
          </button>
        </div>
      </header>

      <div className="flex pt-[50px]">
        {/* Sidebar - Lab specific navigation */}
        <aside 
          className={`${sidebarCollapsed ? 'w-[70px]' : 'w-[280px]'} border-r border-gray-200 h-screen sticky top-[50px] flex flex-col transition-all duration-300`}
          style={{ background: '#F8F9FA' }}
        >
          <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-6'} space-y-2`}>
            {/* Dashboard */}
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/lab/dashboard') 
                  ? 'text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`} 
              style={isActive('/lab/dashboard') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/lab/dashboard')}
            >
              <Activity className="h-5 w-5" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </div>

            {/* Test Results */}
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/lab/test-results') 
                  ? 'text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive('/lab/test-results') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/lab/test-results')}
            >
              <ClipboardList className="h-5 w-5" />
              {!sidebarCollapsed && <span>Test Results</span>}
            </div>

            {/* Supply Orders */}
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/lab/supply-orders') 
                  ? 'text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive('/lab/supply-orders') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/lab/supply-orders')}
            >
              <ShoppingCart className="h-5 w-5" />
              {!sidebarCollapsed && <span>Supply Orders</span>}
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
