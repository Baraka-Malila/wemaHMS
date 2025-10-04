'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import auth from '@/lib/auth';
import {
  DollarSign,
  Activity,
  TrendingUp,
  Calculator,
  LogOut,
  Menu,
  X,
  Banknote,
  Receipt
} from 'lucide-react';
import NotificationsDropdown from '@/components/finance/NotificationsDropdown';
import SettingsDropdown from '@/components/shared/SettingsDropdown';

export default function FinanceLayout({
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
    const authUser = auth.getUser();
    
    if (!token || !authUser) {
      router.push('/login');
      return;
    }

    try {
      // User data already parsed by auth manager
      // Allow FINANCE, RECEPTION (as they handle finance too), and ADMIN
      if (!['FINANCE', 'RECEPTION', 'ADMIN'].includes(authUser.role)) {
        router.push('/login');
        return;
      }
      setUser(authUser);
    } catch (error) {
      router.push('/login');
    }

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
          <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
          
          {/* Finance Branding */}
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '20px',
            lineHeight: '25px',
            fontWeight: '700',
            color: '#D97706'
          }}>FINANCE</span>
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
        {/* Sidebar - Finance specific navigation */}
        <aside 
          className={`${sidebarCollapsed ? 'w-[70px]' : 'w-[280px]'} border-r border-gray-200 h-screen sticky top-[50px] flex flex-col transition-all duration-300`}
          style={{ background: '#F8F9FA' }}
        >
          <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-6'} space-y-2`}>
            {/* Dashboard */}
            <div 
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/finance/dashboard') 
                  ? 'text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`} 
              style={isActive('/finance/dashboard') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/finance/dashboard')}
            >
              <Activity className="h-5 w-5" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </div>

            {/* Payment History */}
            <div
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/finance/payment-history')
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive('/finance/payment-history') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/finance/payment-history')}
            >
              <Receipt className="h-5 w-5" />
              {!sidebarCollapsed && <span>Payment History</span>}
            </div>

            {/* Daily Operations */}
            <div
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-3 rounded-lg font-medium cursor-pointer ${
                isActive('/finance/daily-ops')
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={isActive('/finance/daily-ops') ? { background: '#9CA3AF' } : {}}
              onClick={() => router.push('/finance/daily-ops')}
            >
              <Calculator className="h-5 w-5" />
              {!sidebarCollapsed && <span>Daily Operations</span>}
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
