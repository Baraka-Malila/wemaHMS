// Lab Dashboard Page
// TODO: Integrate Visily design
export default function LabDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold text-teal-600 mb-4">🔬 Lab Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome to the Laboratory Portal</p>
        <div className="text-sm text-gray-500 space-y-2">
          <p>✅ Authentication System: Complete</p>
          <p>🔄 Test Results: Coming Soon</p>
          <p>🔄 Sample Tracking: Coming Soon</p>
          <p>🔄 Equipment Management: Coming Soon</p>
        </div>
        <div className="mt-6 p-4 bg-teal-50 rounded-lg">
          <p className="text-teal-700 font-medium">WEMA Hospital Management System</p>
          <p className="text-teal-600 text-sm">Laboratory Module</p>
        </div>
      </div>
    </div>
  );
}
