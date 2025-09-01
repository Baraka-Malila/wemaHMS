// Nurse Dashboard Page
// TODO: Integrate Visily design
export default function NurseDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold text-pink-600 mb-4">👩‍⚕️ Nurse Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome to the Nursing Portal</p>
        <div className="text-sm text-gray-500 space-y-2">
          <p>✅ Authentication System: Complete</p>
          <p>🔄 Patient Care: Coming Soon</p>
          <p>🔄 Medication Management: Coming Soon</p>
          <p>🔄 Shift Schedules: Coming Soon</p>
        </div>
        <div className="mt-6 p-4 bg-pink-50 rounded-lg">
          <p className="text-pink-700 font-medium">WEMA Hospital Management System</p>
          <p className="text-pink-600 text-sm">Nursing Module</p>
        </div>
      </div>
    </div>
  );
}
