// Doctor Dashboard Page
// TODO: Integrate Visily design
export default function DoctorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">👨‍⚕️ Doctor Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome to the Doctor Portal</p>
        <div className="text-sm text-gray-500 space-y-2">
          <p>✅ Authentication System: Complete</p>
          <p>🔄 Patient Records: Coming Soon</p>
          <p>🔄 Appointment Schedule: Coming Soon</p>
          <p>🔄 Medical Charts: Coming Soon</p>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-700 font-medium">WEMA Hospital Management System</p>
          <p className="text-blue-600 text-sm">Doctor Module</p>
        </div>
      </div>
    </div>
  );
}
