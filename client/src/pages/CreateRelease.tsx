import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

type ReleaseItem = {
  type: 'feature' | 'fix' | 'behaviour_change';
  description: string;
  qaEvidence: string;
  userImpact: string;
};

export default function CreateRelease() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    version: '',
    title: '',
    limitations: '',
    migrationNotes: '',
    affectedUsers: '',
  });
  
  const [items, setItems] = useState<ReleaseItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { type: 'feature', description: '', qaEvidence: '', userImpact: '' }]);
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
      const res = await axios.post('http://localhost:5000/api/releases', payload);
      navigate(`/review/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert('Error creating release');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow mt-6">
      <h1 className="text-2xl font-bold mb-6">Create Release Package</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Version</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required
              value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} placeholder="e.g. 1.2.0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Spring Update" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Release Items (Features, Fixes, etc.)</h2>
            <button type="button" onClick={handleAddItem} className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300">
              + Add Item
            </button>
          </div>
          
          {items.map((item, index) => (
            <div key={index} className="border p-4 rounded-md space-y-3 bg-gray-50">
              <div className="flex justify-between">
                <h3 className="font-medium">Item {index + 1}</h3>
                <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-red-500 text-sm hover:underline">Remove</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={item.type} onChange={e => handleItemChange(index, 'type', e.target.value)}>
                    <option value="feature">Feature</option>
                    <option value="fix">Bug Fix</option>
                    <option value="behaviour_change">Behaviour Change</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Impact</label>
                  <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={item.userImpact} onChange={e => handleItemChange(index, 'userImpact', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={2} required
                  value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">QA Evidence (Test results, etc.)</label>
                <textarea className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={2}
                  value={item.qaEvidence} onChange={e => handleItemChange(index, 'qaEvidence', e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Known Limitations & Risks</label>
            <textarea className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3}
              value={formData.limitations} onChange={e => setFormData({...formData, limitations: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Migration / Config Notes</label>
            <textarea className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3}
              value={formData.migrationNotes} onChange={e => setFormData({...formData, migrationNotes: e.target.value})} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Analyzing with AI...' : 'Generate AI Brief'}
        </button>
      </form>
    </div>
  );
}
