import { Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CreateRelease from './pages/CreateRelease'
import ReviewBrief from './pages/ReviewBrief'
import VersionHistory from './pages/VersionHistory'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center font-bold text-xl text-blue-600">
                Release Readiness Assistant
              </Link>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/create" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Create Release
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateRelease />} />
          <Route path="/review/:id" element={<ReviewBrief />} />
          <Route path="/history/:id" element={<VersionHistory />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
