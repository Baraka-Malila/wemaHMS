import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">🏥 WemaHMS</h1>
          <p className="text-gray-600 text-lg">Hospital Management System</p>
        </div>

        <div className="space-y-4 mb-8">
          <Link 
            href="/admin" 
            className="block w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            🔧 Admin Portal
          </Link>
          
          <Link 
            href="/login" 
            className="block w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
          >
            👨‍⚕️ Staff Login
          </Link>
          
          <Link 
            href="/register" 
            className="block w-full bg-purple-600 text-white py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg"
          >
            📝 Register
          </Link>
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p>✅ Authentication System</p>
          <p>✅ Admin Dashboard</p>
          <p>🔄 Staff Portals (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
}
