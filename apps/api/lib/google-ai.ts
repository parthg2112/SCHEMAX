import { createGoogleGenerativeAI } from "@ai-sdk/google";
import dotenv from "dotenv";

dotenv.config();

export const googleAi = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "",
});
