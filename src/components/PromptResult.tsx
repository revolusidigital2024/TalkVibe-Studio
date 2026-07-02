import React from 'react';
import { PromptGenerationResponse } from '../types';
import { Copy, FileVideo, MessageSquare, Video, Save } from 'lucide-react';

interface PromptResultProps {
  data: PromptGenerationResponse;
  onSave?: () => void;
  isSaved?: boolean;
}

export function PromptResult({ data, onSave, isSaved }: PromptResultProps) {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 mt-4 pb-12">
      {/* Header Info */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3 text-white">
          <FileVideo className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-bold">VEO Script</h3>
        </div>
        <div className="flex items-center flex-wrap gap-2 text-sm font-semibold text-gray-300">
          <span className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">{data.niche}</span>
          <span className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">{data.parts_count} Parts</span>
          {onSave && (
            <button 
              onClick={onSave}
              disabled={isSaved}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${isSaved ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
            >
              <Save className="w-4 h-4" />
              {isSaved ? 'Tersimpan' : 'Simpan ke Dashboard'}
            </button>
          )}
        </div>
      </div>

      {/* Dialogue Preview Section */}
      <div className="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 mb-6 text-white">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          <h4 className="text-lg font-bold">Dialogue Preview</h4>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {data.dialogue.map((text, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-2 md:gap-4">
              <div className="flex-shrink-0 w-20 text-sm font-bold tracking-wider text-purple-400 md:pt-4">
                Part {i + 1}
              </div>
              <p className="text-gray-200 font-medium leading-relaxed text-sm bg-gray-800 p-4 rounded-xl border border-gray-700 flex-1">
                "{text}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Prompts Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2 text-white px-2">
          <Video className="w-5 h-5 text-purple-400" />
          <h4 className="text-lg font-bold">VEO Prompts</h4>
        </div>
        
        {data.prompts.map((prompt, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <span className="font-semibold text-gray-200 text-sm">
                {i === 0 ? 'PROMPT 1 (Hook)' : i === data.prompts.length - 1 ? 'PROMPT TERAKHIR (Closing)' : `PROMPT TENGAH (Part ${i + 1})`}
              </span>
              <button
                onClick={() => copyToClipboard(prompt, i)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 rounded-lg flex items-center gap-2 transition-colors border border-gray-700"
              >
                <Copy className="w-4 h-4" />
                {copiedIndex === i ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-6">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed bg-gray-950 p-4 rounded-xl border border-gray-800 overflow-x-auto">
                {prompt}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
