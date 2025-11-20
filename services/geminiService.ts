import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateDailyIdea = async (date: Date): Promise<string> => {
  try {
    const ai = getClient();
    const dateString = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const prompt = `
      I am a daily vlogger. The date is ${dateString}.
      Generate a very short, catchy, and intriguing title (max 6 words) for my vlog thumbnail today.
      It should be vague but interesting, or related to a historical event on this day, or just a cool "daily vibe" phrase.
      Do not use quotes.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a creative YouTube strategist specializing in click-worthy but minimal thumbnails.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{}');
    return json.title || "Daily Story";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Daily Story";
  }
};
