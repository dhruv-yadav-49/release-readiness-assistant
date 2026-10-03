import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [releases, setReleases] = useState<any[]>([]);

  useEffect(() => {
    // axios.get('http://localhost:5000/api/releases').then(res => setReleases(res.data));
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Releases</h1>
        <Link to="/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          New Release
        </Link>
      </div>
      
      {releases.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No releases found. Create one to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {releases.map(release => (
            <div key={release._id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{release.title} - v{release.version}</h3>
                <span className="text-sm text-gray-500">Status: {release.status}</span>
              </div>
              <Link to={`/review/${release._id}`} className="text-blue-600 hover:underline">
                Review & Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
