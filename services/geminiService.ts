
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FoodLogEntry, Recipe, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFood = async (
  input: string | { data: string; mimeType: string },
  isImage: boolean = false
): Promise<{ 
  success: boolean; 
  data?: Partial<FoodLogEntry>; 
  message?: string; 
  needsQuantity?: boolean 
}> => {
  const model = 'gemini-3-flash-preview';
  
  // Specific instruction to catch ambiguous quantities
  const prompt = isImage 
    ? "Examine this food image. Identify the items and estimate their nutritional content. If you cannot determine the exact portion size or quantity, set 'needsQuantity' to true and ask the user for clarification in the 'message'. Return a JSON object with: name, portion, calories, macros (protein, carbs, fat), needsQuantity (boolean), and message (string)."
    : `Analyze this food entry: "${input}". Provide a nutritional breakdown. If the quantity/portion is missing or vague, set 'needsQuantity' to true. Return a JSON object with: name, portion, calories, macros (protein, carbs, fat), needsQuantity (boolean), and message (string).`;

  try {
    const contents = isImage 
      ? { parts: [{ inlineData: input as { data: string; mimeType: string } }, { text: prompt }] }
      : { parts: [{ text: prompt }] };

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Common name of the food item" },
            portion: { type: Type.STRING, description: "The identified or assumed portion size" },
            calories: { type: Type.NUMBER, description: "Estimated total calories" },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.NUMBER, description: "Grams of protein" },
                carbs: { type: Type.NUMBER, description: "Grams of carbohydrates" },
                fat: { type: Type.NUMBER, description: "Grams of fat" }
              },
              required: ["protein", "carbs", "fat"]
            },
            needsQuantity: { type: Type.BOOLEAN, description: "True if the user should provide more specific quantity details" },
            message: { type: Type.STRING, description: "Friendly feedback or request for more info" }
          },
          required: ["name", "calories", "macros", "needsQuantity", "message"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response received from model");
    const parsed = JSON.parse(text);

    return { 
      success: true, 
      data: {
        name: parsed.name,
        portion: parsed.portion,
        calories: parsed.calories,
        macros: parsed.macros
      },
      needsQuantity: parsed.needsQuantity,
      message: parsed.message
    };
  } catch (error) {
    console.error("Analysis Error:", error);
    return { success: false, message: "Failed to analyze food content. Please try again." };
  }
};

export const generateRecipe = async (query: string): Promise<Recipe | null> => {
  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a highly detailed, professional recipe for "${query}". Ensure instructions are step-by-step. Include nutritional breakdown per serving. Use a creative finalImagePrompt for AI generation. Output JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            cuisine: { type: Type.STRING },
            description: { type: Type.STRING },
            prepTime: { type: Type.STRING },
            cookTime: { type: Type.STRING },
            servings: { type: Type.NUMBER },
            difficulty: { type: Type.STRING },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  amount: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING }
                },
                required: ["item", "amount"]
              }
            },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            nutritionPerServing: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER }
              },
              required: ["calories", "protein", "carbs", "fat"]
            },
            finalImagePrompt: { type: Type.STRING }
          },
          required: ["title", "cuisine", "ingredients", "instructions", "nutritionPerServing"]
        }
      }
    });
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Recipe Generation Error:", error);
    return null;
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: `High resolution food photography of ${prompt}. Plated, vibrant colors, bokeh background.`,
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};

export const fitnessConsultant = async (history: { role: string; content: string }[], userProfile: UserProfile): Promise<string> => {
  const model = 'gemini-3-pro-preview';
  const systemInstruction = `You are a professional Fitness Consultant and Dietician. 
    User Profile: Name: ${userProfile.name}, Goals: ${userProfile.healthGoals}, Activity: ${userProfile.activityLevel}.
    Manual Targets: P:${userProfile.macroGoals.protein}g, C:${userProfile.macroGoals.carbs}g, F:${userProfile.macroGoals.fat}g, Cal:${userProfile.macroGoals.calories}.
    Always reference their goals and manual targets if they differ from standard calculations.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: history.map(h => ({ 
        role: h.role === 'user' ? 'user' : 'model', 
        parts: [{ text: h.content }] 
      })),
      config: { systemInstruction, thinkingConfig: { thinkingBudget: 4000 } }
    });
    return response.text || "I'm having trouble calculating your plan right now.";
  } catch (error) {
    console.error("Consultant Error:", error);
    return "Something went wrong. Let's try again.";
  }
};

export const chatAssistant = async (history: { role: string; content: string }[]): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  const systemInstruction = `You are a helpful AI Culinary Assistant. Help with recipes, food science, and kitchen tips.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: history.map(h => ({ 
        role: h.role === 'user' ? 'user' : 'model', 
        parts: [{ text: h.content }] 
      })),
      config: { systemInstruction }
    });
    return response.text || "I'm here to help.";
  } catch (error) {
    console.error("Chat Assistant Error:", error);
    return "Something went wrong.";
  }
};

export const readText = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  } catch (e) {
    console.error("TTS Error:", e);
  }
};
