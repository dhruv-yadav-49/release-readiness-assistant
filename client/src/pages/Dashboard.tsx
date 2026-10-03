import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, RotateCcw, Plus, FileText, CheckCircle2, Clock, XCircle, MoreVertical } from 'lucide-react';

export default function Dashboard() {
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = () => {
    axios.get('http://localhost:5000/api/releases').then(res => {
      setReleases(res.data);
      setLoading(false);
    });
  };

  const handleRetry = async (id: string) => {
    try {
      await axios.post(`http://localhost:5000/api/releases/${id}/retry-analysis`);
      fetchReleases();
    } catch (err) {
      console.error('Failed to retry analysis', err);
    }
  };

  // Stats
  const totalReleases = releases.length;
  const completed = releases.filter(r => r.analysisStatus === 'completed').length;
  const processing = releases.filter(r => r.analysisStatus === 'processing').length;
  const failed = releases.filter(r => r.analysisStatus === 'failed').length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Release Dashboard</h1>
          <p className="text-slate-500 mt-2">Manage software releases, track AI analysis status, and generate communication briefs.</p>
        </div>
        <Link to="/create" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-sm font-medium transition-colors">
          <Plus size={20} />
          <span>Create New Release</span>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<FileText size={24} className="text-blue-500" />} title="Total Releases" value={totalReleases} bgColor="bg-blue-50" />
        <StatCard icon={<CheckCircle2 size={24} className="text-emerald-500" />} title="Completed Analysis" value={completed} bgColor="bg-emerald-50" />
        <StatCard icon={<Clock size={24} className="text-amber-500" />} title="Processing" value={processing} bgColor="bg-amber-50" />
        <StatCard icon={<XCircle size={24} className="text-rose-500" />} title="Failed Analysis" value={failed} bgColor="bg-rose-50" />
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search releases by version, title or description..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Status</option>
          </select>
          <select className="border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Analysis Status</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
            <RotateCcw size={16} />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Version</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Release Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Analysis Status</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading releases...</td></tr>
              ) : releases.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No releases found.</td></tr>
              ) : (
                releases.map((release) => (
                  <tr key={release._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="font-bold text-slate-900">v{release.version}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-900 mb-0.5">{release.title}</div>
                      <div className="text-xs text-slate-500 max-w-xs truncate" title={release.items?.[0]?.description || 'No description'}>
                        {release.items?.[0]?.description || 'Core platform features'}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-slate-700">
                        {new Date(release.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <StatusBadge status={release.status} type="status" />
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <StatusBadge status={release.analysisStatus} type="analysis" />
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-800">{release.items?.length || 0}</div>
                      <div className="text-xs text-slate-500">Features/Fixes</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ActionButton release={release} onRetry={() => handleRetry(release._id)} />
                        <button className="text-slate-400 hover:text-slate-600 p-1">
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <div>Showing 1 to {releases.length} of {releases.length} releases</div>
          <div className="flex space-x-2">
            <button className="p-1 rounded border border-slate-300 bg-white text-slate-400 cursor-not-allowed">
              &lt;
            </button>
            <button className="px-3 py-1 rounded bg-blue-600 text-white font-medium shadow-sm">
              1
            </button>
            <button className="p-1 rounded border border-slate-300 bg-white text-slate-400 cursor-not-allowed">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, bgColor }: { icon: React.ReactNode, title: string, value: number, bgColor: string }) {
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center space-x-4">
      <div className={`p-4 rounded-xl ${bgColor}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-extrabold text-slate-900">{value}</div>
        <div className="text-sm text-slate-500 font-medium">{title}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status, type }: { status: string, type: 'status' | 'analysis' }) {
  let config = { bg: 'bg-slate-100', text: 'text-slate-700', icon: null as React.ReactNode };

  if (type === 'status') {
    switch (status) {
      case 'draft': config = { bg: 'bg-slate-100', text: 'text-slate-600', icon: null }; break;
      case 'reviewing': config = { bg: 'bg-purple-100', text: 'text-purple-700', icon: null }; break;
      case 'approved': config = { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: null }; break;
      case 'rejected': config = { bg: 'bg-rose-100', text: 'text-rose-700', icon: null }; break;
      default: config = { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: null }; // default to green for demo
    }
  } else if (type === 'analysis') {
    switch (status) {
      case 'completed': config = { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle2 size={14} className="mr-1.5" /> }; break;
      case 'processing': config = { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock size={14} className="mr-1.5" /> }; break;
      case 'failed': config = { bg: 'bg-rose-100', text: 'text-rose-700', icon: <XCircle size={14} className="mr-1.5" /> }; break;
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  );
}

function ActionButton({ release, onRetry }: { release: any, onRetry: () => void }) {
  if (release.analysisStatus === 'failed') {
    return (
      <button onClick={onRetry} className="flex items-center space-x-1.5 text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors">
        <RotateCcw size={16} />
        <span>Retry Analysis</span>
      </button>
    );
  }
  
  if (release.analysisStatus === 'processing') {
    return (
      <button disabled className="flex items-center space-x-1.5 text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium cursor-not-allowed">
        <Clock size={16} />
        <span>Processing...</span>
      </button>
    );
  }

  return (
    <Link to={`/review/${release._id}`} className="flex items-center space-x-1.5 text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors">
      <FileText size={16} />
      <span>Review Brief</span>
    </Link>
  );
}
