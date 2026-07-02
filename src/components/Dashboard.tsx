import React from 'react';
import { SavedPrompt } from '../types';
import { PromptResult } from './PromptResult';
import { Trash2, Calendar, FileText, ArrowLeft } from 'lucide-react';

interface DashboardProps {
  savedPrompts: SavedPrompt[];
  onDelete: (id: string) => void;
}

export function Dashboard({ savedPrompts, onDelete }: DashboardProps) {
  const [selectedPromptId, setSelectedPromptId] = React.useState<string | null>(null);

  if (savedPrompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <div className="w-20 h-20 mb-6 bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-800 shadow-lg shadow-purple-500/10">
          <FileText className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-white">Dashboard Kosong</h2>
        <p className="text-gray-400 font-medium">Lu belum punya ide yang disimpen. Balik ke Studio buat generate dulu bro!</p>
      </div>
    );
  }

  const selectedPrompt = savedPrompts.find(p => p.id === selectedPromptId);

  return (
    <div className="animate-in fade-in duration-500">
      {selectedPrompt ? (
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedPromptId(null)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-xl font-semibold text-sm transition-colors border border-gray-800"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </button>
          
          <div className="bg-gray-900 p-6 border border-gray-800 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-white">Topik: {selectedPrompt.topic || selectedPrompt.result.niche}</h2>
            <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {new Date(selectedPrompt.date).toLocaleString()}</span>
            </div>
          </div>

          <PromptResult data={selectedPrompt.result} />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Saved Ideas</h2>
            <span className="px-3 py-1 bg-gray-800 text-gray-300 text-xs font-semibold rounded-lg border border-gray-700">
              {savedPrompts.length} Tersimpan
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPrompts.map((prompt) => (
              <div key={prompt.id} className="bg-gray-900 p-6 border border-gray-800 rounded-2xl flex flex-col justify-between hover:border-purple-500/50 transition-colors shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-xs font-semibold border border-purple-500/20">{prompt.result.niche}</span>
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5"/> {new Date(prompt.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold leading-snug mb-3 text-white line-clamp-2">{prompt.topic || `Ide konten ${prompt.result.niche}`}</h3>
                  <p className="text-sm font-medium text-gray-400 mb-6">{prompt.result.parts_count} Part Video</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedPromptId(prompt.id)}
                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-sm transition-colors border border-gray-700"
                  >
                    Lihat Script
                  </button>
                  <button 
                    onClick={() => onDelete(prompt.id)}
                    className="p-2.5 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-colors border border-gray-700 hover:border-red-500/30"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
