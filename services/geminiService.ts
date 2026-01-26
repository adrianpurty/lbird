
import { GoogleGenAI, Type } from "@google/genai";
import { Lead, ChatMessage } from "../types.ts";

export const getHandlerResponse = async (history: ChatMessage[], currentMessage: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Convert our ChatMessage format to Gemini's required contents format
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    
    // Add current message
    contents.push({ role: 'user', parts: [{ text: currentMessage }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction: `You are "Zephyr", the Master Handler of LeadBid Pro—the world's most sophisticated lead marketplace.
        Your tone is professional, efficient, tactical, and slightly futuristic.
        You assist users with:
        1. Bidding strategies (prioritizing distribution waterfall).
        2. Technical post-back configuration for CRM ingestion.
        3. Lead quality verification standards.
        4. Navigating the "Vault API" and Identity Node settings.
        
        Always keep responses concise and high-impact. Use marketplace terminology (nodes, handshakes, liquidity, post-backs).
        If a user asks about something not related to the marketplace, redirect them professionally back to business.`,
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Handler Chat Error:", error);
    return "HANDSHAKE_ERROR: THE_HANDLER_IS_OFFLINE. ATTEMPTING_RECONNECT...";
  }
};

export const analyzeLeadQuality = async (businessUrl: string, targetUrl: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are acting as a world-class Lead Quality Auditor. 
      Analyze the integrity of a lead generation pipeline for a business at ${businessUrl} with a target delivery endpoint at ${targetUrl}.
      
      CRITICAL FOCUS: This is about verified LEADS (individuals with intent), NOT raw traffic or clicks.
      
      Your analysis must perform the following:
      1. Intent Verification: Evaluate the synergy between the business offering and the lead source. Is this likely to produce high-intent prospects?
      2. Lead Authenticity Audit: Assess risk of non-human participation (bots) and incentivized low-quality lead generation.
      3. Commercial Economics: Based on the identified niche (e.g., Solar, Legal, Mortgage), provide benchmark Cost-Per-Lead (CPL) and expected Lead-to-Sale ratios.
      4. Tactical Delivery: Review the target endpoint for CRM integration readiness.
      
      Synthesize this into the provided JSON schema. Ensure:
      - 'relevance' is a score from 0-100 reflecting the LEAD quality and verification integrity.
      - 'conversionPotential' details expected contact rates and lead qualification benchmarks.
      - 'marketTrend' covers CPL economics for this specific lead asset class.
      - 'summary' provide a go/no-go recommendation for a sophisticated lead buyer.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            relevance: { type: Type.NUMBER, description: "Lead integrity score from 0 to 100" },
            conversionPotential: { type: Type.STRING, description: "Contact rate and qualification potential" },
            marketTrend: { type: Type.STRING, description: "CPL economics and competitive demand" },
            summary: { type: Type.STRING, description: "Strategic recommendation for lead provision" }
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
