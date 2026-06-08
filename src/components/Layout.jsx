import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, GitBranch, GitCommit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getRepos } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [repos, setRepos] = useState([]);
  const navigate = useNavigate();
  const { logout, getTokenSilently } = useAuth();

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const token = await getTokenSilently();
        const data = await getRepos(token);
        setRepos(data);
      } catch (err) {
        if (err.message.includes('No token') || err.message.includes('Token is not valid') || err.message === 'Failed to fetch repos' || err.error === 'login_required') {
          navigate('/login');
        }
      }
    };
    fetchRepos();
  }, [navigate, getTokenSilently]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const mainRepos = repos.filter(r => !r.baseRepoId);
  const branchRepos = repos.filter(r => r.baseRepoId);

  return (
    <div className="flex h-screen bg-retro-white text-retro-black overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r-2 border-retro-black bg-white flex flex-col shadow-[4px_0px_0px_0px_rgba(26,26,26,1)]">
        <div className="p-6 border-b-2 border-retro-black bg-retro-red text-white flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none"></div>
          <GitCommit className="mr-3 w-8 h-8 relative z-10" />
          <h1 className="font-mono text-2xl font-bold tracking-wider relative z-10">ResumevVc</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 font-mono overflow-y-auto">
          <Link to="/app" className="flex items-center px-4 py-3 bg-retro-black text-white border-2 border-retro-black shadow-[4px_4px_0px_0px_rgba(230,57,70,1)]">
            <Home className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          
          <div className="pt-4 pb-2 text-xs text-retro-gray uppercase tracking-widest font-bold px-4">Main Repo</div>
          {mainRepos.map(repo => (
            <Link key={repo._id} to={`/app/repo/${repo._id}`} className="flex items-center px-4 py-3 hover:bg-retro-black hover:text-white border-2 border-transparent hover:border-retro-black transition-all shadow-[2px_2px_0px_0px_rgba(26,26,26,0.5)] hover:shadow-[4px_4px_0px_0px_rgba(230,57,70,1)]">
              <GitBranch className="w-5 h-5 mr-3" /> {repo.repoName}
            </Link>
          ))}

          <div className="pt-4 pb-2 text-xs text-retro-gray uppercase tracking-widest font-bold px-4">Company Branches</div>
          {branchRepos.map(repo => (
            <Link key={repo._id} to={`/app/repo/${repo._id}`} className="flex items-center px-4 py-3 hover:bg-retro-black hover:text-white border-2 border-transparent hover:border-retro-black transition-all shadow-[2px_2px_0px_0px_rgba(26,26,26,0.5)] hover:shadow-[4px_4px_0px_0px_rgba(230,57,70,1)] ml-4 text-sm">
              <GitBranch className="w-4 h-4 mr-2" /> {repo.repoName}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t-2 border-retro-black bg-retro-gray/30">
          <button onClick={handleLogout} className="retro-btn-secondary w-full flex items-center justify-center">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-retro-white relative">
        <Outlet />
      </main>
    </div>
  );
}
