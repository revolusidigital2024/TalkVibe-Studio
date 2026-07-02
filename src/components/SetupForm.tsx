import React, { useState, useEffect } from 'react';
import { NICHES, PARTS_OPTIONS, HOOK_STYLES } from '../types';
import { Camera, Settings2, User, Mic, Wand2, Loader2, RefreshCw } from 'lucide-react';
import { fetchWithKeyRotation } from '../utils/api';

const GENDER_OPTIONS = ['Pria', 'Wanita'];
const ETHNIC_OPTIONS = ['Asia Tenggara (Indonesia)', 'Asia Timur', 'Kaukasia (Bule)', 'Timur Tengah', 'Afrika', 'Lainnya (Custom)'];
const AGE_OPTIONS = ['20-an', '30-an', '40-an', '50-an'];
const HAIR_OPTIONS_MAP: Record<string, string[]> = {
  Pria: ['Rapi pendek', 'Cepak (Buzz cut)', 'Gondrong', 'Ikat rapi (Man bun)', 'Lainnya (Custom)'],
  Wanita: ['Messy bun', 'Ikat rapi (Ponytail)', 'Natural bergelombang', 'Hijab kasual', 'Hijab formal', 'Lainnya (Custom)']
};
const CLOTHING_OPTIONS_MAP: Record<string, string[]> = {
  Pria: ['Kaos polos (Kasual)', 'Kemeja flanel', 'Hoodie gelap', 'Jas/Blazer (Formal)', 'Kemeja rapi (Smart casual)', 'Lainnya (Custom)'],
  Wanita: ['Kaos polos (Kasual)', 'Hoodie gelap', 'Gaun elegan', 'Blouse rapi (Smart casual)', 'Blazer wanita (Formal)', 'Lainnya (Custom)']
};
const LOCATION_OPTIONS = ['Podcast studio modern', 'Cafe remang-remang (Moody)', 'Ruang tamu minimalis', 'Outdoor malam hari (City lights)', 'Perpustakaan klasik', 'Lainnya (Custom)'];

const PITCH_OPTIONS = ['Rendah (Deep)', 'Sedang', 'Tinggi', 'Lainnya (Custom)'];
const PACE_OPTIONS = ['Lambat & Tenang', 'Sedang / Natural', 'Cepat & Enerjik', 'Lainnya (Custom)'];
const TEXTURE_OPTIONS = ['Bersih (Clear)', 'Agak Serak (Husky)', 'Berat (Ngebass)', 'Lembut (Breathy)', 'Lainnya (Custom)'];
const STYLE_OPTIONS = ['Santai (Lu-Gua)', 'Formal (Saya-Anda)', 'Kasual sopan (Aku-Kamu)', 'Tegas (Motivator)', 'Lainnya (Custom)'];

interface SetupFormProps {
  onComplete: (data: { characterLock: string; voiceLock: string; niche: string; parts: number; hookStyle: string }) => void;
}

export function SetupForm({ onComplete }: SetupFormProps) {
  // Dropdown States - Character
  const [charGender, setCharGender] = useState(GENDER_OPTIONS[0]);
  const [charEthnic, setCharEthnic] = useState(ETHNIC_OPTIONS[0]);
  const [charEthnicCustom, setCharEthnicCustom] = useState('');
  const [charAge, setCharAge] = useState(AGE_OPTIONS[1]);
  const [charHair, setCharHair] = useState(HAIR_OPTIONS_MAP['Pria'][0]);
  const [charHairCustom, setCharHairCustom] = useState('');
  const [charClothing, setCharClothing] = useState(CLOTHING_OPTIONS_MAP['Pria'][0]);
  const [charClothingCustom, setCharClothingCustom] = useState('');
  const [charLocation, setCharLocation] = useState(LOCATION_OPTIONS[0]);
  const [charLocationCustom, setCharLocationCustom] = useState('');
  const [charCustom, setCharCustom] = useState('');

  // Dropdown States - Voice
  const [voicePitch, setVoicePitch] = useState(PITCH_OPTIONS[1]);
  const [voicePitchCustom, setVoicePitchCustom] = useState('');
  const [voicePace, setVoicePace] = useState(PACE_OPTIONS[1]);
  const [voicePaceCustom, setVoicePaceCustom] = useState('');
  const [voiceTexture, setVoiceTexture] = useState(TEXTURE_OPTIONS[0]);
  const [voiceTextureCustom, setVoiceTextureCustom] = useState('');
  const [voiceStyle, setVoiceStyle] = useState(STYLE_OPTIONS[0]);
  const [voiceStyleCustom, setVoiceStyleCustom] = useState('');

  // Final Output States
  const [characterLock, setCharacterLock] = useState('');
  const [voiceLock, setVoiceLock] = useState('');
  
  // Manual Override Flags
  const [isManualChar, setIsManualChar] = useState(false);
  const [isManualVoice, setIsManualVoice] = useState(false);

  const [niche, setNiche] = useState(NICHES[0]);
  const [parts, setParts] = useState(2);
  const [hookStyle, setHookStyle] = useState(HOOK_STYLES[0]);
  const [isEnhancingCharacter, setIsEnhancingCharacter] = useState(false);
  const [isEnhancingVoice, setIsEnhancingVoice] = useState(false);
  
  const [enhanceStatus, setEnhanceStatus] = useState<string | null>(null);

  // Sync when Gender changes
  useEffect(() => {
    setCharHair(HAIR_OPTIONS_MAP[charGender][0]);
    setCharHairCustom('');
    setCharClothing(CLOTHING_OPTIONS_MAP[charGender][0]);
    setCharClothingCustom('');
  }, [charGender]);

  // Sync Dropdowns to Textareas if not manual
  useEffect(() => {
    if (!isManualChar) {
      const finalEthnic = charEthnic === 'Lainnya (Custom)' ? (charEthnicCustom || '...') : charEthnic.toLowerCase();
      const finalHair = charHair === 'Lainnya (Custom)' ? (charHairCustom || '...') : charHair.toLowerCase();
      const finalClothing = charClothing === 'Lainnya (Custom)' ? (charClothingCustom || '...') : charClothing.toLowerCase();
      const finalLoc = charLocation === 'Lainnya (Custom)' ? (charLocationCustom || '...') : charLocation.toLowerCase();
      
      setCharacterLock(`${charGender} etnis/wajah ${finalEthnic} usia ${charAge}, gaya rambut ${finalHair}, memakai ${finalClothing}, lokasi di ${finalLoc}.${charCustom ? ' Tambahan: ' + charCustom : ''}`);
    }
  }, [charGender, charEthnic, charEthnicCustom, charAge, charHair, charHairCustom, charClothing, charClothingCustom, charLocation, charLocationCustom, charCustom, isManualChar]);

  useEffect(() => {
    if (!isManualVoice) {
      const finalPitch = voicePitch === 'Lainnya (Custom)' ? (voicePitchCustom || '...') : voicePitch.toLowerCase();
      const finalPace = voicePace === 'Lainnya (Custom)' ? (voicePaceCustom || '...') : voicePace.toLowerCase();
      const finalTexture = voiceTexture === 'Lainnya (Custom)' ? (voiceTextureCustom || '...') : voiceTexture.toLowerCase();
      const finalStyle = voiceStyle === 'Lainnya (Custom)' ? (voiceStyleCustom || '...') : voiceStyle.toLowerCase();

      setVoiceLock(`Suara dengan pitch ${finalPitch}, tempo ${finalPace}, tekstur ${finalTexture}, gaya bahasa ${finalStyle}.`);
    }
  }, [voicePitch, voicePitchCustom, voicePace, voicePaceCustom, voiceTexture, voiceTextureCustom, voiceStyle, voiceStyleCustom, isManualVoice]);

  const enhancePrompt = async (type: 'character' | 'voice') => {
    const text = type === 'character' ? characterLock : voiceLock;
    if (!text) return;
    
    const setEnhancing = type === 'character' ? setIsEnhancingCharacter : setIsEnhancingVoice;
    const setter = type === 'character' ? setCharacterLock : setVoiceLock;
    const setManual = type === 'character' ? setIsManualChar : setIsManualVoice;
    
    setEnhancing(true);
    setEnhanceStatus(null);
    try {
      const data = await fetchWithKeyRotation('/api/enhance-prompt', { type, text }, (msg) => {
        setEnhanceStatus(msg);
      });
      setter(data.enhanced);
      setManual(true); // Lock it from dropdown changes
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal menyempurnakan prompt.');
    } finally {
      setEnhancing(false);
      setEnhanceStatus(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterLock || !voiceLock) return;
    onComplete({ characterLock, voiceLock, niche, parts, hookStyle });
  };

  const inputClasses = "w-full p-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm text-white transition-all";

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden mt-8">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Settings2 className="w-7 h-7 text-purple-400" />
          <h2 className="text-2xl font-bold tracking-tight text-white">Setup Awal Studio</h2>
        </div>
        <p className="text-gray-400 mt-2 text-sm leading-relaxed">
          Kunci karakter dan suara lu di sini (cuma sekali per sesi). Pilih dari opsi yang ada atau tulis manual.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-10">
        
        {/* CHARACTER SECTION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-200">Karakter Visual</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-gray-400 mb-1 block">Gender</span>
              <select className={inputClasses} value={charGender} onChange={(e) => { setCharGender(e.target.value); setIsManualChar(false); }}>
                {GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-400 mb-1 block">Etnis / Wajah</span>
              <select className={inputClasses} value={charEthnic} onChange={(e) => { setCharEthnic(e.target.value); setIsManualChar(false); }}>
                {ETHNIC_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {charEthnic === 'Lainnya (Custom)' && (
                <input type="text" placeholder="Ketik etnis..." className={`mt-2 ${inputClasses}`} value={charEthnicCustom} onChange={e => { setCharEthnicCustom(e.target.value); setIsManualChar(false); }} />
              )}
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-400 mb-1 block">Usia</span>
              <select className={inputClasses} value={charAge} onChange={(e) => { setCharAge(e.target.value); setIsManualChar(false); }}>
                {AGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-400 mb-1 block">Rambut</span>
              <select className={inputClasses} value={charHair} onChange={(e) => { setCharHair(e.target.value); setIsManualChar(false); }}>
                {HAIR_OPTIONS_MAP[charGender].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {charHair === 'Lainnya (Custom)' && (
                <input type="text" placeholder="Ketik gaya rambut..." className={`mt-2 ${inputClasses}`} value={charHairCustom} onChange={e => { setCharHairCustom(e.target.value); setIsManualChar(false); }} />
              )}
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-400 mb-1 block">Pakaian</span>
              <select className={inputClasses} value={charClothing} onChange={(e) => { setCharClothing(e.target.value); setIsManualChar(false); }}>
                {CLOTHING_OPTIONS_MAP[charGender].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {charClothing === 'Lainnya (Custom)' && (
                <input type="text" placeholder="Ketik pakaian..." className={`mt-2 ${inputClasses}`} value={charClothingCustom} onChange={e => { setCharClothingCustom(e.target.value); setIsManualChar(false); }} />
              )}
            </label>
            <label className="block col-span-2">
              <span className="text-xs font-semibold text-gray-400 mb-1 block">Lokasi / Background</span>
              <select className={inputClasses} value={charLocation} onChange={(e) => { setCharLocation(e.target.value); setIsManualChar(false); }}>
                {LOCATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {charLocation === 'Lainnya (Custom)' && (
                <input type="text" placeholder="Ketik lokasi/background..." className={`mt-2 ${inputClasses}`} value={charLocationCustom} onChange={e => { setCharLocationCustom(e.target.value); setIsManualChar(false); }} />
              )}
            </label>
          </div>
          
          <label className="block">
            <span className="text-xs font-semibold text-gray-400 mb-1 block">Detail Tambahan (Opsional)</span>
            <input 
              type="text" 
              className={inputClasses} 
              placeholder="Contoh: Pakai kacamata hitam, minum kopi..."
              value={charCustom}
              onChange={(e) => { setCharCustom(e.target.value); setIsManualChar(false); }}
            />
          </label>

          <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-300">Preview Character</span>
              <div className="flex items-center gap-2">
                {isManualChar && (
                  <button type="button" onClick={() => setIsManualChar(false)} className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg flex items-center gap-1 transition-colors" title="Kembalikan ke hasil dropdown">
                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => enhancePrompt('character')}
                  disabled={!characterLock || isEnhancingCharacter}
                  className="px-3 py-1.5 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  {isEnhancingCharacter ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  {isEnhancingCharacter ? 'Enhancing...' : 'Magic Enhance (English)'}
                </button>
              </div>
            </div>
            <textarea
              className={`w-full p-4 rounded-xl outline-none text-sm resize-none transition-all ${isManualChar ? 'bg-purple-900/20 border-2 border-purple-500/50 text-purple-100' : 'bg-gray-800 border-2 border-transparent focus:border-purple-500 text-white'}`}
              rows={3}
              value={characterLock}
              onChange={(e) => { setCharacterLock(e.target.value); setIsManualChar(true); }}
              disabled={isEnhancingCharacter}
              required
            />
            {isEnhancingCharacter && enhanceStatus && (
              <p className="text-xs font-semibold text-purple-400 mt-2 text-right">{enhanceStatus}</p>
            )}
          </div>
        </div>

        <hr className="border-gray-800" />

        {/* VOICE SECTION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-200">Karakteristik Suara</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-gray-400 mb-1 block">Pitch (Tinggi/Rendah)</span>
              <select className={inputClasses} value={voicePitch} onChange={(e) => { setVoicePitch(e.target.value); setIsManualVoice(false); }}>
                {PITCH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {voicePitch === 'Lainnya (Custom)' && (
                <input type="text" placeholder="Ketik pitch..." className={`mt-2 ${inputClasses}`} value={voicePitchCustom} onChange={e => { setVoicePitchCustom(e.target.value); setIsManualVoice(false); }} />
              )}
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-400 mb-1 block">Tempo Bicara</span>
              <select className={inputClasses} value={voicePace} onChange={(e) => { setVoicePace(e.target.value); setIsManualVoice(false); }}>
                {PACE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {voicePace === 'Lainnya (Custom)' && (
                <input type="text" placeholder="Ketik tempo..." className={`mt-2 ${inputClasses}`} value={voicePaceCustom} onChange={e => { setVoicePaceCustom(e.target.value); setIsManualVoice(false); }} />
              )}
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-400 mb-1 block">Tekstur Suara</span>
              <select className={inputClasses} value={voiceTexture} onChange={(e) => { setVoiceTexture(e.target.value); setIsManualVoice(false); }}>
                {TEXTURE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {voiceTexture === 'Lainnya (Custom)' && (
                <input type="text" placeholder="Ketik tekstur..." className={`mt-2 ${inputClasses}`} value={voiceTextureCustom} onChange={e => { setVoiceTextureCustom(e.target.value); setIsManualVoice(false); }} />
              )}
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-400 mb-1 block">Gaya Bahasa</span>
              <select className={inputClasses} value={voiceStyle} onChange={(e) => { setVoiceStyle(e.target.value); setIsManualVoice(false); }}>
                {STYLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {voiceStyle === 'Lainnya (Custom)' && (
                <input type="text" placeholder="Ketik gaya bahasa..." className={`mt-2 ${inputClasses}`} value={voiceStyleCustom} onChange={e => { setVoiceStyleCustom(e.target.value); setIsManualVoice(false); }} />
              )}
            </label>
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-300">Preview Voice</span>
              <div className="flex items-center gap-2">
                {isManualVoice && (
                  <button type="button" onClick={() => setIsManualVoice(false)} className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg flex items-center gap-1 transition-colors" title="Kembalikan ke hasil dropdown">
                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => enhancePrompt('voice')}
                  disabled={!voiceLock || isEnhancingVoice}
                  className="px-3 py-1.5 text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  {isEnhancingVoice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  {isEnhancingVoice ? 'Enhancing...' : 'Magic Enhance'}
                </button>
              </div>
            </div>
            <textarea
              className={`w-full p-4 rounded-xl outline-none text-sm resize-none transition-all ${isManualVoice ? 'bg-purple-900/20 border-2 border-purple-500/50 text-purple-100' : 'bg-gray-800 border-2 border-transparent focus:border-purple-500 text-white'}`}
              rows={2}
              value={voiceLock}
              onChange={(e) => { setVoiceLock(e.target.value); setIsManualVoice(true); }}
              disabled={isEnhancingVoice}
              required
            />
            {isEnhancingVoice && enhanceStatus && (
              <p className="text-xs font-semibold text-purple-400 mt-2 text-right">{enhanceStatus}</p>
            )}
          </div>
        </div>

        <hr className="border-gray-800" />

        {/* SETTINGS SECTION */}
        <div className="space-y-4 pb-2">
          <label className="block">
            <span className="text-xs font-semibold text-gray-400 mb-2 block">Pilih Niche</span>
            <select
              className={inputClasses}
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            >
              {NICHES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-400 mb-2 block">Gaya Hook / Intro</span>
            <select
              className={inputClasses}
              value={hookStyle}
              onChange={(e) => setHookStyle(e.target.value)}
            >
              {HOOK_STYLES.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-400 mb-2 block">Jumlah Part Video</span>
            <div className="flex gap-4">
              {PARTS_OPTIONS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setParts(p)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${
                    parts === p
                      ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  {p} Part {p === 2 ? '(~16s)' : p === 3 ? '(~24s)' : '(~32s)'}
                </button>
              ))}
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={!characterLock || !voiceLock}
          className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20"
        >
          <Camera className="w-5 h-5" />
          Simpan Profil & Lanjut
        </button>
      </form>
    </div>
  );
}
