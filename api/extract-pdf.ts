import { IncomingForm } from 'formidable';
import * as fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm();
    const [, files] = await form.parse(req);

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('Extracting PDF:', file.originalFilename);

    // Read PDF file
    const fileBuffer = fs.readFileSync(file.filepath);
    const uint8Array = new Uint8Array(fileBuffer);

    // Extract text from PDF
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        fullText += pageText + '\n';
      } catch (err) {
        console.error(`[v0] Error extracting page ${i}:`, err);
        fullText += `[Page ${i} extraction error]\n`;
      }
    }

    console.log('[v0] Extraction complete, text length:', fullText.length);

    // Clean up
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      text: fullText,
    });
  } catch (error) {
    console.error('[v0] PDF extraction error:', error);
    return res.status(500).json({
      error: 'Failed to extract PDF',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
