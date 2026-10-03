import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Settings, FileText } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CreateRelease from './pages/CreateRelease';
import ReviewBrief from './pages/ReviewBrief';
import VersionHistory from './pages/VersionHistory';
import FinalBrief from './pages/FinalBrief';
import SettingsPage from './pages/Settings';

function App() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Create Release', path: '/create', icon: PlusCircle },
    { name: 'Version History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col hidden md:flex fixed h-full z-10">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-700/50">
          <div className="bg-blue-500 p-2 rounded-lg">
            <FileText size={24} className="text-white" />
          </div>
          <h1 className="font-bold text-lg leading-tight">
            Release Readiness <br /> Assistant
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive
                    ? 'bg-blue-600/20 text-blue-400 font-medium'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
              >
                <Icon size={20} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header Placeholder (if needed, e.g., user profile) */}
        <header className="h-16 bg-white border-b flex items-center justify-end px-8 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
              DU
            </div>
            <span className="font-medium text-sm text-slate-700">Dhruv ⌄</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1 overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateRelease />} />
            <Route path="/review/:id" element={<ReviewBrief />} />
            <Route path="/history" element={<VersionHistory />} />
            <Route path="/history/:id" element={<VersionHistory />} />
            <Route path="/final-brief/:id" element={<FinalBrief />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
