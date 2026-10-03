import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Download, Share, ChevronDown, FileText, Calendar, Box, 
  Users, CheckCircle2, Settings, AlertTriangle, Sparkles, Wrench, ArrowLeftRight,
  Copy, Edit3, Link as LinkIcon, Mail, RotateCcw
} from 'lucide-react';

type Release = {
  _id: string;
  title: string;
  version: string;
  description: string;
  status: string;
  createdAt: string;
  limitations?: string;
  migrationNotes?: string;
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
};

export default function FinalBrief() {
  const { id } = useParams();
  const [release, setRelease] = useState<Release | null>(null);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`http://localhost:5000/api/releases/${id}`),
      axios.get(`http://localhost:5000/api/releases/${id}/final-brief`)
    ]).then(([releaseRes, statementsRes]) => {
      setRelease(releaseRes.data);
      setStatements(statementsRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading final brief...</div>;
  if (!release) return <div className="p-8 text-center text-rose-500 font-medium">Release not found</div>;

  const sections = [
    { type: 'technical', title: 'Technical Summary', desc: 'Key technical changes and improvements included in this release.', theme: 'emerald', icon: Settings },
    { type: 'stakeholder', title: 'Stakeholder Summary', desc: 'Non-technical summary for business stakeholders and end users.', theme: 'blue', icon: Users },
    { type: 'risk_limitation', title: 'Risks & Limitations', desc: 'Known risks, limitations or areas to monitor after this release.', theme: 'amber', icon: AlertTriangle },
    { type: 'missing_info', title: 'Additional Information', desc: 'Important notes, dependencies or missing information.', theme: 'blue', icon: FileText }
  ];

  const totalApproved = statements.length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Link to="/" className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 text-sm font-medium transition-colors">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Final Communication Brief</h1>
          <p className="text-slate-500 mt-1">A concise, stakeholder-ready summary of the release, based on approved statements.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => window.print()} className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm bg-white">
            <Download size={16} />
            <span>Download PDF</span>
          </button>
          <button onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
          }} className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm bg-white">
            <Share size={16} />
            <span>Share</span>
          </button>
          <button onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(release, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", release.title + ".json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
          }} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium text-sm transition-colors shadow-sm">
            <span>Export</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Top Card (Release Info) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
        <div className="flex items-start space-x-4 mb-6">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl shrink-0">
            <FileText size={28} />
          </div>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h2 className="text-xl font-bold text-slate-900">{release.version}</h2>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Approved</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{release.title}</h3>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">{release.description}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-6 pt-5 border-t border-slate-100">
          <div className="flex items-center space-x-3">
            <Calendar className="text-slate-400" size={18} />
            <div>
              <div className="text-xs font-bold text-slate-900">Release Date</div>
              <div className="text-xs text-slate-500">{new Date(release.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Box className="text-blue-400" size={18} />
            <div>
              <div className="text-xs font-bold text-slate-900">Total Items</div>
              <div className="text-xs text-slate-500">{release.items?.length || 0}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="text-indigo-400" size={18} />
            <div>
              <div className="text-xs font-bold text-slate-900">Affected Users</div>
              <div className="text-xs text-slate-500 truncate max-w-[150px]" title={release.affectedUsers || 'N/A'}>{release.affectedUsers || 'N/A'}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FileText className="text-blue-400" size={18} />
            <div>
              <div className="text-xs font-bold text-slate-900">Prepared On</div>
              <div className="text-xs text-slate-500">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit' })}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-[10px] flex items-center justify-center font-bold">DU</div>
            <div>
              <div className="text-xs font-bold text-slate-900">Prepared By</div>
              <div className="text-xs text-slate-500">Dhruv Yadav</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column (Brief Content) */}
        <div className="flex-1 space-y-6">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button className="flex items-center space-x-2 px-4 py-3 border-b-2 border-blue-600 text-blue-700 font-bold text-sm bg-blue-50/50">
              <FileText size={16} />
              <span>Final Brief</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-3 border-b-2 border-transparent text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors">
              <Users size={16} />
              <span>Release Items <span className="bg-slate-100 px-2 py-0.5 rounded-full ml-1 text-xs">{release.items?.length || 0}</span></span>
            </button>
            <Link to="/history" className="flex items-center space-x-2 px-4 py-3 border-b-2 border-transparent text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors">
              <RotateCcw size={16} />
              <span>Version History</span>
            </Link>
          </div>

          {/* Statement Sections */}
          <div className="space-y-6">
            {totalApproved === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">
                <p className="text-lg font-medium text-slate-900 mb-1">No approved statements</p>
                <p>Please go back to Review Brief and approve statements to include them here.</p>
                <Link to={`/review/${id}`} className="mt-4 inline-block text-blue-600 font-semibold hover:underline">Go to Review Brief &rarr;</Link>
              </div>
            ) : (
              sections.map((section) => {
                const sectionStatements = statements.filter(s => s.type === section.type || (section.type === 'missing_info' && s.type === 'unsupported_claim'));
                if (sectionStatements.length === 0) return null;

                const bgHeader = section.theme === 'emerald' ? 'bg-emerald-50' : section.theme === 'amber' ? 'bg-amber-50' : 'bg-blue-50';
                const textTitle = section.theme === 'emerald' ? 'text-emerald-900' : section.theme === 'amber' ? 'text-amber-900' : 'text-blue-900';
                const textDesc = section.theme === 'emerald' ? 'text-emerald-700/80' : section.theme === 'amber' ? 'text-amber-700/80' : 'text-blue-700/80';
                const iconColor = section.theme === 'emerald' ? 'text-emerald-600' : section.theme === 'amber' ? 'text-amber-600' : 'text-blue-600';
                const badgeBg = section.theme === 'emerald' ? 'bg-emerald-200 text-emerald-800' : section.theme === 'amber' ? 'bg-amber-200 text-amber-800' : 'bg-blue-200 text-blue-800';
                const numberBg = section.theme === 'emerald' ? 'bg-emerald-600' : section.theme === 'amber' ? 'bg-amber-500' : 'bg-blue-600';

                return (
                  <div key={section.type} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className={`${bgHeader} p-5 flex items-start space-x-3 border-b border-slate-100`}>
                      <div className={`mt-0.5 ${iconColor}`}><section.icon size={24} /></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className={`font-bold text-lg ${textTitle}`}>{section.title}</h3>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeBg}`}>
                            {sectionStatements.length} statement{sectionStatements.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className={`text-sm ${textDesc}`}>{section.desc}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      {sectionStatements.map((st, i) => (
                        <div key={st._id} className="flex items-start space-x-4 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${numberBg}`}>
                            {i + 1}
                          </div>
                          <p className="text-sm text-slate-800 leading-relaxed flex-1 pt-0.5">
                            {st.statement}
                          </p>
                          <div className="flex flex-col items-end space-y-2 shrink-0 border-l border-slate-100 pl-4">
                            <div className="text-right">
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Related Items</div>
                              <div className="flex flex-wrap justify-end gap-1">
                                {st.evidenceReferences?.length > 0 ? st.evidenceReferences.map((ref: string) => (
                                  <span key={ref} className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold">{ref}</span>
                                )) : <span className="bg-slate-50 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold">-</span>}
                              </div>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600 p-1" title="Copy statement">
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          
          {/* Release Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Release Progress</h3>
            <div className="flex items-start space-x-3 mb-4">
              <div className="bg-emerald-100 text-emerald-600 rounded-full p-1.5 shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-700">Ready for Communication</h4>
                <p className="text-xs text-slate-500 mt-1">This brief includes {totalApproved} approved statements.</p>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-emerald-500 w-full rounded-full"></div>
            </div>
            <div className="text-right text-xs font-bold text-emerald-700">{totalApproved} / {totalApproved}</div>
          </div>

          {/* Release Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Release Details</h3>
              <button className="text-xs font-bold text-blue-600 flex items-center space-x-1 hover:underline">
                <Edit3 size={12} />
                <span>Edit Release</span>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Version</span>
                <span className="col-span-2 font-medium text-slate-900">{release.version}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Title</span>
                <span className="col-span-2 font-medium text-slate-900">{release.title}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-slate-500">Status</span>
                <span className="col-span-2"><span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">approved</span></span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Release Date</span>
                <span className="col-span-2 font-medium text-slate-900">{new Date(release.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Total Items</span>
                <span className="col-span-2 font-medium text-slate-900">{release.items?.length || 0}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Affected Users</span>
                <span className="col-span-2 font-medium text-slate-900">{release.affectedUsers || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Known Limitations</span>
                <span className="col-span-2 font-medium text-slate-900">{release.limitations || 'None'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Migration Notes</span>
                <span className="col-span-2 font-medium text-slate-900">{release.migrationNotes || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Included Items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Included Items</h3>
              <button className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors">
                View All Items
              </button>
            </div>
            <div className="space-y-4">
              {release.items?.slice(0, 5).map(item => (
                <div key={item.itemId} className="flex items-start space-x-3">
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    item.type === 'feature' ? 'bg-purple-100 text-purple-600' :
                    item.type === 'fix' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {item.type === 'feature' && <Sparkles size={14} />}
                    {item.type === 'fix' && <Wrench size={14} />}
                    {item.type === 'behaviour_change' && <ArrowLeftRight size={14} />}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 leading-tight">{item.itemId}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                  </div>
                </div>
              ))}
              {release.items?.length > 5 && (
                <div className="text-center pt-2">
                  <span className="text-xs text-slate-500">+{release.items.length - 5} more items</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button onClick={() => window.print()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-sm">
                <Download size={16} />
                <span>Download PDF</span>
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }} className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition-colors">
                  <LinkIcon size={14} />
                  <span>Copy Share Link</span>
                </button>
                <button onClick={() => {
                  window.location.href = `mailto:?subject=${encodeURIComponent(release.title + ' - Release Brief')}&body=${encodeURIComponent('Please review the release brief here: ' + window.location.href)}`;
                }} className="border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition-colors">
                  <Mail size={14} />
                  <span>Send via Email</span>
                </button>
              </div>
              <button className="w-full border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 font-medium text-sm py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-colors mt-2">
                <RotateCcw size={16} />
                <span>Regenerate Brief</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
