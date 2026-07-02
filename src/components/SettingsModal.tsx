import React, { useState, useEffect } from 'react';
import { X, Key } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [keys, setKeys] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedKeys = localStorage.getItem('gemini_api_keys') || '';
      setKeys(savedKeys);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('gemini_api_keys', keys);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
              <Key className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg">API Key Setup</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-800 hover:text-white p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-400 leading-relaxed font-medium">
            Masukkan Gemini API Key kamu di sini. Kamu bisa masukin lebih dari satu key buat ngehindarin limit (pisahkan dengan enter atau koma).
          </p>
          
          <textarea
            className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm text-gray-300 font-mono resize-y min-h-[120px] transition-all"
            placeholder="AIzaSy...&#10;AIzaSy...&#10;AIzaSy..."
            value={keys}
            onChange={(e) => setKeys(e.target.value)}
          />
          
          <button
            onClick={handleSave}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-purple-500/20"
          >
            Simpan Keys
          </button>
        </div>
      </div>
    </div>
  );
}
