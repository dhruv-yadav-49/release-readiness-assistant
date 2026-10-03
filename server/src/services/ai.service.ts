import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not configured');
}
const genAI = new GoogleGenerativeAI(apiKey);

const ALLOWED_TYPES = [
  'technical',
  'stakeholder',
  'risk_limitation',
  'missing_info',
  'unsupported_claim'
] as const;

function validateAIStatements(data: unknown, releaseData: any) {
  if (!Array.isArray(data)) {
    throw new Error('AI response must be an array');
  }

  const validItemIds = new Set(
    (releaseData.items ?? []).map((item: any) => item.itemId)
  );

  return data.map((item: any) => {
    if (
      !item ||
      !ALLOWED_TYPES.includes(item.type) ||
      typeof item.statement !== 'string' ||
      !item.statement.trim() ||
      !Array.isArray(item.evidenceReferences) ||
      !item.evidenceReferences.every((id: unknown) => typeof id === 'string' && validItemIds.has(id))
    ) {
      throw new Error('Invalid AI-generated statement');
    }

    return {
      type: item.type,
      statement: item.statement.trim(),
      evidenceReferences: item.evidenceReferences
    };
  });
}

export const analyzeReleasePackage = async (releaseData: any) => {
  const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
  
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
    6. CRITICAL: For evidenceReferences, you MUST return an array of exactly the "itemId" strings of the items that support the statement. Do not put descriptions, only the itemId. If no item applies, leave it empty.
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      throw new Error('AI did not return a valid JSON array');
    }
    
    const parsed: unknown = JSON.parse(jsonMatch[0]);
    return validateAIStatements(parsed, releaseData);
  } catch (error) {
    console.error("AI Generation Error", error);
    throw new Error("Failed to generate AI analysis");
  }
};
