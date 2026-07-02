export const fetchWithKeyRotation = async (url: string, body: any, onKeyStatus?: (msg: string) => void) => {
  const keysString = localStorage.getItem('gemini_api_keys') || '';
  const keys = keysString.split(/[\n,]/).map(k => k.trim()).filter(Boolean);
  
  if (keys.length === 0) {
    throw new Error('API Key belum diatur. Silakan atur di pengaturan.');
  }

  let lastError = null;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    
    // Notify about key usage/rotation
    if (onKeyStatus) {
      if (i > 0) {
        onKeyStatus(`Menggunakan Key ${i + 1}...`);
      } else if (keys.length > 1) {
        onKeyStatus(`Menggunakan Key 1...`);
      } else {
        onKeyStatus(''); // Clear status if only 1 key
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': key
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        if (response.status === 429 || response.status === 503) {
          if (i < keys.length - 1) {
            if (onKeyStatus) onKeyStatus(`Key ${i + 1} limit/sibuk. Ganti ke Key ${i + 2}...`);
            await new Promise(r => setTimeout(r, 1500)); // Delay so user can read it
            continue;
          } else {
            throw new Error(`Semua API Key (${keys.length} key) limit atau sibuk saat ini. Coba lagi nanti.`);
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Terjadi kesalahan pada server');
        }
      }

      if (onKeyStatus) onKeyStatus(''); // Clear on success
      return await response.json();
    } catch (err: any) {
      if (err.message.includes('Semua API Key') || err.message.includes('Terjadi kesalahan') || err.message.includes('API Key belum diatur')) {
        if (onKeyStatus) onKeyStatus('');
        throw err;
      }
      lastError = err;
      if (i < keys.length - 1) {
         if (onKeyStatus) onKeyStatus(`Key ${i + 1} error. Ganti ke Key ${i + 2}...`);
         await new Promise(r => setTimeout(r, 1500));
         continue;
      }
    }
  }
  if (onKeyStatus) onKeyStatus('');
  throw lastError || new Error('Gagal terhubung ke API');
};
