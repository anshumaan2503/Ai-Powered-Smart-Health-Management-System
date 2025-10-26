export default function WorkingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          ✅ Frontend is Working!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          If you can see this page, your Next.js frontend is running correctly.
        </p>
        <div className="space-y-2">
          <a href="/" className="block text-blue-600 hover:underline">
            ← Back to Home
          </a>
          <a href="/login" className="block text-blue-600 hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    </div>
  )
}