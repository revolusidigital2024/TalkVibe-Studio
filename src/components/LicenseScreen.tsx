import React, { useState } from 'react';
import { KeyRound, Loader2, ArrowRight } from 'lucide-react';
import { fetchWithKeyRotation } from '../utils/api';

interface LicenseScreenProps {
  onSuccess: () => void;
}

export function LicenseScreen({ onSuccess }: LicenseScreenProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    setIsValidating(true);
    setError('');

    try {
      // We use a regular fetch here instead of fetchWithKeyRotation because this doesn't use Gemini API keys
      const res = await fetch('/api/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Lisensi tidak valid.');
      }

      if (data.valid) {
        localStorage.setItem('redi_license_key', licenseKey);
        onSuccess();
      } else {
        throw new Error('Lisensi tidak valid atau sudah tidak aktif.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memvalidasi lisensi.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600 rounded-full blur-[80px] opacity-20 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-600 rounded-full blur-[80px] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-gray-700">
            <KeyRound className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Aktivasi Lisensi</h1>
          <p className="text-gray-400 text-sm">
            Masukkan lisensi lifetime Anda untuk mulai menggunakan generator konten ini.
          </p>
        </div>

        <form onSubmit={handleValidate} className="relative z-10 flex flex-col gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">License Key</label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-center"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isValidating || !licenseKey.trim()}
            className="w-full py-3.5 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Memvalidasi...
              </>
            ) : (
              <>
                Aktivasi Sekarang <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-gray-500 text-sm font-medium mt-8">
        &copy; 2024 - 2026 <a href="https://redi.web.id" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">ReDi (Revolusi DIgital)</a>
      </p>
    </div>
  );
}
