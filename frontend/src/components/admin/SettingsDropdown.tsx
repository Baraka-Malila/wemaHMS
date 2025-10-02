'use client';

import { useState, useEffect, useRef } from 'react';
import { Settings, User, Lock, HelpCircle, Info } from 'lucide-react';
import auth from '@/lib/auth';

export default function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    full_name: string;
    email: string;
    role: string;
    employee_id: string;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch user profile
    const fetchProfile = async () => {
      try {
        const token = auth.getToken();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/profile/`, {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-gray-100 rounded-lg"
        aria-label="Settings"
      >
        <Settings className="h-[18px] w-[18px] text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
          {/* User Info */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg">
                {userInfo?.full_name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {userInfo?.full_name || 'Loading...'}
                </p>
                <p className="text-xs text-gray-600">
                  {userInfo?.email || 'Loading email...'}
                </p>
                {userInfo && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {userInfo.employee_id} • {userInfo.role}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Profile Settings</p>
                <p className="text-xs text-gray-500">View and edit your profile</p>
              </div>
            </button>

            <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <Lock className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Change Password</p>
                <p className="text-xs text-gray-500">Update your password</p>
              </div>
            </button>

            <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Help & Support</p>
                <p className="text-xs text-gray-500">Get help with the system</p>
              </div>
            </button>

            <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Info className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">About</p>
                <p className="text-xs text-gray-500">System version & info</p>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <p className="text-xs text-center text-gray-500">
              WEMA HMS v1.0.0
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
