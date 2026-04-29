const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export const sendToGemini = async (text, imageBase64DataUri) => {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text || null,
      imageBase64: imageBase64DataUri || null
    })
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id || Date.now().toString(),
    role: 'bot',
    text: data.text,
    attachedImage: null,
    timestamp: new Date().toISOString(),
    outfitRecommendation: data.outfitRecommendation
  };
};

export const analyzeInspirationImage = async (imageBase64DataUri) => {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: imageBase64DataUri })
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.statusText}`);
  }

  return await response.json();
};
