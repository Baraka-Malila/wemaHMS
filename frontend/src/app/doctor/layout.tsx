'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Stethoscope, 
  Users, 
  FileText, 
  TestTube, 
  Pill, 
  History, 
  LogOut, 
  Menu, 
  X,
  Activity
} from 'lucide-react';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'DOCTOR') {
        router.push('/login');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/doctor/dashboard', icon: Activity, current: pathname === '/doctor/dashboard' },
    { name: 'Patient Queue', href: '/doctor/queue', icon: Users, current: pathname === '/doctor/queue' },
    { name: 'Diagnoses', href: '/doctor/diagnoses', icon: FileText, current: pathname === '/doctor/diagnoses' },
    { name: 'Lab Requests', href: '/doctor/lab-requests', icon: TestTube, current: pathname === '/doctor/lab-requests' },
    { name: 'Prescriptions', href: '/doctor/prescriptions', icon: Pill, current: pathname === '/doctor/prescriptions' },
    { name: 'Patient History', href: '/doctor/history', icon: History, current: pathname === '/doctor/history' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-6 bg-green-600">
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">WEMA HMS</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-8 px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-green-50 text-green-600 border-r-2 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-white lg:shadow-lg">
        <div className="flex items-center h-16 px-6 bg-green-600">
          <Stethoscope className="h-8 w-8 text-white" />
          <span className="ml-2 text-xl font-bold text-white">WEMA HMS</span>
        </div>
        <nav className="flex-1 mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  item.current
                    ? 'bg-green-50 text-green-600 border-r-2 border-green-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-green-600"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Doctor Portal</h1>
                <p className="text-sm text-gray-600">Medical Consultation & Patient Care</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                <p className="text-xs text-gray-600">{user.employee_id} • Doctor</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
