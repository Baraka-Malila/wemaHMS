// Finance Dashboard Page
// TODO: Integrate Visily design
export default function FinanceDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">💰 Finance Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome to the Finance Portal</p>
        <div className="text-sm text-gray-500 space-y-2">
          <p>✅ Authentication System: Complete</p>
          <p>🔄 Billing Management: Coming Soon</p>
          <p>🔄 Payment Processing: Coming Soon</p>
          <p>🔄 Financial Reports: Coming Soon</p>
        </div>
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-700 font-medium">WEMA Hospital Management System</p>
          <p className="text-yellow-600 text-sm">Finance Module</p>
        </div>
      </div>
    </div>
  );
}
