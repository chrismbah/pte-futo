import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

interface AnalysisRequest {
  documentText: string;
  fileName: string;
}

interface StudyMaterial {
  summary: string;
  keyPoints: string[];
  mcqs: MCQ[];
  shortAnswerQuestions: string[];
  essayQuestions: string[];
}

interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { documentText, fileName }: AnalysisRequest = req.body;

    if (!documentText || !fileName) {
      res.status(400).json({ error: 'Missing documentText or fileName' });
      return;
    }

    // Initialize Puter OpenAI client with Grok model
    const client = new OpenAI({
      baseURL: 'https://api.puter.com/puterai/openai/v1/',
      apiKey: process.env.PUTER_AUTH_TOKEN,
    });

    console.log('[v0] Starting Grok AI analysis for:', fileName);

    // Create comprehensive analysis prompt
    const analysisPrompt = `Analyze the following medical/educational document and provide comprehensive study materials in JSON format.

Document Content:
${documentText.substring(0, 8000)}

Generate a detailed analysis with:
1. A comprehensive summary (300+ words) with technical depth
2. 8-10 key points with clinical significance
3. 5 detailed multiple choice questions with 4 options each, including correct answer and thorough explanation
4. 5 short answer questions requiring synthesis of concepts
5. 2 comprehensive essay questions

Return ONLY valid JSON with this exact structure:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "mcqs": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "..."
    }
  ],
  "shortAnswerQuestions": ["...", "..."],
  "essayQuestions": ["...", "..."]
}

Ensure all content is medically accurate, clinically relevant, and pedagogically sound. Focus on helping medical students master the material with deep understanding.`;

    const completion = await client.chat.completions.create({
      model: 'grok-4',
      messages: [
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    console.log('[v0] Received Grok response');

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('Empty response from Grok AI');
    }

    // Extract JSON from response
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON in Grok response');
    }

    const studyMaterial: StudyMaterial = JSON.parse(jsonMatch[0]);

    console.log('[v0] Study materials generated successfully');

    res.status(200).json({ success: true, data: studyMaterial });
  } catch (error) {
    console.error('[v0] Error in analyze-document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Analysis failed', details: errorMessage });
  }
}
