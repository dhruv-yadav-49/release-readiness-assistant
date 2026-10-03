import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Plus, Sparkles, Wrench, ArrowLeftRight, Trash2, 
  Eye, FileText, Users, AlertTriangle, Settings, ChevronRight 
} from 'lucide-react';

type ReleaseItem = {
  itemId: string;
  type: 'feature' | 'fix' | 'behaviour_change';
  description: string;
  qaEvidence: string;
  userImpact: string;
};

export default function CreateRelease() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('sourceId');

  const [formData, setFormData] = useState({
    version: '',
    title: '',
    description: '',
    limitations: '',
    migrationNotes: '',
    affectedUsers: '',
  });
  
  const [items, setItems] = useState<ReleaseItem[]>([
    { itemId: 'FEAT-001', type: 'feature', description: '', qaEvidence: '', userImpact: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!!sourceId);

  useEffect(() => {
    if (sourceId) {
      axios.get(`http://localhost:5000/api/releases/${sourceId}`)
        .then(res => {
          const data = res.data;
          setFormData({
            title: data.title,
            version: (data.version.startsWith('v') ? data.version : `v${data.version}`) + '-new',
            description: data.description,
            limitations: data.limitations || '',
            migrationNotes: data.migrationNotes || '',
            affectedUsers: data.affectedUsers || '',
          });
          setItems(data.items.map((i: any) => ({
            itemId: i.itemId,
            type: i.type,
            description: i.description,
            qaEvidence: i.qaEvidence || '',
            userImpact: i.userImpact || ''
          })));
          setIsInitializing(false);
        })
        .catch(err => {
          console.error(err);
          setIsInitializing(false);
        });
    }
  }, [sourceId]);

  const handleAddItem = () => {
    setItems([...items, { 
      itemId: `ITEM-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, 
      type: 'feature', description: '', qaEvidence: '', userImpact: '' 
    }]);
  };

  const handleItemChange = (index: number, field: keyof ReleaseItem, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value as any;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, items };
      let res;
      if (sourceId) {
        res = await axios.post(`http://localhost:5000/api/releases/${sourceId}/new-version`, payload);
      } else {
        res = await axios.post('http://localhost:5000/api/releases', payload);
      }
      navigate(`/review/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert('Error creating release');
    } finally {
      setLoading(false);
    }
  };

  // Derived Summary Data
  const featuresCount = items.filter(i => i.type === 'feature').length;
  const fixesCount = items.filter(i => i.type === 'fix').length;
  const behavioursCount = items.filter(i => i.type === 'behaviour_change').length;

  if (isInitializing) return <div className="p-8 text-center text-slate-500 font-medium">Initializing form from previous version...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Create New Release</h1>
          <p className="text-slate-500 mt-2">Provide release details and supporting information. AI will analyze this data and generate communication briefs.</p>
        </div>
        <Link to="/" className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 font-medium transition-colors border border-blue-200">
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Stepper (Mock UI as per design) */}
      <div className="flex items-center justify-between w-full max-w-4xl mb-10 text-sm font-medium">
        <div className="flex items-center space-x-3 text-blue-600">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">1</div>
          <span>Basic Information</span>
        </div>
        <div className="flex-1 border-t border-slate-300 mx-4"></div>
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">2</div>
          <span>Release Items</span>
        </div>
        <div className="flex-1 border-t border-slate-300 mx-4"></div>
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">3</div>
          <span>Additional Details</span>
        </div>
        <div className="flex-1 border-t border-slate-300 mx-4"></div>
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">4</div>
          <span>Review & Submit</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column (Form) */}
        <div className="flex-1 w-full max-w-4xl space-y-8">
          <form id="releaseForm" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Basic Info */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm font-bold shrink-0">1</div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Basic Information</h2>
                  <p className="text-sm text-slate-500">Enter the core details about this release.</p>
                </div>
              </div>
              <div className="space-y-5 pl-14">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Release Title <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" required
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Payment & Login Improvements" />
                    <p className="text-xs text-slate-500 mt-1.5">A clear and concise title for this release</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Version <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" required
                      value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} placeholder="e.g. v1.2.0" />
                    <p className="text-xs text-slate-500 mt-1.5">e.g., v1.2.0, 2.0.0</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Release Description</label>
                  <textarea className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow min-h-[100px]"
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief overview of what this release includes..." />
                </div>
              </div>
            </section>

            {/* Section 2: Release Items */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg shadow-sm font-bold shrink-0">2</div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Release Items</h2>
                    <p className="text-sm text-slate-500 mt-1">Add the features, bug fixes, and behaviour changes included in this release.</p>
                  </div>
                </div>
                <button type="button" onClick={handleAddItem} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-sm font-medium hover:bg-blue-700 transition-colors shrink-0">
                  <Plus size={18} />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-6 pl-14">
                {items.map((item, index) => (
                  <div key={index} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:border-slate-300 transition-colors">
                    {/* Item Header */}
                    <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          item.type === 'feature' ? 'bg-purple-100 text-purple-600' :
                          item.type === 'fix' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {item.type === 'feature' && <Sparkles size={18} />}
                          {item.type === 'fix' && <Wrench size={18} />}
                          {item.type === 'behaviour_change' && <ArrowLeftRight size={18} />}
                        </div>
                        <select className="bg-white border border-slate-300 rounded-md py-1.5 px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={item.type} onChange={e => handleItemChange(index, 'type', e.target.value)}>
                          <option value="feature">Feature</option>
                          <option value="fix">Bug Fix</option>
                          <option value="behaviour_change">Behaviour Change</option>
                        </select>
                      </div>
                      {items.length > 1 && (
                        <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-slate-400 hover:text-rose-500 transition-colors p-2">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    {/* Item Body */}
                    <div className="p-5 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div className="md:col-span-1">
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item ID <span className="text-red-500">*</span></label>
                          <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required
                            value={item.itemId} onChange={e => handleItemChange(index, 'itemId', e.target.value)} />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">User Impact</label>
                          <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={item.userImpact} onChange={e => handleItemChange(index, 'userImpact', e.target.value)} placeholder="How does this affect users?" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                        <textarea className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" required
                          value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} placeholder="Detailed description of the change..." />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">QA Evidence</label>
                        <textarea className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                          value={item.qaEvidence} onChange={e => handleItemChange(index, 'qaEvidence', e.target.value)} placeholder="Test cases, results, etc." />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 3: Additional Details */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center text-lg shadow-sm font-bold shrink-0">3</div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Additional Details</h2>
                  <p className="text-sm text-slate-500 mt-1">Provide supplementary information about this release.</p>
                </div>
              </div>
              <div className="space-y-5 pl-14">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Known Limitations</label>
                    <textarea className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      value={formData.limitations} onChange={e => setFormData({...formData, limitations: e.target.value})} placeholder="Any pending issues or known bugs?" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Migration / Configuration Notes</label>
                    <textarea className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      value={formData.migrationNotes} onChange={e => setFormData({...formData, migrationNotes: e.target.value})} placeholder="e.g. database migration required" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Affected User Groups</label>
                  <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.affectedUsers} onChange={e => setFormData({...formData, affectedUsers: e.target.value})} placeholder="e.g. New users and existing users logging in." />
                </div>
              </div>
            </section>

          </form>

          {/* Bottom Bar Actions */}
          <div className="flex items-center justify-between pt-4 pb-12">
            <button type="button" onClick={() => navigate('/')} className="px-6 py-3 border border-slate-300 bg-white text-slate-700 font-medium rounded-lg hover:bg-slate-50 flex items-center space-x-2 shadow-sm transition-colors">
              <ArrowLeft size={18} />
              <span>Cancel</span>
            </button>
            <div className="flex space-x-4">
              <button type="button" className="px-6 py-3 border border-slate-300 bg-white text-slate-700 font-medium rounded-lg hover:bg-slate-50 shadow-sm transition-colors">
                Save as Draft
              </button>
              <button form="releaseForm" type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed">
                <span>{loading ? 'Analyzing...' : 'Next: Review & Submit'}</span>
                {!loading && <ChevronRight size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Preview / Summary Sidebar) */}
        <div className="w-full lg:w-96 space-y-6">
          
          {/* Release Summary Preview */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 mb-4 text-blue-600">
              <Eye size={20} />
              <h3 className="font-bold text-lg text-slate-900">Release Summary Preview</h3>
            </div>
            <p className="text-sm text-slate-500 mb-6">Quick preview of the information you've entered.</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-900 text-lg leading-tight pr-4 break-words">
                  {formData.title || 'Untitled Release'}
                </h4>
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold uppercase shrink-0">Draft</span>
              </div>
              <div className="flex items-center text-sm font-medium text-slate-600 space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>{formData.version || 'vX.X.X'}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed border-b border-slate-100 pb-4">
                {formData.description || 'No description provided yet.'}
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600 shrink-0"><FileText size={16} /></div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Total Items</h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {featuresCount > 0 && `${featuresCount} Feature${featuresCount > 1 ? 's' : ''}, `}
                      {fixesCount > 0 && `${fixesCount} Fix${fixesCount > 1 ? 'es' : ''}, `}
                      {behavioursCount > 0 && `${behavioursCount} Behaviour Change${behavioursCount > 1 ? 's' : ''}`}
                      {featuresCount === 0 && fixesCount === 0 && behavioursCount === 0 && '0 Items'}
                    </p>
                  </div>
                </div>

                {formData.affectedUsers && (
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600 shrink-0"><Users size={16} /></div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">Affected Users</h5>
                      <p className="text-xs text-slate-500 mt-0.5">{formData.affectedUsers}</p>
                    </div>
                  </div>
                )}

                {formData.limitations && (
                  <div className="flex items-start space-x-3">
                    <div className="bg-amber-50 p-2 rounded-lg text-amber-600 shrink-0"><AlertTriangle size={16} /></div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">Known Limitations</h5>
                      <p className="text-xs text-slate-500 mt-0.5">{formData.limitations}</p>
                    </div>
                  </div>
                )}

                {formData.migrationNotes && (
                  <div className="flex items-start space-x-3">
                    <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 shrink-0"><Settings size={16} /></div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">Migration Notes</h5>
                      <p className="text-xs text-slate-500 mt-0.5">{formData.migrationNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Release Items Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 mb-4 text-blue-600">
              <FileText size={20} />
              <h3 className="font-bold text-lg text-slate-900">Release Items Summary</h3>
            </div>
            <p className="text-sm text-slate-500 mb-5">Overview of all items in this release.</p>
            
            <div className="space-y-3">
              {items.map((item, i) => {
                const isComplete = item.itemId && item.description;
                return (
                  <div key={i} className="flex items-start space-x-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      item.type === 'feature' ? 'bg-purple-100 text-purple-600' :
                      item.type === 'fix' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {item.type === 'feature' && <Sparkles size={14} />}
                      {item.type === 'fix' && <Wrench size={14} />}
                      {item.type === 'behaviour_change' && <ArrowLeftRight size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{item.itemId || 'Untitled'}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            item.type === 'feature' ? 'bg-purple-100 text-purple-700' :
                            item.type === 'fix' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.type === 'behaviour_change' ? 'Behaviour' : item.type}
                          </span>
                        </div>
                        {isComplete && (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center shrink-0">
                            Complete
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">{item.description || 'No description'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* What happens next? */}
          <div className="bg-purple-50 p-6 rounded-2xl shadow-sm border border-purple-100">
            <div className="flex items-center space-x-3 mb-4 text-purple-700">
              <Sparkles size={20} />
              <h3 className="font-bold text-lg">What happens next?</h3>
            </div>
            <ul className="space-y-4 text-sm text-purple-900/80">
              <li className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                <span>We'll validate your input and check for required information.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                <div>
                  <span className="block mb-1">AI will analyze your release package and generate:</span>
                  <ul className="list-disc pl-4 space-y-1 text-purple-800/70 text-xs">
                    <li>Technical summary statements</li>
                    <li>Stakeholder communication points</li>
                    <li>Risk and limitation notes</li>
                    <li>Missing information alerts (if any)</li>
                  </ul>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                <span>You'll be able to review, edit, approve or reject each statement.</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</span>
                <span>Generate a final communication brief once all required statements are approved.</span>
              </li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>
  );
}
