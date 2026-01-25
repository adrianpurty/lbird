import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types.ts";

export const analyzeLeadQuality = async (businessUrl: string, targetUrl: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are acting as a world-class Lead Generation Auditor and Digital Arbitrage Expert. 
      Analyze the lead quality and traffic integrity for a business at ${businessUrl} receiving traffic from ${targetUrl}.
      
      Your analysis must perform the following:
      1. Fraud Detection: Evaluate the potential for click fraud, bot traffic, or low-intent 'blind' clicks vs. genuine search intent. Highlight any high-risk indicators.
      2. Market Economics: Based on the identified niche (e.g., Travel, Finance, High-Ticket Legal, Insurance), provide estimated benchmarks for typical Customer Acquisition Cost (CAC) and current Cost-Per-Lead (CPL).
      3. Conversion Intelligence: Estimate the potential conversion rate (CVR) from raw lead to qualified prospect/final sale based on the alignment between the landing page at the business URL and the traffic source.
      4. Competitive Analysis: Assess the current market demand, competitive density, and seasonality for this specific asset class.
      
      Synthesize this into the provided JSON schema. Ensure:
      - 'relevance' is a score from 0-100 reflecting the overall integrity and ROI potential.
      - 'conversionPotential' details the expected CVR and lead-to-sale ratios.
      - 'marketTrend' covers the CPL/CAC economics and competitive pressure.
      - 'summary' provides a definitive tactical recommendation for a lead buyer.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            relevance: { type: Type.NUMBER, description: "Score from 0 to 100 based on traffic quality and integrity audit" },
            conversionPotential: { type: Type.STRING, description: "Detailed analysis of conversion likelihood and benchmark rates" },
            marketTrend: { type: Type.STRING, description: "Analysis of market demand, CAC, CPL, and competitive density" },
            summary: { type: Type.STRING, description: "Executive summary and tactical recommendation for the lead buyer" }
          },
          required: ["relevance", "conversionPotential", "marketTrend", "summary"]
        }
      }
    });

    const resultText = response.text;
    return resultText ? JSON.parse(resultText) : null;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
};

export const applyAiOverride = async (lead: Partial<Lead>, instruction: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are a System Operator for a high-stakes lead marketplace. 
      The administrator wants to modify a lead asset based on specific tactical instructions.
      
      CURRENT ASSET DATA:
      Title: ${lead.title}
      Category: ${lead.category}
      Description: ${lead.description}
      Current Quality Score: ${lead.qualityScore}
      
      ADMINISTRATOR INSTRUCTION:
      "${instruction}"
      
      Modify the asset data to reflect the instruction. 
      - Enhance the title to be more compelling and market-aligned.
      - Rewrite the description to follow the admin's goal (e.g., professional tone, focus on conversion, ROI emphasis).
      - Recalculate or adjust the Quality Score if the instruction implies a change in verification or source quality.
      - Keep the category unchanged unless explicitly asked.
      
      Return the updated values in the provided JSON schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The modified campaign title" },
            description: { type: Type.STRING, description: "The modified campaign description" },
            qualityScore: { type: Type.NUMBER, description: "The updated quality score (0-100)" }
          },
          required: ["title", "description", "qualityScore"]
        }
      }
    });

    const resultText = response.text;
    return resultText ? JSON.parse(resultText) : null;
  } catch (error) {
    console.error("AI Override Error:", error);
    return null;
  }
};
