import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GitCommit, GitBranch, GitMerge, FileJson, ArrowRight, HardDrive, Shield, StickyNote, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-retro-white text-retro-black font-mono overflow-x-hidden selection:bg-retro-red selection:text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 border-b-4 border-retro-black bg-white sticky top-0 z-50">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="bg-retro-black text-white p-2 group-hover:bg-retro-red transition-colors duration-300">
            <GitCommit className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest uppercase">ResumevVc</h1>
        </div>
        <div className="space-x-4 flex items-center">
          <Link to="/login" className="font-bold hover:text-retro-red transition-colors uppercase text-sm tracking-widest hidden md:inline-block">Sign In</Link>
          <Link to="/login" className="retro-btn shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-1 transition-transform">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden border-b-4 border-retro-black">
        {/* Background Decorative Elements */}
        <div className="absolute top-10 left-10 text-retro-gray opacity-20 pointer-events-none animate-pulse">
          <FileJson className="w-64 h-64" />
        </div>
        <div className="absolute -bottom-10 -right-10 text-retro-red opacity-10 pointer-events-none">
          <GitBranch className="w-96 h-96" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-block bg-white border-2 border-retro-black px-4 py-1 mb-4 font-bold text-sm tracking-widest uppercase shadow-[2px_2px_0px_0px_rgba(230,57,70,1)] hover:-translate-y-1 transition-transform cursor-default">
            Version Control for your Career
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold leading-tight uppercase relative">
            Treat your Resume <br/> like <span className="text-white bg-retro-black px-4 py-1 inline-block -rotate-2 hover:rotate-0 transition-transform duration-300 shadow-[8px_8px_0px_0px_rgba(230,57,70,1)]">Source Code</span>
          </h2>
          
          <p className="text-lg md:text-xl max-w-2xl mx-auto border-l-4 border-retro-red pl-4 text-left font-bold text-gray-700 bg-white/50 p-4">
            Track exactly which resume versions get you interviews and which ones get rejected. A powerful version control system to craft, branch, and log the performance of your professional identity.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/login" className="w-full sm:w-auto bg-retro-red text-white border-4 border-retro-black px-8 py-4 font-bold text-lg uppercase tracking-wider shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] transition-all flex items-center justify-center group">
              Compile Now <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            <a href="#features" className="w-full sm:w-auto bg-white text-retro-black border-4 border-retro-black px-8 py-4 font-bold text-lg uppercase tracking-wider hover:bg-retro-black hover:text-white transition-colors text-center">
              View Specs
            </a>
          </div>
        </div>
      </section>

      {/* Marquee Banner */}
      <div className="bg-retro-black text-white py-4 border-b-4 border-retro-red overflow-hidden flex whitespace-nowrap">
        <div className="animate-[marquee_20s_linear_infinite] flex space-x-12 px-6 font-bold tracking-widest text-lg items-center">
          <span>// JSON NATIVE DATABASE</span>
          <GitCommit className="w-5 h-5 text-retro-red" />
          <span>// TRUE BRANCHING MECHANICS</span>
          <GitBranch className="w-5 h-5 text-retro-red" />
          <span>// AI RESUME PARSING</span>
          <FileJson className="w-5 h-5 text-retro-red" />
          <span>// SECURE JWT AUTHENTICATION</span>
          <GitMerge className="w-5 h-5 text-retro-red" />
          <span>// FULLY REVERSIBLE COMMITS</span>
        </div>
      </div>

      {/* Template Showcase */}
      <section className="py-24 px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 border-b-4 border-retro-black">
        <div className="md:w-1/2 space-y-6">
          <div className="inline-block bg-retro-black text-white px-4 py-1 font-mono font-bold tracking-widest uppercase">
            Output Standard
          </div>
          <h3 className="text-4xl md:text-5xl font-bold uppercase leading-tight">
            Perfectly <br/><span className="text-retro-red">ATS-Optimized</span>
          </h3>
          <p className="text-lg font-bold text-gray-700 leading-relaxed border-l-4 border-retro-black pl-4">
            Stop fighting with formatting. We strictly compile your repository into a classic, universally-readable monochrome PDF format. No messy columns, no confusing graphics—just clean, recruiter-approved data.
          </p>
        </div>
        <div className="md:w-1/2">
          <div className="bg-white border-4 border-retro-black p-2 shadow-[12px_12px_0px_0px_rgba(230,57,70,1)] hover:-translate-y-2 hover:-translate-x-2 transition-transform duration-300 transform rotate-1">
            <img src="/resume-template.png" alt="Standard ATS Template Preview" className="w-full h-auto border-2 border-retro-gray opacity-90 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <h3 className="text-4xl font-bold uppercase text-center mb-16 border-b-4 border-retro-black inline-block mx-auto pb-2">Core Mechanics</h3>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: HardDrive, 
              title: 'JSON State Storage', 
              desc: 'Never fight a WYSIWYG editor again. Your resume is parsed strictly into machine-readable JSON formats that inherently eliminate formatting collisions.'
            },
            { 
              icon: GitBranch, 
              title: 'Company Forking', 
              desc: 'Applying to Google and Microsoft? Fork your base resume, tailor the new branch specifically to that company, and maintain isolated commit histories.'
            },
            { 
              icon: FileJson, 
              title: 'Unified Diffs', 
              desc: 'Our engine computes exact string-patch additions and deletions natively. Instantly recognize what changed between version 4 and version 5.'
            },
            { 
              icon: StickyNote, 
              title: 'Performance Notes', 
              desc: 'Attach application outcomes natively to a repository. Document why a specific branch of your resume got you the interview or the rejection.'
            },
            {
              icon: History,
              title: 'Time-Travel Reversions',
              desc: 'Made a mistake? Click on any node in your visual git graph timeline and effortlessly rollback to that exact historical state.'
            },
            {
              icon: Shield,
              title: 'Enterprise Identity',
              desc: 'ResumevVc is fortified with Firebase Google Login, ensuring secure, passwordless authentication scaling effortlessly across modern ecosystems.'
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white border-4 border-retro-black p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0px_0px_rgba(230,57,70,1)] transition-all group duration-300 flex flex-col">
              <div className="bg-retro-black p-4 inline-block mb-6 text-white group-hover:bg-retro-red transition-colors self-start border-2 border-transparent group-hover:border-retro-black">
                <feature.icon className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold mb-4 uppercase">{feature.title}</h4>
              <p className="text-base leading-relaxed font-bold text-gray-700">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-retro-black p-8 text-center">
        <div className="flex items-center justify-center space-x-2 text-retro-black font-bold uppercase tracking-widest">
          <GitCommit className="w-5 h-5 text-retro-red" />
          <span>ResumevVc Core Systems © {new Date().getFullYear()}</span>
        </div>
      </footer>
      
      {/* Required keyframe for tailwind config if not natively present, we inject inline style for MVP marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
