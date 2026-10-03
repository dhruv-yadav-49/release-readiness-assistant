import { useParams } from 'react-router-dom';

export default function VersionHistory() {
  const { id } = useParams();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Version History (ID: {id})</h1>
      <p className="text-gray-500">History and stale statement detection will appear here.</p>
    </div>
  );
}
