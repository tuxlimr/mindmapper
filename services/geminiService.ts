import { GoogleGenAI, Type } from "@google/genai";
import { UploadedFile, FileType, MindMapData } from "../types";

export const generateMindMapFromContent = async (file: UploadedFile): Promise<MindMapData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let promptParts: any[] = [];
  
  const systemInstruction = `
    You are an expert Mind Map Architect. 
    Your goal is to analyze the provided content and structure it into a hierarchical JSON format suitable for visualization.
    
    Rules:
    1. Identify the central theme (Root Node).
    2. Identify major categories (Level 1 Children).
    3. Identify details and sub-points (Level 2+ Children).
    4. Keep labels concise (1-5 words).
    5. Use 'details' for a short explanation if necessary.
    6. Ensure the JSON is strictly valid and matches the requested schema.
    7. Generate at least 3 levels of depth if the content allows.
  `;

  if (file.type === FileType.IMAGE) {
    promptParts = [
      {
        inlineData: {
          mimeType: file.mimeType,
          data: file.content,
        },
      },
      {
        text: "Analyze this image. If it contains text, diagrams, or notes, convert the information into a structured mind map JSON.",
      },
    ];
  } else {
    // Text based
    promptParts = [
      {
        text: `Analyze the following text and generate a mind map structure:\n\n${file.content}`,
      },
    ];
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
        role: 'user',
        parts: promptParts
    },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      // Explicitly define the schema to a sufficient depth to avoid recursion limits or empty object errors.
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          root: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              details: { type: Type.STRING },
              children: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    details: { type: Type.STRING },
                    children: {
                      type: Type.ARRAY,
                      items: {
                         type: Type.OBJECT,
                         properties: {
                            id: { type: Type.STRING },
                            label: { type: Type.STRING },
                            details: { type: Type.STRING },
                            children: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        label: { type: Type.STRING },
                                        details: { type: Type.STRING },
                                        children: { 
                                            type: Type.ARRAY,
                                            items: {
                                                type: Type.OBJECT,
                                                properties: {
                                                    id: { type: Type.STRING },
                                                    label: { type: Type.STRING },
                                                    details: { type: Type.STRING }
                                                },
                                                required: ["id", "label"]
                                            }
                                        } 
                                    },
                                    required: ["id", "label"]
                                }
                            }
                         },
                         required: ["id", "label"]
                      }
                    }
                  },
                  required: ["id", "label"]
                }
              }
            },
            required: ["id", "label", "children"]
          }
        }
      }
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini.");
  }

  try {
    const data = JSON.parse(text);
    return data as MindMapData;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Failed to generate a valid mind map structure.");
  }
};