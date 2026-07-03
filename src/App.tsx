import { useState, useEffect } from 'react';
import { SetupForm } from './components/SetupForm';
import { PromptResult } from './components/PromptResult';
import { SettingsModal } from './components/SettingsModal';
import { Dashboard } from './components/Dashboard';
import { Planner } from './components/Planner';
import { LicenseScreen } from './components/LicenseScreen';
import { PromptGenerationResponse, TopicIdea, SavedPrompt } from './types';
import { Sparkles, Loader2, RefreshCw, Wand2, Settings, LayoutDashboard, Video, CalendarDays, Settings2 } from 'lucide-react';
import { fetchWithKeyRotation } from './utils/api';

export default function App() {
  const [isLicensed, setIsLicensed] = useState<boolean | null>(null);
  const [currentView, setCurrentView] = useState<'studio' | 'dashboard' | 'planner'>('studio');
  const [setupData, setSetupData] = useState<{ characterLock: string; voiceLock: string; niche: string; parts: number; hookStyle: string } | null>(null);
  const [isEditingSetup, setIsEditingSetup] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('Menulis script...');
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [result, setResult] = useState<PromptGenerationResponse | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [topicsStatus, setTopicsStatus] = useState('Memproses ide...');
  const [topicsApiStatus, setTopicsApiStatus] = useState<string | null>(null);
  const [topicIdeas, setTopicIdeas] = useState<TopicIdea[] | null>(null);
  const [topicHistory, setTopicHistory] = useState<string[]>([]);

  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const validateLicense = async () => {
      const storedKey = localStorage.getItem('redi_license_key');
      if (!storedKey) {
        setIsLicensed(false);
        return;
      }

      try {
        const res = await fetch('/api/verify-license', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ licenseKey: storedKey })
        });
        const data = await res.json();
        
        if (data.valid) {
          setIsLicensed(true);
        } else {
          setIsLicensed(false);
          localStorage.removeItem('redi_license_key');
        }
      } catch (err) {
        console.error("License validation failed", err);
        // On network error during dev/init, we might want to just block or allow. 
        // For strictness, block if not valid.
        setIsLicensed(false); 
      }
    };

    validateLicense();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('veo_saved_prompts');
    if (saved) {
      try {
        setSavedPrompts(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const savePromptsToStorage = (prompts: SavedPrompt[]) => {
    setSavedPrompts(prompts);
    localStorage.setItem('veo_saved_prompts', JSON.stringify(prompts));
  };

  const handleDeleteSavedPrompt = (id: string) => {
    const newPrompts = savedPrompts.filter(p => p.id !== id);
    savePromptsToStorage(newPrompts);
  };

  const getApiKeysHeader = () => {
    return '';
  };

  const handleSetupComplete = (data: typeof setupData) => {
    if (setupData?.niche !== data?.niche) {
      setTopicHistory([]);
    }
    setSetupData(data);
    setIsEditingSetup(false);
    setTopicIdeas(null);
  };



  const generatePrompts = async (topic?: string) => {
    if (!setupData) return;
    
    setIsGenerating(true);
    setGeneratingStatus('Menulis script & VEO prompts...');
    setResult(null);
    try {
      const activeTopic = topic || customTopic;
      if (activeTopic && !topicHistory.includes(activeTopic)) {
        setTopicHistory(prev => [...prev, activeTopic]);
      }
      
      const data = await fetchWithKeyRotation('/api/generate-prompts', {
        ...setupData,
        customTopic: activeTopic
      }, setApiStatus);
      
      setResult(data);

      // Auto-save to Dashboard (and to mark it "Selesai" in Planner)
      const newSaved: SavedPrompt = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        topic: activeTopic || data.niche,
        result: data
      };
      
      setSavedPrompts(prev => {
        // Prevent duplicate saves of the same content
        if (prev.some(p => p.topic === newSaved.topic && JSON.stringify(p.result.dialogue) === JSON.stringify(newSaved.result.dialogue))) {
          return prev;
        }
        const updated = [newSaved, ...prev];
        localStorage.setItem('veo_saved_prompts', JSON.stringify(updated));
        return updated;
      });

    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal generate prompt. Cek console atau API key.');
    } finally {
      setIsGenerating(false);
      setApiStatus(null);
    }
  };

  const getTopicIdeas = async () => {
    if (!setupData) return;
    setIsGeneratingTopics(true);
    setTopicsStatus('Membuat ide...');
    try {
      const data = await fetchWithKeyRotation('/api/topic-ideas', { 
        niche: setupData.niche, 
        history: topicHistory, 
        hookStyle: setupData.hookStyle 
      }, setTopicsApiStatus);
      
      setTopicIdeas(data.topics);
      setTopicHistory(prev => {
        const newHistory = [...prev];
        data.topics.forEach((t: TopicIdea) => {
          if (!newHistory.includes(t.title)) newHistory.push(t.title);
        });
        return newHistory;
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal generate ide topik. Cek API key di pengaturan.');
    } finally {
      setIsGeneratingTopics(false);
      setTopicsApiStatus(null);
    }
  };

  const handleSaveResult = () => {
    if (!result) return;
    const newSaved: SavedPrompt = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      topic: customTopic,
      result: result
    };
    savePromptsToStorage([newSaved, ...savedPrompts]);
  };

  const isCurrentResultSaved = result ? savedPrompts.some(p => p.topic === customTopic && JSON.stringify(p.result.dialogue) === JSON.stringify(result.dialogue)) : false;

  if (isLicensed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (isLicensed === false) {
    return <LicenseScreen onSuccess={() => setIsLicensed(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col pb-8">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-white">TalkVibe Studio</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('studio')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${currentView === 'studio' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <Video className="w-4 h-4"/> Studio
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <LayoutDashboard className="w-4 h-4"/> Dashboard
              </button>
              <button
                onClick={() => setCurrentView('planner')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${currentView === 'planner' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <CalendarDays className="w-4 h-4"/> Planner
              </button>
            </div>
            
            <div className="h-6 w-px bg-gray-800" />

            {(currentView === 'studio' || currentView === 'planner') && setupData && !isEditingSetup && (
              <button
                onClick={() => setIsEditingSetup(true)}
                className="text-sm font-semibold text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-1.5"
              >
                <Settings2 className="w-4 h-4" />
                Edit Config
              </button>
            )}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all"
              title="Pengaturan API Key"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        {currentView === 'dashboard' ? (
          <Dashboard savedPrompts={savedPrompts} onDelete={handleDeleteSavedPrompt} />
        ) : currentView === 'planner' ? (
          <Planner 
            niche={setupData?.niche || ''} 
            savedPrompts={savedPrompts} 
            onGeneratePrompt={(topic, hookStyle) => {
              if (!setupData) return;
              setCustomTopic(topic);
              setCurrentView('studio');
              // Auto-generate it!
              setTimeout(() => {
                generatePrompts(topic);
              }, 100);
            }} 
          />
        ) : (
          isEditingSetup ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SetupForm onComplete={handleSetupComplete} initialData={setupData} />
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 flex flex-col items-center">
              
              {/* Control Panel */}
              <div className="w-full max-w-4xl bg-gray-900 border border-gray-800 p-8 mb-12 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-white">Mau bikin konten apa hari ini?</h2>
                
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Ketik ide/topik spesifik di sini, atau biarin AI mikir..."
                    className="flex-1 w-full p-4 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-base text-white transition-all"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    disabled={isGenerating}
                  />
                  <button
                    onClick={() => generatePrompts()}
                    disabled={isGenerating}
                    className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white text-base rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap transition-all shadow-lg shadow-purple-500/20"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                    {isGenerating ? 'Generating...' : 'Buat Prompt'}
                  </button>
                </div>

                <div className="border-t border-gray-800 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-gray-400">Atau pilih dari ide AI untuk niche <span className="bg-gray-800 text-purple-400 px-2 py-1 rounded-md ml-1 font-semibold">{setupData.niche}</span>:</p>
                      {topicsApiStatus && <p className="text-xs font-semibold text-purple-400/80 mt-1">{topicsApiStatus}</p>}
                    </div>
                    <button
                      onClick={getTopicIdeas}
                      disabled={isGeneratingTopics || isGenerating}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 disabled:opacity-50 transition-colors"
                    >
                      {isGeneratingTopics ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Refresh Ide
                    </button>
                  </div>

                  {topicIdeas && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {topicIdeas.map((idea, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setCustomTopic(idea.title);
                            generatePrompts(idea.title);
                          }}
                          className="text-left p-5 bg-gray-800 border border-gray-700 hover:border-purple-500/50 rounded-xl transition-all group"
                          disabled={isGenerating}
                        >
                          <h5 className="font-bold text-white text-base mb-2 group-hover:text-purple-400 transition-colors">{idea.title}</h5>
                          <p className="text-sm font-medium text-gray-400 leading-relaxed line-clamp-2">{idea.reason}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Results loading state */}
              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                  <div className="text-center">
                    <p className="font-semibold text-lg animate-pulse text-white">{generatingStatus}</p>
                    {apiStatus && <p className="text-sm font-medium text-purple-400/80 mt-2">{apiStatus}</p>}
                  </div>
                </div>
              )}

              {/* Result */}
              {result && !isGenerating && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <PromptResult data={result} onSave={handleSaveResult} isSaved={isCurrentResultSaved} />
                </div>
              )}
            </div>
          )
        )}
      </main>

      <footer className="w-full text-center py-8 text-gray-500 text-sm font-medium mt-auto">
        &copy; 2024 - 2026 <a href="https://redi.web.id" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">ReDi (Revolusi DIgital)</a>
      </footer>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
