'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Key, X, Users, UserCog, Stethoscope, Activity as ActivityIcon } from 'lucide-react';
import auth from '@/lib/auth';

interface Staff {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  portal_access: string;
  remaining_temporary_hours: number | null;
}

interface PendingApproval {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  created_at: string;
}

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  userName: string;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose, employeeId, userName }) => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmReset = async () => {
    if (!token || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const authToken = auth.getToken();
      
      // Debug logging
      console.log('Password Reset Debug:', {
        employeeId,
        token: token.trim(),
        authToken: authToken?.substring(0, 10) + '...',
        passwordLength: newPassword.length
      });
      
      const requestBody = {
        employee_id: employeeId,
        token: token.trim(), // Ensure no whitespace
        new_password: newPassword,
        confirm_password: confirmPassword
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/password-reset-confirm/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Response:', { status: response.status, data });

      if (response.ok && data.success) {
        onClose();
        setToken('');
        setNewPassword('');
        setConfirmPassword('');
        alert('Password reset successfully!');
      } else {
        // Handle detailed error messages
        let errorMessage = 'Failed to reset password';
        
        if (data.message) {
          errorMessage = data.message;
        }
        
        if (data.errors) {
          const errorDetails = [];
          if (data.errors.non_field_errors) {
            errorDetails.push(...data.errors.non_field_errors);
          }
          if (data.errors.token) {
            errorDetails.push(`Token: ${data.errors.token.join(', ')}`);
          }
          if (data.errors.employee_id) {
            errorDetails.push(`Employee ID: ${data.errors.employee_id.join(', ')}`);
          }
          if (data.errors.new_password) {
            errorDetails.push(`Password: ${data.errors.new_password.join(', ')}`);
          }
          
          if (errorDetails.length > 0) {
            errorMessage = errorDetails.join('\n');
          }
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Reset Password - {userName}
          </h3>
          <button
            onClick={() => { onClose(); resetModal(); }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter the token and new password for {userName} ({employeeId}):
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Reset Token
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-base tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter 6-digit token"
              maxLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => { onClose(); resetModal(); }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              disabled={isSubmitting || !token || !newPassword || !confirmPassword}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StaffManagement() {
  // Helper function to determine if a user is truly active
  const isUserTrulyActive = (staff: Staff): boolean => {
    // If user is not active, they're definitely inactive
    if (!staff.is_active) return false;
    
    // If user has temporary access (remaining_temporary_hours is not null), check if it's expired
    if (staff.remaining_temporary_hours !== null && staff.remaining_temporary_hours <= 0) {
      return false;
    }
    
    return true;
  };

  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [passwordResetModal, setPasswordResetModal] = useState<{
    isOpen: boolean;
    employeeId: string;
    userName: string;
  }>({
    isOpen: false,
    employeeId: '',
    userName: ''
  });

  const fetchStaffData = async () => {
    try {
      const token = auth.getToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Test authentication first
      const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/profile/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.ok) {
        window.location.href = '/login';
        return;
      }

      // Fetch staff list
      const staffResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/users/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        const users = staffData.users || [];
        setStaffList(users);
        setFilteredStaff(users);
      }

      // Fetch pending approvals
      const approvalsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/pending-approvals/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (approvalsResponse.ok) {
        const approvalsData = await approvalsResponse.json();
        setPendingApprovals(approvalsData.pending_users || []);
      }

    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStaffData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter staff based on search and role
  useEffect(() => {
    let filtered = staffList;
    
    if (searchTerm) {
      filtered = filtered.filter(staff =>
        staff.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(staff => staff.role === roleFilter);
    }
    
    setFilteredStaff(filtered);
  }, [staffList, searchTerm, roleFilter]);

  const handleApproveReject = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const token = auth.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/approve-user/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          action: action
        }),
      });
      
      if (response.ok) {
        fetchStaffData(); // Refresh data
        alert(`User ${action}d successfully`);
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || `Failed to ${action} user`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(`Failed to ${action} user: ${errorMessage}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Network error ${action}ing user. Please try again.`);
    }
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (!confirm(`Are you sure you want to delete ${staffName}?`)) return;
    
    try {
      const token = auth.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/delete-user/${staffId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        fetchStaffData(); // Refresh data
        alert(data.message);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete staff member. Please try again.');
    }
  };

  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff);
  };

  const handleSaveEdit = async () => {
    if (!editingStaff) return;

    try {
      const token = auth.getToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/update-user/${editingStaff?.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: editingStaff?.full_name,
          email: editingStaff?.email,
          role: editingStaff?.role,
          phone_number: editingStaff?.phone_number
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchStaffData(); // Refresh data
        setEditingStaff(null);
        alert(data.message);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update staff member. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading staff data...</div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
        <p className="text-sm text-gray-600 mt-1">Manage hospital staff and user accounts</p>
      </div>

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-600">Total Staff</h3>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {staffList.filter(staff => isUserTrulyActive(staff)).length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Active employees</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-600">Doctors</h3>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {staffList.filter(s => s.role === 'DOCTOR').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Medical staff</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-600">Nurses</h3>
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <ActivityIcon className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {staffList.filter(s => s.role === 'NURSE').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Nursing staff</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-gray-600">Pending</h3>
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <UserCog className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{pendingApprovals.length}</div>
            <div className="text-xs text-gray-600 mt-1">Awaiting approval</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Staff List */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-900">Staff Directory</h3>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '14px'
                    }}
                  />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontSize: '14px'
                    }}
                  >
                    <option value="ALL">All Roles</option>
                    <option value="DOCTOR">Doctors</option>
                    <option value="NURSE">Nurses</option>
                    <option value="ADMIN">Admin</option>
                    <option value="RECEPTION">Reception</option>
                    <option value="PHARMACY">Pharmacy</option>
                    <option value="LAB">Lab</option>
                    <option value="FINANCE">Finance</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredStaff.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm || roleFilter !== 'ALL' ? 'No staff found matching filters' : 'No staff members found'}
                  </div>
                ) : (
                  filteredStaff.slice(0, 20).map((staff) => (
                    <div key={staff.id} className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {staff.full_name}
                          </p>
                          <p className="text-xs font-mono text-gray-600">
                            {staff.employee_id} • {staff.role}
                          </p>
                          <p className="text-xs text-gray-600">
                            {staff.email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            isUserTrulyActive(staff)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-50 text-red-600'
                          }`}>
                            {isUserTrulyActive(staff) ? 'Active' : 'Inactive'}
                          </span>
                          {staff.remaining_temporary_hours !== null && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              staff.remaining_temporary_hours > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-50 text-red-600'
                            }`}>
                              Temp: {staff.remaining_temporary_hours > 0 ? `${staff.remaining_temporary_hours}h left` : 'Expired'}
                            </span>
                          )}
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditStaff(staff)}
                              className="p-1.5 rounded hover:bg-gray-100"
                              title="Edit Staff"
                              style={{ cursor: 'pointer' }}
                            >
                              <Edit size={14} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => setPasswordResetModal({
                                isOpen: true,
                                employeeId: staff.employee_id,
                                userName: staff.full_name
                              })}
                              className="p-1.5 rounded hover:bg-gray-100"
                              title="Reset Password"
                              style={{ cursor: 'pointer' }}
                            >
                              <Key size={14} className="text-amber-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(staff.id, staff.full_name)}
                              className="p-1.5 rounded hover:bg-gray-100"
                              title="Delete Staff"
                              style={{ cursor: 'pointer' }}
                            >
                              <Trash2 size={14} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {filteredStaff.length > 20 && (
                  <div className="text-center py-2 text-sm text-gray-500">
                    Showing 20 of {filteredStaff.length} staff members
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Pending Approvals
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No pending approvals
                  </div>
                ) : (
                  pendingApprovals.slice(0, 10).map((approval) => (
                    <div key={approval.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {approval.full_name}
                          </p>
                          <p className="text-xs font-mono text-gray-600">
                            {approval.employee_id} • {approval.role}
                          </p>
                          <p className="text-xs text-gray-600">
                            {approval.email}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveReject(approval.id, 'approve')}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveReject(approval.id, 'reject')}
                            className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {pendingApprovals.length > 10 && (
                  <div className="text-center py-2 text-sm text-gray-500">
                    Showing 10 of {pendingApprovals.length} pending approvals
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={passwordResetModal.isOpen}
        onClose={() => setPasswordResetModal({ isOpen: false, employeeId: '', userName: '' })}
        employeeId={passwordResetModal.employeeId}
        userName={passwordResetModal.userName}
      />

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Staff Member
              </h3>
              <button
                onClick={() => setEditingStaff(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editingStaff.full_name || ''}
                  onChange={(e) => setEditingStaff({...editingStaff, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingStaff.email || ''}
                  onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editingStaff.phone_number || ''}
                  onChange={(e) => setEditingStaff({...editingStaff, phone_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Role
                </label>
                <select
                  value={editingStaff.role || ''}
                  onChange={(e) => setEditingStaff({...editingStaff, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DOCTOR">Doctor</option>
                  <option value="NURSE">Nurse</option>
                  <option value="ADMIN">Admin</option>
                  <option value="RECEPTION">Receptionist</option>
                  <option value="PHARMACY">Pharmacist</option>
                  <option value="LAB">Lab Technician</option>
                  <option value="FINANCE">Finance</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingStaff.is_active}
                  onChange={(e) => setEditingStaff({...editingStaff, is_active: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
                  Active Employee
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setEditingStaff(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
