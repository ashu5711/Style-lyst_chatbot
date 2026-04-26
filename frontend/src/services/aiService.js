export const sendToGemini = async (text, imageBase64DataUri) => {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    throw new Error("No API Key provided. Please set your Gemini API key in settings.");
  }

  const parts = [];
  
  if (text) {
    parts.push({ text });
  } else {
    parts.push({ text: "Perform a basic color, texture, and silhouette analysis of this item." });
  }

  if (imageBase64DataUri) {
    // Extract base64 without the data URI prefix
    const base64Data = imageBase64DataUri.split(',')[1];
    const mimeType = imageBase64DataUri.split(';')[0].split(':')[1];
    
    parts.push({
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: base64Data
      }
    });
  }

  const requestBody = {
    contents: [
      {
        parts: parts
      }
    ]
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that.";

    return {
      id: Date.now().toString(),
      role: 'bot',
      text: botText,
      attachedImage: null,
      timestamp: new Date().toISOString(),
      outfitRecommendation: null // We will map JSON structured output here in Part 9
    };

  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};
