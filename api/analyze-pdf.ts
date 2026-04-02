import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import * as pdfjsLib from 'pdfjs-dist';

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

async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        fullText += pageText + '\n';
      } catch (pageError) {
        console.error(`[v0] Error extracting page ${i}:`, pageError);
        fullText += `[Page ${i} - Error extracting text]\n`;
      }
    }

    if (!fullText || fullText.trim().length === 0) {
      throw new Error('No text could be extracted from PDF');
    }

    console.log('[v0] Extracted PDF text length:', fullText.length);
    return fullText;
  } catch (error) {
    console.error('[v0] PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
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
    const { pdfBuffer, fileName } = req.body;

    if (!pdfBuffer || !fileName) {
      res.status(400).json({ error: 'Missing pdfBuffer or fileName' });
      return;
    }

    console.log('[v0] Extracting text from PDF:', fileName);
    
    // Decode base64 PDF
    const buffer = Buffer.from(pdfBuffer, 'base64');
    
    // Extract text from PDF
    const documentText = await extractPDFText(buffer);
    console.log('[v0] PDF text extracted successfully');

    // Initialize Puter OpenAI client with ChatGPT model
    const client = new OpenAI({
      baseURL: 'https://api.puter.com/puterai/openai/v1/',
      apiKey: process.env.PUTER_AUTH_TOKEN,
    });

    console.log('[v0] Starting ChatGPT analysis via Puter JS');

    // Create comprehensive analysis prompt
    const analysisPrompt = `Analyze the following medical/educational document and provide comprehensive study materials in JSON format.

Document: ${fileName}
Content:
${documentText.substring(0, 10000)}

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
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    console.log('[v0] Received ChatGPT response via Puter');

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error('Empty response from ChatGPT via Puter');
    }

    // Extract JSON from response
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[v0] Response content:', responseContent);
      throw new Error('Invalid JSON in ChatGPT response');
    }

    const studyMaterial: StudyMaterial = JSON.parse(jsonMatch[0]);
    console.log('[v0] Study materials generated successfully');

    res.status(200).json({ success: true, data: studyMaterial });
  } catch (error) {
    console.error('[v0] Error in analyze-pdf:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Analysis failed', details: errorMessage });
  }
}
