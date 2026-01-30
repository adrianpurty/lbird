import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types";

/**
 * Lead Quality Analysis and Admin Overrides using Google Gemini API.
 */

export const analyzeLeadQuality = async (businessUrl: string, targetUrl: string) => {
  try {
    // Correct initialization: always use new GoogleGenAI({apiKey: process.env.API_KEY})
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Correct usage: query with ai.models.generateContent using both model name and prompt
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are acting as a world-class Lead Generation Auditor and Digital Arbitrage Expert. 
      Analyze the lead quality and conversion path for a business at ${businessUrl} receiving leads from ${targetUrl}.
      
      Your analysis must perform the following:
      1. Lead Verification Logic: Evaluate how leads are captured and their potential intent level based on the delivery endpoint.
      2. Market Economics: Provide benchmarks for typical Cost-Per-Lead (CPL) and lead-to-sale ratios in the specific niche.
      3. Quality Assessment: Estimate a quality score (0-100) based on the synergy between the buyer's business and the lead source.
      
      Synthesize this into the provided JSON schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            relevance: { type: Type.NUMBER, description: "Quality score from 0 to 100 based on conversion likelihood" },
            conversionPotential: { type: Type.STRING, description: "Detailed lead-to-sale ratio analysis" },
            marketTrend: { type: Type.STRING, description: "CPL and market demand overview" },
            summary: { type: Type.STRING, description: "Tactical recommendation for the lead buyer" }
          },
          required: ["relevance", "conversionPotential", "marketTrend", "summary"]
        }
      }
    });

    // Correct extraction: use response.text property directly
    const resultText = response.text;
    return resultText ? JSON.parse(resultText) : null;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
};

export const applyAiOverride = async (lead: Partial<Lead>, instruction: string) => {
  try {
    // Correct initialization: always use new GoogleGenAI({apiKey: process.env.API_KEY})
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Correct usage: query with ai.models.generateContent using both model name and prompt
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `System Admin Command: Reconfigure lead asset [${lead.title}] based on: "${instruction}". 
      Modify title, description, and qualityScore to align with tactical requirements.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Modified asset title" },
            description: { type: Type.STRING, description: "Modified manifest description" },
            qualityScore: { type: Type.NUMBER, description: "Updated quality score (0-100)" }
          },
          required: ["title", "description", "qualityScore"]
        }
      }
    });

    // Correct extraction: use response.text property directly
    const resultText = response.text;
    return resultText ? JSON.parse(resultText) : null;
  } catch (error) {
    console.error("AI Override Error:", error);
    return null;
  }
};