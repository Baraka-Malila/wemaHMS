// Reception Dashboard Page
// TODO: Integrate Visily design
export default function ReceptionDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">🏨 Reception Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome to the Reception Portal</p>
        <div className="text-sm text-gray-500 space-y-2">
          <p>✅ Authentication System: Complete</p>
          <p>🔄 Patient Registration: Coming Soon</p>
          <p>🔄 Appointment Management: Coming Soon</p>
          <p>🔄 Queue Management: Coming Soon</p>
        </div>
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-green-700 font-medium">WEMA Hospital Management System</p>
          <p className="text-green-600 text-sm">Reception Module</p>
        </div>
      </div>
    </div>
  );
}
