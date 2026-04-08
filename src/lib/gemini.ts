import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will be disabled.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const MODELS = {
  GENERAL: "gemini-3-flash-preview",
  COMPLEX: "gemini-3.1-pro-preview",
  LITE: "gemini-3.1-flash-lite-preview",
  LIVE: "gemini-3.1-flash-live-preview",
  IMAGE: "gemini-3-pro-image-preview",
  VEO: "veo-3.1-fast-generate-preview"
};
