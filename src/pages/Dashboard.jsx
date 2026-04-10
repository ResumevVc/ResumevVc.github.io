import { Plus, Database, Trash2, GitBranch } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getRepos, createRepo, deleteRepo } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [repos, setRepos] = useState([]);
  const [newRepoName, setNewRepoName] = useState('');
  const [selectedBaseRepo, setSelectedBaseRepo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { getTokenSilently } = useAuth();

  useEffect(() => {
    fetchRepos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRepos = async () => {
    try {
      const token = await getTokenSilently();
      const data = await getRepos(token);
      setRepos(data);
    } catch(err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRepoName.trim()) return;
    try {
      const token = await getTokenSilently();
      await createRepo(newRepoName, selectedBaseRepo || null, token);
      setNewRepoName('');
      setSelectedBaseRepo('');
      setShowModal(false);
      fetchRepos();
      // Wait for layout sidebar to catch up if we used global state, but simple reload is fine or just navigate
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, repoId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this repository and all its commits?")) return;
    try {
      const token = await getTokenSilently();
      await deleteRepo(repoId, token);
      fetchRepos();
    } catch(err) {
      console.error(err);
    }
  };

  const mainRepos = repos.filter(r => !r.baseRepoId);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b-4 border-retro-black pb-4">
        <h1 className="text-3xl font-mono font-bold tracking-tight">System Dashboard</h1>
        <button onClick={() => setShowModal(true)} className="retro-btn flex items-center">
          <Plus className="w-4 h-4 mr-2" /> New Repo
        </button>
      </div>

      <div className="grid gap-6">
        {repos.map(repo => (
          <div key={repo._id} onClick={() => navigate(`/app/repo/${repo._id}`)} className="retro-card hover:-translate-y-1 hover:-translate-x-1 transition-transform cursor-pointer relative group">
            <button 
              onClick={(e) => handleDelete(e, repo._id)} 
              className="absolute top-4 right-4 text-retro-black hover:text-white hover:bg-retro-red p-2 border-2 border-retro-black transition-colors z-10"
              title="Delete Repository"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex justify-between items-start pr-12">
              <div>
                <h3 className="font-mono text-xl font-bold flex items-center text-retro-red">
                  {repo.baseRepoId ? <GitBranch className="w-5 h-5 mr-2" /> : <Database className="w-5 h-5 mr-2" />}
                  {repo.repoName}
                </h3>
                <p className="text-sm mt-2 text-retro-black font-bold">
                  {repo.baseRepoId ? 'Company Branch Fork' : 'Main Repository Template'}
                </p>
                {repo.baseRepoId && (
                  <p className="text-xs mt-1 font-mono bg-retro-gray inline-block px-1">
                    Inherited from Base ID: {repo.baseRepoId}
                  </p>
                )}
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 bg-retro-black text-white">
                {new Date(repo.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {repos.length === 0 && (
          <div className="text-center font-mono text-retro-black font-bold p-8 border-4 border-dashed border-retro-black">
            No repositories found. Create your first base resume repository.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="retro-card max-w-md w-full bg-white relative border-4 border-retro-black shadow-[8px_8px_0px_0px_rgba(230,57,70,1)]">
            <h2 className="text-2xl font-bold font-mono border-b-4 border-retro-black pb-2 mb-6">Initialize Repository</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block font-mono text-base font-bold mb-2 text-retro-black">Repository Name</label>
                <input 
                  type="text" 
                  className="retro-input py-2 text-base font-bold" 
                  placeholder="e.g., Google-SWE-Application"
                  value={newRepoName}
                  onChange={e => setNewRepoName(e.target.value)}
                  autoFocus
                />
              </div>
              
              {mainRepos.length > 0 && (
                <div className="mb-6">
                  <label className="block font-mono text-base font-bold mb-2 text-retro-black">Fork from Base (Optional)</label>
                  <select 
                    className="retro-input py-2 text-base font-bold bg-white"
                    value={selectedBaseRepo}
                    onChange={e => setSelectedBaseRepo(e.target.value)}
                  >
                    <option value="">-- None (Start Empty Main) --</option>
                    {mainRepos.map(mr => (
                      <option key={mr._id} value={mr._id}>{mr.repoName}</option>
                    ))}
                  </select>
                  <p className="text-xs font-mono mt-2 text-retro-black italic border-l-4 border-retro-red pl-2">
                    Selecting a base repository acting like GitHub branching. It will automatically inherit all data from your main resume!
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-4 border-t-2 border-retro-black pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-mono font-bold bg-white text-retro-black border-2 border-retro-black hover:bg-retro-black hover:text-white transition-colors">Abort</button>
                <button type="submit" className="retro-btn text-base py-2">Create Instance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
