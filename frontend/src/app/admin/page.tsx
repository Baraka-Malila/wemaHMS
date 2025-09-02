import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">🔧 Admin Portal</h1>
        <p className="text-gray-600 mb-8">WEMA Hospital Management System</p>
        
        <div className="space-y-4">
          <Link 
            href="/admin/dashboard" 
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            📊 Dashboard
          </Link>
          
          <Link 
            href="/login" 
            className="block w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            🔐 Login
          </Link>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Admin Portal v1.0</p>
        </div>
      </div>
    </div>
  );
}
