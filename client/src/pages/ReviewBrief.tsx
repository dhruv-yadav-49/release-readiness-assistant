import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

type Statement = {
  _id: string;
  type: string;
  statement: string;
  evidenceReferences: string[];
  reviewStatus: 'pending' | 'approved' | 'rejected';
  isStale: boolean;
};

export default function ReviewBrief() {
  const { id } = useParams();
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/releases/${id}/statements`)
      .then(res => {
        setStatements(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleReview = async (statementId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await axios.put(`http://localhost:5000/api/releases/statements/${statementId}`, {
        reviewStatus: status
      });
      setStatements(statements.map(s => s._id === statementId ? { ...s, reviewStatus: res.data.reviewStatus } : s));
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'technical': 'Technical Summary',
      'stakeholder': 'Stakeholder / Client Brief',
      'risk_limitation': 'Risk & Limitation',
      'missing_info': 'Missing Info Detected',
      'unsupported_claim': 'Unsupported Claim Flagged'
    };
    return labels[type] || type;
  };

  if (loading) return <div className="p-8 text-center">Loading AI analysis...</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow mt-6">
      <h1 className="text-2xl font-bold mb-6">Review Generated Statements</h1>
      
      {statements.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No statements generated.</p>
      ) : (
        <div className="space-y-6">
          {statements.map(st => (
            <div key={st._id} className={`border p-4 rounded-md flex flex-col space-y-3 ${st.isStale ? 'opacity-50' : ''} ${
              st.reviewStatus === 'approved' ? 'border-green-300 bg-green-50' : 
              st.reviewStatus === 'rejected' ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2 ${
                    ['unsupported_claim', 'missing_info'].includes(st.type) ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {getTypeLabel(st.type)}
                  </span>
                  {st.isStale && <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Stale</span>}
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleReview(st._id, 'approved')} 
                    className={`px-3 py-1 rounded text-sm font-medium ${st.reviewStatus === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-green-100 text-gray-800'}`}>
                    Approve
                  </button>
                  <button onClick={() => handleReview(st._id, 'rejected')}
                    className={`px-3 py-1 rounded text-sm font-medium ${st.reviewStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-red-100 text-gray-800'}`}>
                    Reject
                  </button>
                </div>
              </div>
              
              <p className="text-gray-800 text-lg">{st.statement}</p>
              
              {st.evidenceReferences && st.evidenceReferences.length > 0 && (
                <div className="bg-white/50 p-2 rounded text-sm text-gray-600 border border-gray-100">
                  <strong>References:</strong> {st.evidenceReferences.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
