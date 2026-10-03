import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, FileText, Calendar, Box, Users, AlertTriangle, Search, CheckCircle2,
  Wrench, Sparkles, Users2, ShieldBan, Edit3, ChevronDown, RotateCcw, ArrowLeftRight
} from 'lucide-react';

type Release = {
  _id: string;
  title: string;
  version: string;
  description: string;
  status: string;
  analysisStatus: string;
  createdAt: string;
  limitations?: string;
  affectedUsers?: string;
  items: Array<{
    itemId: string;
    type: string;
    description: string;
  }>;
};

type Statement = {
  _id: string;
  type: string;
  statement: string;
  evidenceReferences: string[];
  reviewStatus: 'pending' | 'approved' | 'rejected';
  isStale: boolean;
  updatedAt?: string;
};

export default function ReviewBrief() {
  const { id } = useParams();
  const [release, setRelease] = useState<Release | null>(null);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [releaseRes, statementsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/releases/${id}`),
        axios.get(`http://localhost:5000/api/releases/${id}/statements`)
      ]);
      setRelease(releaseRes.data);
      setStatements(statementsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (statementId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await axios.put(`http://localhost:5000/api/releases/statements/${statementId}`, {
        reviewStatus: status
      });
      setStatements(statements.map(s => s._id === statementId ? { ...s, reviewStatus: res.data.reviewStatus, updatedAt: res.data.updatedAt } : s));
    } catch (err) {
      console.error(err);
      alert('Failed to update review status');
    }
  };

  const saveEdit = async (statementId: string) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/releases/statements/${statementId}`, {
        statement: editContent
      });
      setStatements(statements.map(s => s._id === statementId ? { ...s, statement: res.data.statement } : s));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update statement');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading AI analysis...</div>;
  if (!release) return <div className="p-8 text-center text-rose-500 font-medium">Release not found</div>;

  // Stats
  const approved = statements.filter(s => s.reviewStatus === 'approved').length;
  const rejected = statements.filter(s => s.reviewStatus === 'rejected').length;
  const pending = statements.filter(s => s.reviewStatus === 'pending').length;
  const total = statements.length;
  const reviewedPercent = total > 0 ? Math.round(((approved + rejected) / total) * 100) : 0;

  const countsByType = {
    technical: statements.filter(s => s.type === 'technical').length,
    stakeholder: statements.filter(s => s.type === 'stakeholder').length,
    risk_limitation: statements.filter(s => s.type === 'risk_limitation').length,
    missing_info: statements.filter(s => s.type === 'missing_info').length,
    unsupported_claim: statements.filter(s => s.type === 'unsupported_claim').length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Link to="/" className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 text-sm font-medium transition-colors">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Review Release Brief</h1>
        <p className="text-slate-500 mt-1">Review, edit, approve or reject AI-generated statements. Only approved statements will be included in the final communication brief.</p>
      </div>

      {/* Top Card (Release Info) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 flex flex-col lg:flex-row justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-start space-x-4 mb-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h2 className="text-xl font-bold text-slate-900">{release.version}</h2>
                <span className="bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Reviewing</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{release.title}</h3>
              <p className="text-sm text-slate-600 max-w-2xl">{release.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-start space-x-2">
              <Calendar className="text-slate-400 mt-0.5" size={16} />
              <div>
                <div className="text-xs font-bold text-slate-900">Release Date</div>
                <div className="text-xs text-slate-500">{new Date(release.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Box className="text-blue-400 mt-0.5" size={16} />
              <div>
                <div className="text-xs font-bold text-slate-900">Total Items</div>
                <div className="text-xs text-slate-500">{release.items?.length || 0}</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Users className="text-emerald-400 mt-0.5" size={16} />
              <div>
                <div className="text-xs font-bold text-slate-900">Affected Users</div>
                <div className="text-xs text-slate-500 truncate max-w-[120px]" title={release.affectedUsers || 'N/A'}>{release.affectedUsers || 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertTriangle className="text-amber-400 mt-0.5" size={16} />
              <div>
                <div className="text-xs font-bold text-slate-900">Known Limitations</div>
                <div className="text-xs text-slate-500 truncate max-w-[120px]" title={release.limitations || 'None'}>{release.limitations || 'None'}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end justify-between border-l border-slate-100 pl-6">
          <div className="flex items-center space-x-2 mb-6">
            <Link to={`/final-brief/${id}`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2">
              <span>View Final Brief</span>
              <ArrowLeft size={16} className="rotate-180" />
            </Link>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
              <div className="w-1 h-1 bg-current rounded-full mx-auto mb-1"></div>
              <div className="w-1 h-1 bg-current rounded-full mx-auto mb-1"></div>
              <div className="w-1 h-1 bg-current rounded-full mx-auto"></div>
            </button>
          </div>
          
          <div className="bg-emerald-50 rounded-xl p-4 flex items-start space-x-3 border border-emerald-100 w-full min-w-[240px]">
            <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-emerald-900 text-sm">AI Analysis Completed</h4>
              <p className="text-xs text-emerald-700/80 mb-1">Generated {total} statements</p>
              <p className="text-[10px] text-emerald-600">Completed on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column (Statement List) */}
        <div className="flex-1 space-y-4">
          
          {/* Filters Bar */}
          <div className="flex overflow-x-auto pb-2 space-x-2 hide-scrollbar">
            <FilterTab active label="All Statements" count={total} />
            <FilterTab icon={<Wrench size={14}/>} label="Technical" count={countsByType.technical} />
            <FilterTab icon={<Users2 size={14}/>} label="Stakeholder" count={countsByType.stakeholder} />
            <FilterTab icon={<AlertTriangle size={14}/>} label="Risk & Limitations" count={countsByType.risk_limitation} />
            <FilterTab icon={<FileText size={14}/>} label="Missing Info" count={countsByType.missing_info} />
            <FilterTab icon={<ShieldBan size={14}/>} label="Unsupported Claims" count={countsByType.unsupported_claim} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 py-2 border-b border-slate-200 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search statements..." className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none">
              <option>All Types</option>
            </select>
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none">
              <option>All Statuses</option>
            </select>
            <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none">
              <option>All Items</option>
            </select>
            <button className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1 whitespace-nowrap px-2">
              <RotateCcw size={14} />
              <span>Clear Filters</span>
            </button>
          </div>

          {/* Statements List */}
          <div className="space-y-4">
            {statements.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">No statements generated.</div>
            ) : (
              statements.map((st) => (
                <StatementCard 
                  key={st._id} 
                  statement={st} 
                  onApprove={() => handleReview(st._id, 'approved')}
                  onReject={() => handleReview(st._id, 'rejected')}
                  isEditing={editingId === st._id}
                  editContent={editContent}
                  onEditStart={() => { setEditingId(st._id); setEditContent(st.statement); }}
                  onEditChange={setEditContent}
                  onEditCancel={() => setEditingId(null)}
                  onEditSave={() => saveEdit(st._id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          
          {/* Review Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-6">Review Progress</h3>
            
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  {reviewedPercent > 0 && (
                    <path className="text-emerald-500" strokeDasharray={`${reviewedPercent}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  )}
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-900">{approved + rejected}/{total}</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm font-semibold text-slate-700 text-center mb-6">Statements Reviewed <br /><span className="text-xl">{reviewedPercent}%</span></p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-slate-600">Approved</span></div>
                <span className="font-bold text-slate-900">{approved}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div><span className="text-slate-600">Pending</span></div>
                <span className="font-bold text-slate-900">{pending}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div><span className="text-slate-600">Rejected</span></div>
                <span className="font-bold text-slate-900">{rejected}</span>
              </div>
            </div>
          </div>

          {/* Statements by Type */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Statements by Type</h3>
            <div className="space-y-3">
              <TypeCount icon={<Wrench size={16}/>} label="Technical" count={countsByType.technical} color="text-blue-600" />
              <TypeCount icon={<Users2 size={16}/>} label="Stakeholder" count={countsByType.stakeholder} color="text-indigo-600" />
              <TypeCount icon={<AlertTriangle size={16}/>} label="Risk & Limitation" count={countsByType.risk_limitation} color="text-amber-600" />
              <TypeCount icon={<FileText size={16}/>} label="Missing Info" count={countsByType.missing_info} color="text-slate-600" />
              <TypeCount icon={<ShieldBan size={16}/>} label="Unsupported Claim" count={countsByType.unsupported_claim} color="text-rose-600" />
            </div>
          </div>

          {/* Release Items Reference */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Release Items Reference</h3>
            <div className="space-y-4">
              {release.items?.map(item => (
                <div key={item.itemId} className="flex items-start space-x-3">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    item.type === 'feature' ? 'bg-purple-100 text-purple-600' :
                    item.type === 'fix' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {item.type === 'feature' && <Sparkles size={14} />}
                    {item.type === 'fix' && <Wrench size={14} />}
                    {item.type === 'behaviour_change' && <ArrowLeftRight size={14} />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 leading-tight">{item.itemId}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Step */}
          <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center space-x-2 text-purple-700 mb-3">
              <Sparkles size={20} />
              <h3 className="font-bold text-lg">Next Step</h3>
            </div>
            <p className="text-xs text-purple-900/70 mb-5 leading-relaxed">
              Once you have reviewed and approved all necessary statements, you can generate the final communication brief.
            </p>
            <Link to={`/final-brief/${id}`} className="w-full bg-blue-600 text-white font-semibold text-sm py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors">
              <span>Generate Final Brief</span>
              <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

// Subcomponents

function FilterTab({ active, icon, label, count }: { active?: boolean, icon?: React.ReactNode, label: string, count: number }) {
  return (
    <button className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg border-b-2 whitespace-nowrap transition-colors ${
      active ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
    }`}>
      {icon}
      <span className="text-sm font-bold">{label}</span>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-blue-100' : 'bg-slate-100'}`}>{count}</span>
    </button>
  );
}

function TypeCount({ icon, label, count, color }: { icon: React.ReactNode, label: string, count: number, color: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <div className={`flex items-center space-x-2 ${color}`}>
        {icon}
        <span className="text-slate-700 font-medium">{label}</span>
      </div>
      <span className="font-bold text-slate-900">{count}</span>
    </div>
  );
}

function StatementCard({ 
  statement, onApprove, onReject, isEditing, editContent, onEditStart, onEditChange, onEditCancel, onEditSave
}: any) {
  
  let typeConfig = { icon: <FileText size={20} />, label: statement.type, color: 'text-slate-600 bg-slate-100' };
  switch (statement.type) {
    case 'technical': typeConfig = { icon: <Wrench size={20} />, label: 'Technical', color: 'text-blue-600 bg-blue-50' }; break;
    case 'stakeholder': typeConfig = { icon: <Users2 size={20} />, label: 'Stakeholder', color: 'text-indigo-600 bg-indigo-50' }; break;
    case 'risk_limitation': typeConfig = { icon: <AlertTriangle size={20} />, label: 'Risk & Limitation', color: 'text-amber-600 bg-amber-50' }; break;
    case 'missing_info': typeConfig = { icon: <FileText size={20} />, label: 'Missing Info', color: 'text-slate-600 bg-slate-50' }; break;
    case 'unsupported_claim': typeConfig = { icon: <ShieldBan size={20} />, label: 'Unsupported Claim', color: 'text-rose-600 bg-rose-50' }; break;
  }

  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm transition-colors ${
      statement.reviewStatus === 'approved' ? 'border-emerald-200' : 
      statement.reviewStatus === 'rejected' ? 'border-rose-200' : 'border-slate-200'
    }`}>
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm mb-2">
            <Edit3 size={16} />
            <span>Edit Statement</span>
          </div>
          <textarea 
            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            value={editContent}
            onChange={(e) => onEditChange(e.target.value)}
          />
          <div className="flex justify-end space-x-3">
            <button onClick={onEditCancel} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
            <button onClick={onEditSave} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Update</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-5">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${typeConfig.color}`}>
            {typeConfig.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <span className="font-bold text-slate-900 text-sm">{typeConfig.label}</span>
              {statement.reviewStatus === 'approved' && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Approved</span>}
              {statement.reviewStatus === 'pending' && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Pending</span>}
              {statement.reviewStatus === 'rejected' && <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Rejected</span>}
              {statement.isStale && <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Stale</span>}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed pr-4">{statement.statement}</p>
          </div>

          {/* References & Actions */}
          <div className="w-full md:w-auto flex flex-row md:flex-col justify-between md:items-end gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4 shrink-0">
            <div className="text-left md:text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Item References</div>
              <div className="flex flex-wrap md:justify-end gap-1">
                {statement.evidenceReferences?.length > 0 ? statement.evidenceReferences.map((ref: string) => (
                  <span key={ref} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-semibold">{ref}</span>
                )) : <span className="text-slate-400 text-xs">-</span>}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {statement.reviewStatus === 'pending' ? (
                <>
                  <button onClick={onEditStart} className="flex items-center space-x-1 border border-slate-300 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>
                  <button onClick={onApprove} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
                    Approve
                  </button>
                  <button onClick={onReject} className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
                    Reject
                  </button>
                  <button className="text-slate-400 hover:text-slate-600 p-1"><ChevronDown size={18} /></button>
                </>
              ) : (
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 mb-1">
                    {statement.updatedAt ? new Date(statement.updatedAt).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : 'Today'}
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-slate-400 text-white text-[10px] flex items-center justify-center font-bold">DU</div>
                    <span className="text-xs font-semibold text-slate-600">
                      {statement.reviewStatus === 'approved' ? 'Approved' : 'Rejected'} by Dhruv
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
