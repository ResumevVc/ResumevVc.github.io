import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RepoView from './pages/RepoView';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-retro-white flex items-center justify-center">
        <div className="font-mono text-xl font-bold text-retro-red tracking-widest text-center">
          <div className="w-16 h-16 border-4 border-retro-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          SYNCING SESSION...
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="repo/:repoId" element={<RepoView />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
