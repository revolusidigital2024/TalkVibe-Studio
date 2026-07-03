import React, { useState, useEffect } from 'react';
import { SavedPrompt, ContentPlanResponse } from '../types';
import { CalendarDays, Loader2, Sparkles, Plus, CheckCircle2, FileText, Wand2 } from 'lucide-react';
import { fetchWithKeyRotation } from '../utils/api';

interface PlannerProps {
  niche: string;
  savedPrompts: SavedPrompt[];
  onGeneratePrompt: (topic: string, hookStyle: string) => void;
}

export function Planner({ niche, savedPrompts, onGeneratePrompt }: PlannerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('Membuat planner...');
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [plan, setPlan] = useState<ContentPlanResponse | null>(null);

  useEffect(() => {
    if (niche) {
      const saved = localStorage.getItem(`redi_planner_${niche}`);
      if (saved) {
        try {
          setPlan(JSON.parse(saved));
        } catch(e) {}
      } else {
        setPlan(null);
      }
    }
  }, [niche]);

  const generatePlanner = async () => {
    setIsGenerating(true);
    setStatus('Merancang konten 7 hari...');
    try {
      const history = savedPrompts.map(p => p.topic || p.result.niche);
      const data = await fetchWithKeyRotation('/api/generate-planner', { 
        niche, 
        history,
        days: 7 
      }, setApiStatus);
      
      setPlan(data);
      localStorage.setItem(`redi_planner_${niche}`, JSON.stringify(data));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal membuat planner.');
    } finally {
      setIsGenerating(false);
      setApiStatus(null);
    }
  };

  const hasPlan = plan && plan.plan.length > 0;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-purple-400" />
            Konten Planner 7 Hari
          </h2>
          <p className="text-gray-400 text-sm font-medium">
            Rencanakan ide konten untuk <span className="text-purple-400 font-bold">{niche || 'niche kamu'}</span> agar nggak pusing mikir tiap hari.
          </p>
        </div>
        <button
          onClick={generatePlanner}
          disabled={isGenerating || !niche}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {isGenerating ? 'Memproses...' : hasPlan ? 'Generate Ulang' : 'Buat Planner'}
        </button>
      </div>

      {!niche && (
        <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <p className="text-orange-400 font-medium">Kamu harus setup Profil (Pilih Niche) dulu di tab Studio sebelum bisa buat Planner.</p>
        </div>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          <div className="text-center">
            <p className="font-semibold text-lg animate-pulse text-white">{status}</p>
            {apiStatus && <p className="text-sm font-medium text-purple-400/80 mt-2">{apiStatus}</p>}
          </div>
        </div>
      )}

      {!isGenerating && hasPlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plan!.plan.map((dayPlan, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
              <div className="bg-gray-800/50 px-5 py-3 border-b border-gray-800 flex justify-between items-center">
                <span className="font-bold text-purple-400">Hari {dayPlan.day}</span>
              </div>
              
              <div className="p-5 flex-1 flex flex-col gap-6">
                {/* Content 1 */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-white text-sm leading-snug">{dayPlan.content1.topic}</h4>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400"><span className="text-gray-500 font-semibold">Angle:</span> {dayPlan.content1.hook_angle}</p>
                    <p className="text-xs text-gray-400"><span className="text-gray-500 font-semibold">Tujuan:</span> {dayPlan.content1.reason}</p>
                  </div>
                  <button 
                    onClick={() => onGeneratePrompt(dayPlan.content1.topic, dayPlan.content1.hook_angle)}
                    className="w-full mt-2 py-2 bg-gray-800 hover:bg-purple-600 text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-gray-700 hover:border-transparent"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Buat Script & Prompt
                  </button>
                </div>

                <div className="h-px w-full bg-gray-800"></div>

                {/* Content 2 */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-white text-sm leading-snug">{dayPlan.content2.topic}</h4>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-400"><span className="text-gray-500 font-semibold">Angle:</span> {dayPlan.content2.hook_angle}</p>
                    <p className="text-xs text-gray-400"><span className="text-gray-500 font-semibold">Tujuan:</span> {dayPlan.content2.reason}</p>
                  </div>
                  <button 
                    onClick={() => onGeneratePrompt(dayPlan.content2.topic, dayPlan.content2.hook_angle)}
                    className="w-full mt-2 py-2 bg-gray-800 hover:bg-purple-600 text-gray-300 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-gray-700 hover:border-transparent"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Buat Script & Prompt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isGenerating && !hasPlan && niche && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 mb-6 bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-800 shadow-lg shadow-purple-500/10">
            <CalendarDays className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">Belum ada planner</h2>
          <p className="text-gray-400 font-medium">Klik tombol di atas untuk merencanakan 7 hari konten pertamamu.</p>
        </div>
      )}
    </div>
  );
}
