import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const analyzeReleasePackage = async (releaseData: any) => {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Returning mock data.");
    return [
      { type: 'technical', statement: 'Mock Technical Statement 1 based on ' + releaseData.version, evidenceReferences: [] },
      { type: 'stakeholder', statement: 'Mock Stakeholder Statement 1', evidenceReferences: [] },
      { type: 'risk_limitation', statement: 'Known Limitation: ' + releaseData.limitations, evidenceReferences: [] }
    ];
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const prompt = `
    Analyze the following software release package and generate separate statements.
    Return ONLY a JSON array of objects with the following schema:
    [
      {
        "type": "technical" | "stakeholder" | "risk_limitation" | "missing_info" | "unsupported_claim",
        "statement": "The generated summary or claim",
        "evidenceReferences": ["reference to QA or item description"]
      }
    ]
    
    Release Package Data:
    ${JSON.stringify(releaseData, null, 2)}
    
    Instructions:
    1. Generate technical summary statements for internal users.
    2. Generate simple stakeholder summary statements.
    3. Identify risks and limitations.
    4. Detect any unsupported claims in QA evidence.
    5. Note missing information if critical fields are empty.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("AI Generation Error", error);
    throw new Error("Failed to generate AI analysis");
  }
};
