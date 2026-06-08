import { useParams } from 'react-router-dom';
import { FileJson, History, GitCompare, Save, FileUp, Plus, Trash2, GitMerge, GitCommit, StickyNote } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getCommits, createCommit, mergeRepo, getRepos, updateRepoNotes, parseResume, forkRepo, getForks } from '../services/api';
import { useReactToPrint } from 'react-to-print';
import ResumePDFTemplate from '../components/ResumePDFTemplate';
import { useAuth } from '../context/AuthContext';
import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

export default function RepoView() {
  const { repoId } = useParams();
  const [activeTab, setActiveTab] = useState('editor');
  const [commits, setCommits] = useState([]);
  const [resumeData, setResumeData] = useState({ name: '', email: '', phone: '', location: '', linkedin: '', skills: [], experience: [], projects: [], education: [] });
  const [commitMessage, setCommitMessage] = useState('');
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [repoNotes, setRepoNotes] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentRepoInfo, setCurrentRepoInfo] = useState(null);
  const [showForkModal, setShowForkModal] = useState(false);
  const [forkName, setForkName] = useState('');
  const [forks, setForks] = useState([]);
  const [showForks, setShowForks] = useState(false);
  const pdfRef = useRef();
  const { getTokenSilently } = useAuth();

  const handlePrint = useReactToPrint({
    contentRef: pdfRef,
    documentTitle: `${currentRepoInfo?.repoName || 'Resume'}_Export`,
    onBeforePrint: () => logEvent(analytics, 'pdf_downloaded')
  });

  const fetchRepoInfo = useCallback(async () => {
    try {
      const token = await getTokenSilently();
      const data = await getRepos(token);
      const info = data.find(r => r._id === repoId);
      setCurrentRepoInfo(info);
      setRepoNotes(info?.notes || '');
    } catch (err) {
      console.error(err);
    }
  }, [getTokenSilently, repoId]);

  const fetchCommits = useCallback(async () => {
    try {
      const token = await getTokenSilently();
      const data = await getCommits(repoId, token);
      setCommits(data);
      if (data.length > 0) {
        setResumeData(data[0].resumeData);
      } else {
        setResumeData({ name: '', email: '', phone: '', location: '', linkedin: '', skills: [], experience: [], projects: [], education: [] });
      }
    } catch (err) {
      console.error(err);
    }
  }, [getTokenSilently, repoId]);

  const fetchForks = useCallback(async () => {
    try {
      const token = await getTokenSilently();
      const data = await getForks(repoId, token);
      setForks(data);
    } catch (err) {
      console.error(err);
    }
  }, [getTokenSilently, repoId]);

  const handleFork = async (e) => {
    e.preventDefault();
    if (!forkName.trim()) return;
    try {
      const token = await getTokenSilently();
      const newFork = await forkRepo(repoId, forkName, token);
      setShowForkModal(false);
      setForkName('');
      fetchForks();
      alert(`Fork "${newFork.repoName}" created successfully!`);
    } catch (err) {
      console.error(err);
      alert('Failed to fork repo');
    }
  };

  useEffect(() => {
    fetchCommits();
    fetchRepoInfo();
    fetchForks();
  }, [fetchCommits, fetchRepoInfo, fetchForks]);

  const handleJSONChange = (e) => {
    try {
      const parsed = JSON.parse(e.target.value);
      setResumeData(parsed);
    } catch (err) {
      console.error(err);
    }
  };

  const updateField = (field, value) => setResumeData(prev => ({ ...prev, [field]: value }));

  const updateArrayItem = (field, index, subField, value) => {
    setResumeData(prev => {
      const newArray = [...(prev[field] || [])];
      newArray[index] = { ...newArray[index], [subField]: value };
      return { ...prev, [field]: newArray };
    });
  };

  const updateSkill = (index, value) => {
    setResumeData(prev => {
      const skills = [...(prev.skills || [])];
      skills[index] = value;
      return { ...prev, skills };
    });
  };

  const addArrayItem = (field, emptyObj) => setResumeData(prev => ({ ...prev, [field]: [...(prev[field] || []), emptyObj] }));

  const removeArrayItem = (field, index) => {
    setResumeData(prev => {
      const newArray = [...(prev[field] || [])];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const getBullets = (item, prop) => Array.isArray(item[prop]) ? item[prop] : (typeof item[prop] === 'string' ? item[prop].split('\n').filter(l => l.trim()) : []);

  const updateNestedArrayItem = (field, index, subField, bulletIndex, value) => {
    setResumeData(prev => {
      const newArray = [...(prev[field] || [])];
      const newSubArray = getBullets(newArray[index], subField);
      newSubArray[bulletIndex] = value;
      newArray[index] = { ...newArray[index], [subField]: newSubArray };
      return { ...prev, [field]: newArray };
    });
  };

  const addNestedArrayItem = (field, index, subField) => {
    setResumeData(prev => {
      const newArray = [...(prev[field] || [])];
      const newSubArray = [...getBullets(newArray[index], subField), ''];
      newArray[index] = { ...newArray[index], [subField]: newSubArray };
      return { ...prev, [field]: newArray };
    });
  };

  const removeNestedArrayItem = (field, index, subField, bulletIndex) => {
    setResumeData(prev => {
      const newArray = [...(prev[field] || [])];
      const newSubArray = getBullets(newArray[index], subField);
      newSubArray.splice(bulletIndex, 1);
      newArray[index] = { ...newArray[index], [subField]: newSubArray };
      return { ...prev, [field]: newArray };
    });
  };

  const handleCommit = async (e) => {
    e.preventDefault();
    if (!commitMessage) return;
    try {
      const token = await getTokenSilently();
      await createCommit(repoId, commitMessage, resumeData, token);
      setShowCommitModal(false);
      setCommitMessage('');
      fetchCommits();
      setActiveTab('history');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevert = async (commitToRevert) => {
    if (!window.confirm(`Are you sure you want to revert to v${commitToRevert.versionNumber}? This will create a new commit replicating that exact state.`)) return;
    try {
      const token = await getTokenSilently();
      await createCommit(
        repoId, 
        `[REVERT] Restored state to v${commitToRevert.versionNumber}`, 
        commitToRevert.resumeData, 
        token
      );
      setActiveDropdown(null);
      fetchCommits();
      alert(`Successfully reverted to v${commitToRevert.versionNumber}`);
    } catch (err) {
      console.error(err);
      alert('Failed to revert');
    }
  };

  const handleMerge = async () => {
    if (!window.confirm("WARNING: This will overwrite changes on the main base repository with this branch's data. Proceed?")) return;
    try {
      const token = await getTokenSilently();
      await mergeRepo(repoId, token);
      alert("Merge successful! Changes propagated to base repository.");
    } catch (err) {
      console.error(err);
      alert("Merge failed.");
    }
  };

  const handleSaveNotes = async () => {
    try {
      const token = await getTokenSilently();
      await updateRepoNotes(repoId, repoNotes, token);
      alert('Notes saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save notes');
    }
  };

  const handleAIParse = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);

    setIsParsing(true);
    try {
      const token = await getTokenSilently();
      const res = await parseResume(formData, token);
      const data = await res.json();
      if (res.ok) {
        setResumeData(prev => ({ ...prev, ...(typeof data === 'object' ? data : {}) }));
      }
      else alert(data.message || 'Parse failed');
    } catch (err) {
      console.error(err);
      alert('Network error during parsing.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-retro-white">
      <header className="bg-white border-b-2 border-retro-black p-4 flex flex-col md:flex-row justify-between items-start md:items-center z-10 sticky top-0 shrink-0 gap-4 shadow-[0px_4px_0px_0px_rgba(26,26,26,1)]">
        <div>
          <h2 className="text-2xl font-mono font-bold text-retro-red bg-gradient-to-r from-retro-red to-retro-black bg-clip-text text-transparent">{currentRepoInfo?.repoName || repoId}</h2>
          <p className="text-sm font-mono font-bold text-retro-black uppercase tracking-widest mt-1">
            {currentRepoInfo?.baseRepoId ? 'Branch Workspace' : 'Main Workspace'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentRepoInfo?.baseRepoId && (
            <button onClick={handleMerge} className="retro-btn flex items-center bg-retro-black text-white hover:bg-green-600 transition-colors border-2 border-retro-black shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <GitMerge className="w-5 h-5 mr-2" /> Push to Main
            </button>
          )}

          <button onClick={() => setShowForkModal(true)} className="retro-btn-secondary flex items-center border-2 border-retro-black shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-[6px_6px_0px_0px_rgba(230,57,70,1)]">
            <GitBranch className="w-5 h-5 mr-2" /> Fork{forks.length > 0 ? ` (${forks.length})` : ''}
          </button>
          {activeTab === 'editor' && (
            <label className="retro-btn-secondary flex items-center cursor-pointer border-2 border-retro-black shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-[6px_6px_0px_0px_rgba(230,57,70,1)]">
              <FileUp className="w-5 h-5 mr-2" /> Upload Resume
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleAIParse} />
            </label>
          )}
          <button onClick={() => handlePrint()} className="retro-btn flex items-center bg-retro-black text-white hover:bg-retro-white hover:text-retro-black border-2 border-retro-black shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            Download PDF
          </button>
          <button onClick={() => setShowCommitModal(true)} className="retro-btn flex items-center bg-retro-red text-white hover:bg-black border-2 border-retro-black shadow-[4px_4px_0px_0px_rgba(230,57,70,1)]">
            <Save className="w-5 h-5 mr-2" /> Commit Chg
          </button>
        </div>
      </header>

      {/* Forks List Toggle */}
      {forks.length > 0 && (
        <div className="bg-retro-gray/20 border-b-2 border-retro-black px-4 py-2">
          <button onClick={() => setShowForks(!showForks)} className="font-mono text-sm font-bold text-retro-black hover:text-retro-red transition-colors flex items-center">
            <GitBranch className="w-4 h-4 mr-2" /> {forks.length} Fork{forks.length > 1 ? 's' : ''} {showForks ? '▲' : '▼'}
          </button>
          {showForks && (
            <div className="mt-2 flex flex-wrap gap-2">
              {forks.map(fork => (
                <button
                  key={fork._id}
                  onClick={() => window.location.href = `/app/repo/${fork._id}`}
                  className="px-3 py-1.5 font-mono text-xs font-bold bg-white border-2 border-retro-black hover:bg-retro-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                >
                  {fork.repoName}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b-2 border-retro-black flex px-4 shrink-0 overflow-x-auto">
        {[
          { id: 'editor', icon: FileJson, label: 'Editor' },
          { id: 'history', icon: History, label: 'Graph' },
          { id: 'diff', icon: GitCompare, label: 'Diff' },
          { id: 'notes', icon: StickyNote, label: 'Performance Notes' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 flex items-center font-mono text-sm border-b-4 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-retro-red text-retro-red font-bold bg-retro-red/5' : 'hover:border-retro-black text-retro-black font-bold'}`}
          >
            <tab.icon className="w-5 h-5 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
        {activeTab === 'editor' && (
          <div className="flex flex-1 gap-6 min-h-0">
            <div className="retro-card flex flex-col flex-1 min-h-0 min-w-0">
              <h3 className="font-mono font-bold mb-4 border-b-2 border-retro-black pb-2 shrink-0 bg-gradient-to-r from-retro-black to-retro-red bg-clip-text text-transparent">Visual Builder</h3>
              <div className="overflow-y-auto pr-2 pb-4 space-y-6 min-h-0">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-mono font-bold text-retro-red uppercase text-sm border-b-2 border-retro-black pb-1">Basic Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold font-mono mb-1 text-retro-black uppercase tracking-wider">Name</label>
                      <input type="text" className="retro-input" value={resumeData?.name || ''} onChange={(e) => updateField('name', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold font-mono mb-1 text-retro-black uppercase tracking-wider">Email</label>
                      <input type="email" className="retro-input" value={resumeData?.email || ''} onChange={(e) => updateField('email', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold font-mono mb-1 text-retro-black uppercase tracking-wider">Phone</label>
                      <input type="text" className="retro-input" value={resumeData?.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold font-mono mb-1 text-retro-black uppercase tracking-wider">Location</label>
                      <input type="text" className="retro-input" placeholder="e.g. San Jose, CA" value={resumeData?.location || ''} onChange={(e) => updateField('location', e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold font-mono mb-1 text-retro-black uppercase tracking-wider">LinkedIn URL</label>
                      <input type="text" className="retro-input" value={resumeData?.linkedin || ''} onChange={(e) => updateField('linkedin', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="flex items-center justify-between font-mono font-bold text-retro-red uppercase text-sm border-b-2 border-retro-black pb-1 mb-2">
                    Skills
                    <button onClick={() => addArrayItem('skills', '')} className="p-2 hover:bg-retro-black hover:text-white transition-colors border-2 border-retro-black shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"><Plus className="w-5 h-5" /></button>
                  </h4>
                  <div className="space-y-2">
                    {(Array.isArray(resumeData.skills) ? resumeData.skills : []).map((skill, index) => (
                      <div key={index} className="flex space-x-2">
                        <input type="text" className="retro-input py-2 text-sm font-bold" value={skill} onChange={(e) => updateSkill(index, e.target.value)} />
                        <button onClick={() => removeArrayItem('skills', index)} className="p-2 text-retro-black hover:text-white border-2 border-retro-black hover:bg-retro-red transition-colors shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h4 className="flex items-center justify-between font-mono font-bold text-retro-red uppercase text-sm border-b-2 border-retro-black pb-1 mb-2">
                    Experience
                    <button onClick={() => addArrayItem('experience', { company: '', role: '', startDate: '', endDate: '', description: '' })} className="p-2 hover:bg-retro-black hover:text-white transition-colors border-2 border-retro-black shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"><Plus className="w-5 h-5" /></button>
                  </h4>
                  <div className="space-y-6">
                    {(Array.isArray(resumeData.experience) ? resumeData.experience : []).map((exp, index) => (
                      <div key={index} className="border-4 border-retro-black p-4 space-y-4 bg-white relative group shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
                        <button onClick={() => removeArrayItem('experience', index)} className="absolute top-3 right-3 text-retro-black hover:text-white hover:bg-retro-red p-2 transition-colors border-2 border-retro-black shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"><Trash2 className="w-5 h-5" /></button>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <input type="text" className="retro-input py-2 text-sm font-bold" placeholder="Company" value={exp.company || ''} onChange={(e) => updateArrayItem('experience', index, 'company', e.target.value)} />
                          <input type="text" className="retro-input py-2 text-sm font-bold" placeholder="Role" value={exp.role || ''} onChange={(e) => updateArrayItem('experience', index, 'role', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" className="retro-input py-2 text-sm font-bold" placeholder="Start Date" value={exp.startDate || ''} onChange={(e) => updateArrayItem('experience', index, 'startDate', e.target.value)} />
                          <input type="text" className="retro-input py-2 text-sm font-bold" placeholder="End Date" value={exp.endDate || ''} onChange={(e) => updateArrayItem('experience', index, 'endDate', e.target.value)} />
                        </div>
                        <div className="bg-retro-white border-2 border-retro-black p-3 space-y-2 mt-2">
                          <h5 className="text-xs font-bold font-mono text-retro-black uppercase mb-1">Bullet Points</h5>
                          {getBullets(exp, 'description').map((bullet, bulletIdx) => (
                            <div key={bulletIdx} className="flex space-x-2">
                              <input type="text" className="retro-input py-1 text-sm flex-1 font-bold" value={bullet} onChange={(e) => updateNestedArrayItem('experience', index, 'description', bulletIdx, e.target.value)} />
                              <button onClick={() => removeNestedArrayItem('experience', index, 'description', bulletIdx)} className="p-2 px-3 text-retro-black border-2 border-retro-black hover:bg-retro-red hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"><Trash2 className="w-5 h-5" /></button>
                            </div>
                          ))}
                          <button onClick={() => addNestedArrayItem('experience', index, 'description')} className="text-xs font-bold text-retro-red hover:underline">+ Add Point</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div>
                  <h4 className="flex items-center justify-between font-mono font-bold text-retro-red uppercase text-sm border-b-2 border-retro-black pb-1 mb-2">
                    Projects
                    <button onClick={() => addArrayItem('projects', { name: '', description: '', link: '' })} className="p-2 hover:bg-retro-black hover:text-white transition-colors border-2 border-retro-black shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"><Plus className="w-5 h-5" /></button>
                  </h4>
                  <div className="space-y-6">
                    {(Array.isArray(resumeData.projects) ? resumeData.projects : []).map((proj, index) => (
                      <div key={index} className="border-4 border-retro-black p-4 space-y-4 bg-white relative group shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
                        <button onClick={() => removeArrayItem('projects', index)} className="absolute top-3 right-3 text-retro-black hover:text-white hover:bg-retro-red p-2 transition-colors border-2 border-retro-black shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"><Trash2 className="w-5 h-5" /></button>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <input type="text" className="retro-input py-2 text-sm font-bold" placeholder="Project Name" value={proj.name || ''} onChange={(e) => updateArrayItem('projects', index, 'name', e.target.value)} />
                          <input type="text" className="retro-input py-2 text-sm font-bold" placeholder="Link (URL)" value={proj.link || ''} onChange={(e) => updateArrayItem('projects', index, 'link', e.target.value)} />
                        </div>
                        <div className="bg-retro-white border-2 border-retro-black p-3 space-y-2 mt-2">
                          <h5 className="text-xs font-bold font-mono text-retro-black uppercase mb-1">Bullet Points</h5>
                          {getBullets(proj, 'description').map((bullet, bulletIdx) => (
                            <div key={bulletIdx} className="flex space-x-2">
                              <input type="text" className="retro-input py-1 text-sm flex-1 font-bold" value={bullet} onChange={(e) => updateNestedArrayItem('projects', index, 'description', bulletIdx, e.target.value)} />
                              <button onClick={() => removeNestedArrayItem('projects', index, 'description', bulletIdx)} className="p-2 px-3 text-retro-black border-2 border-retro-black hover:bg-retro-red hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"><Trash2 className="w-5 h-5" /></button>
                            </div>
                          ))}
                          <button onClick={() => addNestedArrayItem('projects', index, 'description')} className="text-xs font-bold text-retro-red hover:underline">+ Add Point</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h4 className="flex items-center justify-between font-mono font-bold text-retro-red uppercase text-sm border-b-2 border-retro-black pb-1 mb-2">
                    Education
                    <button onClick={() => addArrayItem('education', { institution: '', degree: '', graduationDate: '', details: '' })} className="p-2 hover:bg-retro-black hover:text-white transition-colors border-2 border-retro-black shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"><Plus className="w-5 h-5" /></button>
                  </h4>
                  <div className="space-y-6">
                    {(Array.isArray(resumeData.education) ? resumeData.education : []).map((edu, index) => (
                      <div key={index} className="border-4 border-retro-black p-4 space-y-4 bg-white relative group shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
                        <button onClick={() => removeArrayItem('education', index)} className="absolute top-3 right-3 text-retro-black hover:text-white hover:bg-retro-red p-2 transition-colors border-2 border-retro-black shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"><Trash2 className="w-5 h-5" /></button>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <input type="text" className="retro-input py-2 text-sm font-bold" placeholder="Institution" value={edu.institution || ''} onChange={(e) => updateArrayItem('education', index, 'institution', e.target.value)} />
                          <input type="text" className="retro-input py-2 text-sm font-bold" placeholder="Degree" value={edu.degree || ''} onChange={(e) => updateArrayItem('education', index, 'degree', e.target.value)} />
                        </div>
                        <div className="w-1/2">
                          <input type="text" className="retro-input py-2 text-sm font-bold" placeholder="Graduation Date" value={edu.graduationDate || ''} onChange={(e) => updateArrayItem('education', index, 'graduationDate', e.target.value)} />
                        </div>
                        <div className="bg-retro-white border-2 border-retro-black p-3 space-y-2 mt-2">
                          <h5 className="text-xs font-bold font-mono text-retro-black uppercase mb-1">Details / Awards</h5>
                          {getBullets(edu, 'details').map((bullet, bulletIdx) => (
                            <div key={bulletIdx} className="flex space-x-2">
                              <input type="text" className="retro-input py-1 text-sm flex-1 font-bold" value={bullet} onChange={(e) => updateNestedArrayItem('education', index, 'details', bulletIdx, e.target.value)} />
                              <button onClick={() => removeNestedArrayItem('education', index, 'details', bulletIdx)} className="p-2 px-3 text-retro-black border-2 border-retro-black hover:bg-retro-red hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"><Trash2 className="w-5 h-5" /></button>
                            </div>
                          ))}
                          <button onClick={() => addNestedArrayItem('education', index, 'details')} className="text-xs font-bold text-retro-red hover:underline">+ Add Point</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col flex-1 bg-retro-black border-4 border-retro-black min-h-0 min-w-0 shadow-[6px_6px_0px_0px_rgba(230,57,70,1)] p-4">
              <h3 className="font-mono font-bold mb-4 border-b-2 border-white pb-2 text-white shrink-0 tracking-wider uppercase bg-gradient-to-r from-white to-retro-red bg-clip-text text-transparent">Raw JSON Output</h3>
              <textarea
                className="flex-1 w-full bg-retro-black text-white font-mono text-sm border-none focus:ring-0 resize-none outline-none overflow-y-auto leading-relaxed"
                value={JSON.stringify(resumeData, null, 2)}
                onChange={handleJSONChange}
                spellCheck="false"
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="retro-card flex-1 min-h-0 overflow-y-auto bg-white flex flex-col p-8">
            <h3 className="font-mono text-2xl font-bold border-b-4 border-retro-black pb-2 mb-8 tracking-wide flex justify-between bg-gradient-to-r from-retro-black to-retro-red bg-clip-text text-transparent">
              Git Commit Graph
              <span className="text-sm bg-retro-black text-white px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(230,57,70,1)]">HEAD -&gt; {currentRepoInfo?.baseRepoId ? 'branch' : 'main'}</span>
            </h3>

            <div className="relative flex-1">
              {/* Central Graph Line */}
              <div className="absolute left-8 top-4 bottom-0 w-2 bg-retro-black transform -translate-x-1/2"></div>

              <div className="space-y-12 pb-8">
                {commits.map((commit) => (
                  <div key={commit._id} className="relative flex items-center group">

                    {/* Node Dot */}
                    <div 
                      className="w-20 h-20 rounded-full bg-white border-8 border-retro-black absolute left-8 transform -translate-x-1/2 flex items-center justify-center z-10 hover:border-retro-red transition-colors shadow-[0px_0px_0px_4px_white] cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => setActiveDropdown(activeDropdown === commit._id ? null : commit._id)}
                    >
                      <GitCommit className="w-8 h-8 text-retro-black" />

                      {activeDropdown === commit._id && (
                        <div className="absolute top-16 left-0 mt-2 bg-white border-4 border-retro-black shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] z-50 flex flex-col min-w-[200px]">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRevert(commit);
                            }}
                            className="px-4 py-3 text-left font-mono font-bold text-retro-black hover:bg-retro-red hover:text-white transition-colors"
                          >
                            Revert to v{commit.versionNumber}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Commit Box */}
                    <div className="ml-24 w-full max-w-2xl bg-retro-white border-4 border-retro-black p-5 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-xl font-mono text-retro-black">
                          {commit.commitMessage.includes('[BRANCH]') ? (
                            <span className="text-retro-red font-bold mr-2">{"<Branch Fork>"}</span>
                          ) : commit.commitMessage.includes('[MERGE]') ? (
                            <span className="text-blue-700 font-bold mr-2">{"<Merge>"}</span>
                          ) : null}
                          {commit.commitMessage.replace('[BRANCH]', '').replace('[MERGE]', '')}
                        </h4>
                        <span className="bg-retro-black text-white border-2 border-retro-black font-mono font-bold px-3 py-1 text-sm ml-4 whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(230,57,70,1)]">v{commit.versionNumber}</span>
                      </div>
                      <div className="text-sm font-mono font-bold text-retro-gray mb-3 border-b-2 border-retro-gray pb-2">
                        {new Date(commit.createdAt).toLocaleString()}
                      </div>

                      <div className="text-xs bg-retro-gray/30 border-2 border-retro-gray p-3 max-h-40 overflow-y-auto">
                        {commit.changes && commit.changes.length > 0 ? (
                          commit.changes.map((change, i) => (
                            change.added || change.removed ? (
                              <div key={i} className="flex mb-1 last:mb-0">
                                <span className={`w-6 inline-block font-bold flex-shrink-0 ${change.added ? 'text-green-600' : 'text-retro-red'}`}>
                                  {change.added ? '+' : '-'}
                                </span>
                                <span className={`flex-1 overflow-hidden whitespace-nowrap text-ellipsis ${change.added ? 'text-green-800' : 'text-red-800'}`}>
                                  {change.value.trim()}
                                </span>
                              </div>
                            ) : null
                          ))
                        ) : (
                          <span className="text-retro-black italic font-bold">No structural changes</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {commits.length === 0 && <div className="text-retro-black font-mono font-bold italic ml-24">No commits yet...</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diff' && (
          <div className="retro-card flex-1 min-h-0 overflow-y-auto bg-retro-black text-white p-6">
            <h3 className="font-mono text-2xl font-bold border-b-4 border-white pb-2 mb-6 tracking-wide bg-gradient-to-r from-white to-retro-red bg-clip-text text-transparent">Diff Viewer (Unified Patch)</h3>
            <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-retro-red selection:text-white">
              {commits.length >= 2 ? (
                <>
                  <div className="mb-6 pb-2 border-b-2 border-retro-red inline-block font-bold bg-retro-red/10 px-4 py-2 rounded">Comparing <span className="bg-white text-retro-black px-3 py-1.5 ml-1 shadow-[2px_2px_0px_0px_rgba(230,57,70,1)]">v{commits[0].versionNumber}</span> against <span className="bg-white text-retro-black px-3 py-1.5 ml-1 shadow-[2px_2px_0px_0px_rgba(230,57,70,1)]">v{commits[1].versionNumber}</span></div>
                  <div className="bg-white text-retro-black p-5 border-4 border-retro-red shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                    {commits[0].changes.map((c, i) => {
                       if (c.added) return <span key={i} className="bg-green-200 text-green-900 w-full block pl-2">+{c.value}</span>;
                       if (c.removed) return <span key={i} className="bg-retro-red text-white w-full block pl-2">-{c.value}</span>;
                       return <span key={i} className="text-retro-gray block pl-2">{c.value}</span>;
                     })}
                  </div>
                </>
              ) : (
                <div className="font-bold text-retro-red text-2xl">Not enough commits to diff. Needs at least 2 versions.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="retro-card flex-1 min-h-0 bg-white p-6 flex flex-col">
            <h3 className="font-mono text-2xl font-bold border-b-4 border-retro-black pb-2 mb-6 tracking-wide flex items-center bg-gradient-to-r from-retro-black to-retro-red bg-clip-text text-transparent">
              <StickyNote className="w-8 h-8 mr-3 text-retro-red" /> Performance Tracking Notes
            </h3>
            <p className="font-mono text-sm text-retro-black mb-4 font-bold tracking-tight">Document why this resume worked (or didn't) for this specific application.</p>
            <textarea
              className="flex-1 w-full retro-input bg-retro-white text-retro-black font-mono text-base border-4 border-retro-black resize-none p-6 mb-6 leading-relaxed shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] outline-none focus:ring-0 focus:border-retro-red"
              placeholder="e.g., Google SWE Role: Recruiter loved the focus on React, but I should emphasize more on Distributed Systems next time. Rejection reason: N/A."
              value={repoNotes}
              onChange={(e) => setRepoNotes(e.target.value)}
              spellCheck="false"
            />
            <div className="flex justify-start">
              <button onClick={handleSaveNotes} className="retro-btn bg-retro-red text-white flex items-center px-6 py-3 border-4 border-retro-black hover:bg-black transition-colors font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-none translate-y-0 hover:translate-y-1 hover:translate-x-1 duration-150">
                <Save className="w-6 h-6 mr-2" /> Save Notes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Parsing Overlay */}
      {isParsing && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center p-4 z-[60] backdrop-blur-sm shadow-[12px_12px_0px_0px_rgba(230,57,70,1)]">
          <div className="w-20 h-20 border-4 border-retro-red border-t-white rounded-full animate-spin mb-6"></div>
          <h2 className="text-4xl font-bold font-mono text-white tracking-widest uppercase animate-pulse">Gemma is Parsing...</h2>
          <p className="text-retro-red font-mono font-bold mt-2 text-lg">Extracting architecture from document</p>
        </div>
      )}

      {showCommitModal && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="retro-card max-w-md w-full bg-white relative border-4 border-retro-black shadow-[12px_12px_0px_0px_rgba(26,26,26,1)]">
            <h2 className="text-2xl font-bold font-mono border-b-4 border-retro-black pb-2 mb-6">Commit Changes</h2>
            <form onSubmit={handleCommit}>
              <div className="mb-6">
                <label className="block font-mono text-base font-bold mb-2 text-retro-black uppercase tracking-wider">Commit Message</label>
                <input
                  type="text"
                  className="retro-input py-3 text-base font-bold"
                  placeholder="e.g., Added new React project"
                  value={commitMessage}
                  onChange={e => setCommitMessage(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-4 border-t-2 border-retro-black pt-4">
                <button type="button" onClick={() => setShowCommitModal(false)} className="px-6 py-3 font-mono font-bold bg-white text-retro-black border-2 border-retro-black hover:bg-retro-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">Abort</button>
                <button type="submit" className="retro-btn text-base py-3">Commit Target</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Fork Modal */}
      {showForkModal && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="retro-card max-w-md w-full bg-white relative border-4 border-retro-black shadow-[12px_12px_0px_0px_rgba(26,26,26,1)]">
            <h2 className="text-2xl font-bold font-mono border-b-4 border-retro-black pb-2 mb-6">Fork Repository</h2>
            <form onSubmit={handleFork}>
              <div className="mb-6">
                <label className="block font-mono text-base font-bold mb-2 text-retro-black uppercase tracking-wider">Fork Name</label>
                <input
                  type="text"
                  className="retro-input py-3 text-base font-bold"
                  placeholder={`${currentRepoInfo?.repoName || ''}-copy`}
                  value={forkName}
                  onChange={e => setForkName(e.target.value)}
                  autoFocus
                />
                <p className="text-xs font-mono mt-2 text-retro-black italic border-l-4 border-retro-red pl-2">
                  Creates a new branch fork from the latest commit of this repository.
                </p>
              </div>
              <div className="flex justify-end space-x-4 border-t-2 border-retro-black pt-4">
                <button type="button" onClick={() => { setShowForkModal(false); setForkName(''); }} className="px-6 py-3 font-mono font-bold bg-white text-retro-black border-2 border-retro-black hover:bg-retro-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">Abort</button>
                <button type="submit" className="retro-btn text-base py-3">Create Fork</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden PDF Template for react-to-print Engine */}
      <div className="hidden">
        <ResumePDFTemplate ref={pdfRef} data={resumeData} />
      </div>

    </div>
  );
}


