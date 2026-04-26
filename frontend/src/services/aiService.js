import { pdpData } from '../data/pdpData';

const SYSTEM_PROMPT = `You are Style-alyst, a high-end boutique personal stylist.
Your goal is to analyze user queries (and optionally images) and provide a Complete the Look outfit recommendation.
The user is currently viewing this item on JCPenney: 
Brand: ${pdpData.brand.name}
Product: ${pdpData.name}
Price: $14.99 (Sale)
Description: ${pdpData.meta.description}

You MUST return your response as a valid JSON object wrapped in markdown \`\`\`json ... \`\`\` tags.
The JSON must adhere exactly to this schema:
{
  "outfitId": "string (generate a random id)",
  "occasion": "string (e.g. Summer Wedding, Casual Friday)",
  "stylistReasoning": "string (a friendly, stylish explanation of why these pieces work together)",
  "totalPriceEstimate": number,
  "items": {
    "top": { "productId": "str", "name": "str", "brand": "str", "price": num, "imageUrl": "str" },
    "bottom": { "productId": "str", "name": "str", "brand": "str", "price": num, "imageUrl": "str" },
    "shoes": { "productId": "str", "name": "str", "brand": "str", "price": num, "imageUrl": "str" },
    "accessory": { "productId": "str", "name": "str", "brand": "str", "price": num, "imageUrl": "str" }
  }
}
Make sure to include the item they are currently viewing as one of the items if it fits the query.
Use realistic JCPenney-style placeholder image URLs (e.g. https://jcpenney.scene7.com/is/image/JCPenney/...) if you don't know real ones.`;

export const sendToGemini = async (text, imageBase64DataUri) => {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    throw new Error("No API Key provided. Please set your Gemini API key in settings.");
  }

  const parts = [];
  
  if (text) {
    parts.push({ text: `${SYSTEM_PROMPT}\n\nUSER REQUEST:\n${text}` });
  } else {
    parts.push({ text: `${SYSTEM_PROMPT}\n\nUSER REQUEST:\nPlease build an outfit around this image.` });
  }

  if (imageBase64DataUri) {
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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that.";

    let outfitRecommendation = null;
    let botText = "Here is my recommendation based on your request!";

    // Robust JSON extractor
    const jsonMatch = rawText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        outfitRecommendation = JSON.parse(jsonMatch[1]);
        // If the AI included conversational text outside the JSON block, we could extract it,
        // but typically we'll just rely on the stylistReasoning inside the JSON.
        botText = outfitRecommendation.stylistReasoning || botText;
      } catch (e) {
        console.error("Failed to parse JSON from LLM:", e);
      }
    } else {
      // Fallback if no markdown block was used but raw JSON was returned
      try {
        if (rawText.trim().startsWith('{') && rawText.trim().endsWith('}')) {
          outfitRecommendation = JSON.parse(rawText.trim());
          botText = outfitRecommendation.stylistReasoning || botText;
        } else {
           botText = rawText;
        }
      } catch (e) {
        botText = rawText;
      }
    }

    return {
      id: Date.now().toString(),
      role: 'bot',
      text: null, // We'll let the UI render the structured outfit carousel instead of plain text if recommendation exists
      attachedImage: null,
      timestamp: new Date().toISOString(),
      outfitRecommendation: outfitRecommendation
    };

  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};
