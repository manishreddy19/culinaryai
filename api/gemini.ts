import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY on server" });

  try {
    const { prompt } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({ text });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
