
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIRecommendation = async (mood: string, products: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `用户当前处于: "${mood}" 的氛围中。基于以下菜单: ${JSON.stringify(products.map(p => ({name: p.name, desc: p.description})))}。请用中文推荐两款最合适的单品，并给出一句简短的推荐理由。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              reason: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Recommendation failed", error);
    return [];
  }
};
