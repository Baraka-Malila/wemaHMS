// Admin Dashboard Page
// TODO: Integrate Visily design
export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold text-purple-600 mb-4">⚙️ Admin Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome to the Administration Portal</p>
        <div className="text-sm text-gray-500 space-y-2">
          <p>✅ User Management: Available</p>
          <p>✅ Password Resets: Available</p>
          <p>✅ User Approvals: Available</p>
          <p>🔄 Full Dashboard: In Progress</p>
        </div>
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-purple-700 font-medium">WEMA Hospital Management System</p>
          <p className="text-purple-600 text-sm">Administration Module</p>
        </div>
      </div>
    </div>
  );
}
