import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email and Password are required.');
      return;
    }
    setErrorMsg('');
    setFormLoading(true);

    try {
      if (isLoginMode) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Authentication failed. Please check credentials.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-retro-red/20 to-retro-white p-4 selection:bg-retro-black selection:text-white">
      <div className="retro-card max-w-md w-full bg-white relative border-4 border-retro-black shadow-[20px_20px_0px_0px_rgba(26,26,26,1)] p-8">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-retro-black text-white px-6 py-2 font-mono font-bold uppercase tracking-widest border-2 border-retro-black shadow-[4px_4px_0px_0px_rgba(230,57,70,1)]">
          Authentication Required
        </div>
        
        <h2 className="text-3xl font-bold font-mono mb-6 border-b-4 border-retro-black pb-4 text-center tracking-wider text-retro-black uppercase mt-6">
          {isLoginMode ? 'Access Terminal' : 'Initialize User'}
        </h2>
        
        {isLoading && (
          <p className="font-mono mb-4 text-retro-gray text-center animate-pulse tracking-widest">Checking Sync...]</p>
        )}

        {errorMsg && (
          <div className="bg-retro-red text-white p-4 font-mono font-bold border-4 border-retro-black mb-6 animate-pulse shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <div className="flex items-center">
              <span className="text-2xl mr-2">!</span>
              <span>ERROR: {errorMsg}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-bold font-mono text-retro-black mb-2 uppercase tracking-wider">Email Identity_</label>
            <input 
              type="email" 
              className="w-full retro-input py-3 px-4 text-lg font-mono focus:border-retro-red outline-none border-4 transition-colors shadow-[2px_2px_0px_0px_rgba(26,26,26,0.1)]"
              placeholder="user@network.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={formLoading || isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-bold font-mono text-retro-black mb-2 uppercase tracking-wider">Passphrase_</label>
            <input 
              type="password" 
              className="w-full retro-input py-3 px-4 text-lg font-mono focus:border-retro-red outline-none border-4 transition-colors shadow-[2px_2px_0px_0px_rgba(26,26,26,0.1)]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={formLoading || isLoading}
            />
          </div>
          
          <button 
            type="submit"
            disabled={formLoading || isLoading}
            className="retro-btn w-full mt-4 flex items-center justify-center py-4 text-lg border-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            {formLoading ? '[ Processing ]' : isLoginMode ? 'Execute Login' : 'Create Identity'}
          </button>
        </form>

        <div className="flex items-center justify-center space-x-4 mb-6 font-mono text-retro-gray">
          <div className="h-px w-1/4 bg-retro-black"></div>
          <span className="font-bold uppercase tracking-widest">OR</span>
          <div className="h-px w-1/4 bg-retro-black"></div>
        </div>

        <button 
          type="button"
          onClick={() => loginWithGoogle()} 
          disabled={formLoading || isLoading}
          className="retro-btn-secondary w-full hover:bg-retro-black hover:text-white border-4 border-retro-black transition-colors font-bold text-center py-3 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-[6px_6px_0px_0px_rgba(230,57,70,1)]"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Login with Google
        </button>

        <div className="mt-8 text-center border-t-2 border-retro-gray pt-4">
          <button 
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setErrorMsg('');
            }}
            className="font-mono text-sm font-bold text-retro-black hover:text-retro-red hover:underline uppercase tracking-widest transition-colors"
          >
            {isLoginMode ? 'Need Clearance? Create Account >>' : '<< Back to Login'}
          </button>
        </div>

      </div>
    </div>
  );
}
