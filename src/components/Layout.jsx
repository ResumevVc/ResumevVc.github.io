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
    <div className="flex h-screen bg-retro-white text-retro-black">
      {/* Sidebar */}
      <aside className="w-64 border-r-2 border-retro-black bg-white flex flex-col">
        <div className="p-4 border-b-2 border-retro-black bg-retro-red text-white flex items-center justify-center">
          <GitCommit className="mr-2" />
          <h1 className="font-mono text-xl font-bold tracking-wider">ResumevVc</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 font-mono overflow-y-auto">
          <Link to="/app" className="flex items-center p-2 hover:bg-retro-black hover:text-white transition-colors border border-transparent hover:border-retro-black">
            <Home className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          
          <div className="pt-4 pb-2 text-xs text-retro-gray uppercase tracking-widest font-bold">Main Repo</div>
          {mainRepos.map(repo => (
            <Link key={repo._id} to={`/app/repo/${repo._id}`} className="flex items-center p-2 hover:bg-retro-black hover:text-white transition-colors border border-transparent hover:border-retro-black">
              <GitBranch className="w-5 h-5 mr-3" /> {repo.repoName}
            </Link>
          ))}

          <div className="pt-4 pb-2 text-xs text-retro-gray uppercase tracking-widest font-bold">Company Branches</div>
          {branchRepos.map(repo => (
            <Link key={repo._id} to={`/app/repo/${repo._id}`} className="flex items-center p-2 hover:bg-retro-black hover:text-white transition-colors border border-transparent hover:border-retro-black ml-4 text-sm">
              <GitBranch className="w-4 h-4 mr-2" /> {repo.repoName}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t-2 border-retro-black">
          <button onClick={handleLogout} className="retro-btn w-full flex items-center justify-center">
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
