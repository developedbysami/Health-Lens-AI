import { puter } from "@heyputer/puter.js";
import { constants } from "../constants"; 

export const analyzeHealthText = async (text) => {
  const prompt = constants?.ANALYZE_HEALTH_REPORT_PROMPT.replace("{{DOCUMENT_TEXT}}", text);
  
  const response = await puter.ai.chat(
    [
      { role: "system", content: "You are a professional health report reviewer" },
      { role: "user", content: prompt },
    ],
    { model: "gpt-4o" }
  );

  const rawContent = typeof response === "string" ? response : response?.message?.content || "";
  return parseJsonSafe(rawContent);
};

// Helper to safely parse AI JSON responses
const parseJsonSafe = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  const parsed = match ? JSON.parse(match[0]) : {};
  
  if (!parsed.overallHealthScore && !parsed.error) {
    throw new Error("Invalid AI response structure");
  }
  return parsed;
};