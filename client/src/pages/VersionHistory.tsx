import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, FileText, Calendar, CheckCircle2, Eye, Plus, ArrowRightLeft, 
  Sparkles, Wrench, ArrowLeftRight, Check, Minus, MoreVertical, Box
} from 'lucide-react';

export default function VersionHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [v1Id, setV1Id] = useState<string>('');
  const [v2Id, setV2Id] = useState<string>('');

  useEffect(() => {
    if (!id) {
      axios.get('http://localhost:5000/api/releases')
        .then(res => {
          if (res.data && res.data.length > 0) {
            navigate(`/history/${res.data[0]._id}`, { replace: true });
          } else {
            setLoading(false);
          }
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
      return;
    }

    axios.get(`http://localhost:5000/api/releases/${id}/history`)
      .then(res => {
        const data = res.data;
        setHistory(data);
        if (data.length >= 2) {
          setV1Id(data[1]._id);
          setV2Id(data[0]._id);
        } else if (data.length === 1) {
          setV1Id(data[0]._id);
          setV2Id(data[0]._id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, navigate]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading version history...</div>;
  if (history.length === 0) return <div className="p-8 text-center text-slate-500">No version history found.</div>;

  const latest = history[0];
  const oldest = history[history.length - 1];
  const reversedHistory = [...history].reverse(); // For timeline (oldest to newest)

  const v1Release = history.find(r => r._id === v1Id);
  const v2Release = history.find(r => r._id === v2Id);

  // Compute Diffs
  const computeDiff = () => {
    if (!v1Release || !v2Release) return [];
    const map1 = new Map<string, any>((v1Release.items || []).map((i: any) => [i.itemId, i]));
    const map2 = new Map<string, any>((v2Release.items || []).map((i: any) => [i.itemId, i]));
    
    const allIds = Array.from(new Set([...map1.keys(), ...map2.keys()]));
    
    // Sort logic: keep original order as much as possible
    const diffs = allIds.map(itemId => {
      const i1 = map1.get(itemId);
      const i2 = map2.get(itemId);
      if (i1 && !i2) return { id: itemId, status: 'removed', v1: i1, v2: null };
      if (!i1 && i2) return { id: itemId, status: 'added', v1: null, v2: i2 };
      
      const isModified = i1.description !== i2.description || i1.type !== i2.type;
      return { id: itemId, status: isModified ? 'modified' : 'unchanged', v1: i1, v2: i2 };
    });

    // Custom sorting: unchanged first, then modified, then added/removed
    return diffs.sort((a, b) => {
      const order: any = { unchanged: 1, modified: 2, added: 3, removed: 4 };
      return order[a.status] - order[b.status];
    });
  };

  const diffs = computeDiff();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-2">
        <Link to="/" className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 text-sm font-medium transition-colors">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Version History</h1>
        <p className="text-slate-500 mt-1">Track changes across different versions of this release and compare what has been added, modified, or removed.</p>
      </div>

      {/* Top Summary Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h2 className="text-xl font-bold text-slate-900">{latest.title}</h2>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">Latest Version: v{latest.version}</span>
              </div>
              <p className="text-sm text-slate-600 max-w-2xl">{latest.description}</p>
            </div>
          </div>
          <Link to={`/create?sourceId=${latest._id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm shrink-0">
            <Plus size={16} />
            <span>Create New Version</span>
          </Link>
        </div>
        
        <div className="flex space-x-12 pt-5 border-t border-slate-100">
          <div className="flex items-start space-x-3">
            <Box className="text-blue-400 mt-0.5" size={18} />
            <div>
              <div className="text-xs font-bold text-slate-900">Total Versions</div>
              <div className="text-xs text-slate-500 mt-0.5">{history.length}</div>
            </div>
          </div>
          <div className="flex items-start space-x-3 border-l border-slate-100 pl-12">
            <Calendar className="text-blue-400 mt-0.5" size={18} />
            <div>
              <div className="text-xs font-bold text-slate-900">First Release</div>
              <div className="text-xs text-slate-500 mt-0.5">{new Date(oldest.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
          <div className="flex items-start space-x-3 border-l border-slate-100 pl-12">
            <FileText className="text-blue-400 mt-0.5" size={18} />
            <div>
              <div className="text-xs font-bold text-slate-900">Latest Release</div>
              <div className="text-xs text-slate-500 mt-0.5">{new Date(latest.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
          <div className="flex items-start space-x-3 border-l border-slate-100 pl-12">
            <CheckCircle2 className="text-emerald-500 mt-0.5" size={18} />
            <div>
              <div className="text-xs font-bold text-slate-900 mb-1">Status</div>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{latest.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-1">Version History Timeline</h3>
        <p className="text-xs text-slate-500 mb-8">Click on any version to view details or compare changes.</p>
        
        <div className="relative flex justify-between items-center px-12">
          {/* Connecting line */}
          <div className="absolute top-3 left-12 right-12 h-0.5 bg-slate-200 -z-10"></div>
          
          {reversedHistory.map((rev, index) => {
            const isLatest = index === reversedHistory.length - 1;
            const isInitial = index === 0;
            return (
              <div key={rev._id} className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center mb-3 ${isLatest ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                </div>
                <div className="text-sm font-bold text-slate-900">v{rev.version}</div>
                <div className="text-xs text-slate-500 mt-0.5">{new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div className={`mt-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  isLatest ? 'bg-emerald-100 text-emerald-700' : isInitial ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'
                }`}>
                  {isLatest ? 'Current Version' : isInitial ? 'Initial Release' : 'Update Release'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{rev.items?.length || 0} items</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Versions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Versions List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Version</th>
              <th className="px-6 py-4">Release Date</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Analysis Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.map((rev) => (
              <tr key={rev._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">v{rev.version}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{rev.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{rev.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{rev.items?.length || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center">
                    <CheckCircle2 size={12} className="mr-1" /> completed
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end space-x-2">
                    <Link to={`/review/${rev._id}`} className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                      <Eye size={14} />
                      <span>View</span>
                    </Link>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {/* Compare Versions */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-slate-900">Compare Versions</h3>
            <p className="text-xs text-slate-500 mt-1">Select two versions to see a side-by-side comparison of changes.</p>
          </div>
          <div className="flex items-center space-x-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <select 
              className="border-none bg-transparent text-sm font-semibold text-slate-700 focus:ring-0 outline-none cursor-pointer"
              value={v1Id} onChange={e => setV1Id(e.target.value)}
            >
              {history.map(h => <option key={h._id} value={h._id}>Version 1: v{h.version}</option>)}
            </select>
            <button className="text-slate-400 hover:text-blue-600 transition-colors"><ArrowRightLeft size={16} /></button>
            <select 
              className="border-none bg-transparent text-sm font-semibold text-slate-700 focus:ring-0 outline-none cursor-pointer"
              value={v2Id} onChange={e => setV2Id(e.target.value)}
            >
              {history.map(h => <option key={h._id} value={h._id}>Version 2: v{h.version}</option>)}
            </select>
            <button className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
              Compare
            </button>
          </div>
        </div>

        {v1Release && v2Release && (
          <div className="space-y-6">
            {/* Side-by-side Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReleaseSummaryCard release={v1Release} label="Previous Version" />
              <ReleaseSummaryCard release={v2Release} label="Current Version" />
            </div>

            {/* Changes List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="font-bold text-slate-900">Changes in Release Items</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Detailed comparison of items between the two versions.</p>
                </div>
                <div className="flex items-center space-x-4 text-xs font-semibold">
                  <div className="flex items-center space-x-1.5 text-emerald-700"><Check size={14} className="bg-emerald-100 rounded-sm p-0.5" /><span>Added</span></div>
                  <div className="flex items-center space-x-1.5 text-amber-700"><div className="w-3.5 h-3.5 bg-amber-100 rounded-sm"></div><span>Modified</span></div>
                  <div className="flex items-center space-x-1.5 text-rose-700"><XIcon /><span>Removed</span></div>
                  <div className="flex items-center space-x-1.5 text-slate-500"><Minus size={14} className="bg-slate-100 rounded-full p-0.5" /><span>Unchanged</span></div>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
                <div className="font-bold text-sm text-slate-900 mb-2 px-2 border-b border-slate-100 pb-2">v{v1Release.version} Items ({v1Release.items?.length || 0})</div>
                <div></div>
                <div className="font-bold text-sm text-slate-900 mb-2 px-2 border-b border-slate-100 pb-2">v{v2Release.version} Items ({v2Release.items?.length || 0})</div>
                
                {diffs.map(diff => (
                  <React.Fragment key={diff.id}>
                    {/* Left Side (V1) */}
                    <div className="px-2 min-w-0">
                      {diff.v1 ? <ItemRow item={diff.v1} status={diff.status} side="left" /> : <div className="h-full flex items-center text-xs text-slate-400 italic px-4 bg-slate-50 rounded-lg border border-transparent border-dashed">Not included in v{v1Release.version} (Added)</div>}
                    </div>
                    {/* Arrow middle */}
                    <div className="flex items-center justify-center text-slate-300">
                      &rarr;
                    </div>
                    {/* Right Side (V2) */}
                    <div className="px-2 min-w-0">
                      {diff.v2 ? <ItemRow item={diff.v2} status={diff.status} side="right" /> : <div className="h-full flex items-center text-xs text-slate-400 italic px-4 bg-slate-50 rounded-lg border border-transparent border-dashed">Not included in v{v2Release.version} (Removed)</div>}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponents

function ReleaseSummaryCard({ release, label }: { release: any, label: string }) {
  const isCurrent = label === 'Current Version';
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-slate-900 text-lg leading-tight">v{release.version}</h4>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isCurrent ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                {label}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 mb-1">{new Date(release.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">{release.status}</span>
        </div>
      </div>
      <h5 className="font-bold text-slate-900 mb-1">{release.title}</h5>
      <p className="text-xs text-slate-600 mb-4 flex-1 line-clamp-2">{release.description}</p>
      
      <div className="flex space-x-4 border-t border-slate-100 pt-3">
        <div className="flex items-start space-x-2 w-1/3">
          <Box className="text-blue-400 mt-0.5 shrink-0" size={14} />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold text-slate-900">Total Items</div>
            <div className="text-xs font-medium text-slate-700">{release.items?.length || 0}</div>
          </div>
        </div>
        <div className="flex items-start space-x-2 w-1/3 border-l border-slate-100 pl-4">
          <CheckCircle2 className="text-blue-400 mt-0.5 shrink-0" size={14} />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold text-slate-900">Affected Users</div>
            <div className="text-xs font-medium text-slate-700 truncate" title={release.affectedUsers || 'N/A'}>{release.affectedUsers || 'N/A'}</div>
          </div>
        </div>
        <div className="flex items-start space-x-2 w-1/3 border-l border-slate-100 pl-4">
          <FileText className="text-blue-400 mt-0.5 shrink-0" size={14} />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold text-slate-900 truncate">Known Limitations</div>
            <div className="text-xs font-medium text-slate-700 truncate" title={release.limitations || 'None'}>{release.limitations || 'None'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item, status, side }: { item: any, status: string, side: 'left' | 'right' }) {
  let bgClass = 'bg-white border-slate-100';
  let iconIndicator = null;
  
  if (status === 'added' && side === 'right') {
    bgClass = 'bg-emerald-50/50 border-emerald-100';
    iconIndicator = <div className="bg-emerald-500 text-white rounded-full p-0.5 shrink-0"><Plus size={10} /></div>;
  } else if (status === 'removed' && side === 'left') {
    bgClass = 'bg-rose-50/50 border-rose-100';
    iconIndicator = <div className="bg-rose-500 text-white rounded-full p-0.5 shrink-0"><Minus size={10} /></div>;
  } else if (status === 'modified') {
    bgClass = 'bg-amber-50/30 border-amber-200';
    // iconIndicator = <div className="bg-amber-400 w-3 h-3 rounded-sm shrink-0"></div>;
  }

  return (
    <div className={`flex items-center justify-between p-2.5 rounded-lg border ${bgClass} shadow-sm`}>
      <div className="flex items-center space-x-3 overflow-hidden min-w-0 flex-1">
        {iconIndicator && iconIndicator}
        <div className={`p-1.5 rounded-full shrink-0 ${
          item.type === 'feature' ? 'bg-purple-100 text-purple-600' :
          item.type === 'fix' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
        }`}>
          {item.type === 'feature' && <Sparkles size={12} />}
          {item.type === 'fix' && <Wrench size={12} />}
          {item.type === 'behaviour_change' && <ArrowLeftRight size={12} />}
        </div>
        <span className="font-bold text-xs text-slate-900 shrink-0">{item.itemId}</span>
        <span className="text-xs text-slate-600 truncate flex-1">{item.description}</span>
      </div>
      <span className={`shrink-0 ml-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
        item.type === 'feature' ? 'bg-purple-100 text-purple-700' :
        item.type === 'fix' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
      }`}>
        {item.type === 'behaviour_change' ? 'Behaviour' : item.type}
      </span>
    </div>
  );
}

function XIcon() {
  return (
    <div className="bg-rose-500 text-white rounded-sm p-0.5 shrink-0">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </div>
  );
}

// Need React in scope for React.Fragment
import React from 'react';
