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

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b-4 border-retro-black pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight bg-gradient-to-r from-retro-black to-retro-red bg-clip-text text-transparent">System Dashboard</h1>
          <p className="text-sm font-mono text-retro-gray mt-1">Manage your resume repositories and branches</p>
        </div>
        <button onClick={() => setShowModal(true)} className="retro-btn flex items-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-[6px_6px_0px_0px_rgba(230,57,70,1)]">
          <Plus className="w-5 h-5 mr-2" /> New Repo
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-2">
        {repos.map(repo => (
          <div key={repo._id} onClick={() => navigate(`/app/repo/${repo._id}`)} className="retro-card cursor-pointer relative group flex items-center justify-between">
            <button 
              onClick={(e) => handleDelete(e, repo._id)} 
              className="absolute top-4 right-4 text-retro-black hover:text-white hover:bg-retro-red p-2 border-2 border-retro-black transition-colors z-10 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
              title="Delete Repository"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 pr-12">
              <div className="p-3 border-2 border-retro-black bg-retro-black text-white shadow-[4px_4px_0px_0px_rgba(230,57,70,1)]">
                {repo.baseRepoId ? <GitBranch className="w-6 h-6" /> : <Database className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-mono text-xl font-bold text-retro-red">
                  {repo.repoName}
                </h3>
                <p className="text-sm text-retro-black font-bold">
                  {repo.baseRepoId ? 'Company Branch Fork' : 'Main Repository Template'}
                </p>
                {repo.baseRepoId && (
                  <p className="text-xs mt-1 font-mono bg-retro-gray inline-block px-2 py-1">
                    Inherited from Base ID: {repo.baseRepoId}
                  </p>
                )}
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1.5 bg-retro-black text-white shadow-[2px_2px_0px_0px_rgba(230,57,70,1)]">
              {new Date(repo.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
        {repos.length === 0 && (
          <div className="text-center font-mono text-retro-black font-bold p-12 border-4 border-dashed border-retro-black bg-retro-gray/30">
            <div className="inline-block p-4 mb-4 border-2 border-retro-black rounded-full">
              <Database className="w-12 h-12 text-retro-gray" />
            </div>
            <p className="text-lg mb-4">No repositories found.</p>
            <p className="text-sm">Create your first base resume repository to get started.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="retro-card max-w-md w-full bg-white relative border-4 border-retro-black shadow-[12px_12px_0px_0px_rgba(26,26,26,1)]">
            <h2 className="text-2xl font-bold font-mono border-b-4 border-retro-black pb-2 mb-6">Initialize Repository</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block font-mono text-base font-bold mb-2 text-retro-black uppercase tracking-wider">Repository Name</label>
                <input 
                  type="text" 
                  className="retro-input py-3 text-base font-bold" 
                  placeholder="e.g., Google-SWE-Application"
                  value={newRepoName}
                  onChange={e => setNewRepoName(e.target.value)}
                  autoFocus
                />
              </div>
              
              {repos.length > 0 && (
                <div className="mb-6">
                  <label className="block font-mono text-base font-bold mb-2 text-retro-black uppercase tracking-wider">Fork from Base (Optional)</label>
                  <select 
                    className="retro-input py-3 text-base font-bold bg-white"
                    value={selectedBaseRepo}
                    onChange={e => setSelectedBaseRepo(e.target.value)}
                  >
                    <option value="">-- None (Start Empty Main) --</option>
                    {repos.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.repoName} {r.baseRepoId ? '(Branch Fork)' : '(Main)'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs font-mono mt-2 text-retro-black italic border-l-4 border-retro-red pl-2">
                    Selecting a base repository acting like GitHub branching. It will automatically inherit all data from your main resume!
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-4 border-t-2 border-retro-black pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 font-mono font-bold bg-white text-retro-black border-2 border-retro-black hover:bg-retro-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">Abort</button>
                <button type="submit" className="retro-btn text-base py-3">Create Instance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
