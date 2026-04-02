import express from 'express';
import crypto from 'crypto';
import { IncomingForm } from 'formidable';
import * as fs from 'fs';
import OpenAI from 'openai';

const app = express();
const PORT = 3001;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// ── Persistent file-based gallery cache ──────────────────────────────────────
// Survives server restarts. Also serves stale data during Cloudinary rate limits.
const GALLERY_CACHE_FILE = '/tmp/ebsumsa-gallery-cache.json';
const GALLERY_CACHE_TTL  = 30 * 60 * 1000; // 30 minutes

type CacheShape = { items: unknown[]; at: number };

function readCache(): CacheShape | null {
  try {
    const raw = fs.readFileSync(GALLERY_CACHE_FILE, 'utf8');
    return JSON.parse(raw) as CacheShape;
  } catch { return null; }
}

function writeCache(data: CacheShape) {
  try { fs.writeFileSync(GALLERY_CACHE_FILE, JSON.stringify(data)); } catch { /* ignore */ }
}

// GET /api/gallery-list
app.get('/api/gallery-list', async (req, res) => {
  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dsqjg9mfg';
  const apiKey    = process.env.VITE_CLOUDINARY_API_KEY    || '731583139833111';
  const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET || '5Kbu5rq0DcwEbqlWXTD58Mk4dOw';

  // Always fetch fresh from Cloudinary so newly uploaded items appear immediately.
  // The cache is only used as a fallback when Cloudinary is unavailable.
  const staleCache = readCache();

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    const searchPayload = (resourceType: string) =>
      fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expression: `folder:ebsu_gallery AND resource_type:${resourceType}`,
          sort_by: [{ created_at: 'desc' }],
          max_results: 500,
          with_field: ['context', 'tags'],
        }),
      });

    const [imgRes, vidRes] = await Promise.all([
      searchPayload('image'),
      searchPayload('video'),
    ]);

    const mapResources = (data: any, forcedType: 'image' | 'video') =>
      (data.resources || []).map((item: any) => ({
        url: item.secure_url,
        publicId: item.public_id,
        category: item.context?.custom?.category || 'general',
        caption: item.context?.custom?.caption || '',
        type: forcedType,
        uploadedAt: item.created_at,
        size: item.bytes,
      }));

    const imgData = imgRes.ok ? await imgRes.json() : { resources: [], error: { message: `HTTP ${imgRes.status}` } };
    const vidData = vidRes.ok ? await vidRes.json() : { resources: [], error: { message: `HTTP ${vidRes.status}` } };

    // Cloudinary returned a rate-limit or API error — serve stale cache instead
    if (imgData.error || vidData.error) {
      const errMsg = imgData.error?.message || vidData.error?.message;
      console.warn('[gallery] Cloudinary error:', errMsg);
      if (staleCache) {
        console.log('[gallery] Serving stale cache as fallback');
        return res.status(200).json({ items: staleCache.items, stale: true });
      }
      return res.status(200).json({ items: [], error: errMsg });
    }

    const items = [
      ...mapResources(imgData, 'image'),
      ...mapResources(vidData, 'video'),
    ].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    // Save fresh data as the new backup cache
    writeCache({ items, at: Date.now() });
    return res.status(200).json({ items });
  } catch (err) {
    // Network/server error — serve stale cache if available
    if (staleCache) {
      console.log('[gallery] Network error, serving stale cache');
      return res.status(200).json({ items: staleCache.items, stale: true });
    }
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// POST /api/gallery-cache  — inject a newly-uploaded item directly into the cache
// This makes the new item visible to everyone immediately, without waiting for
// Cloudinary's search index to update.
app.post('/api/gallery-cache', (req, res) => {
  try {
    const { item } = (req.body || {}) as { item?: any };
    if (!item || !item.publicId) return res.status(400).json({ error: 'item with publicId required' });
    const existing = readCache();
    if (!existing) {
      // No cache yet — don't create a partial one, let the next gallery fetch
      // populate it fully from Cloudinary.
      return res.status(200).json({ added: false, reason: 'no_cache' });
    }
    // Prepend the new item, removing any old duplicate
    const deduped = (existing.items as any[]).filter((i: any) => i.publicId !== item.publicId);
    const updated = { items: [item, ...deduped], at: existing.at };
    writeCache(updated);
    return res.status(200).json({ added: true, total: updated.items.length });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /api/gallery-cache  — bust or surgically update the gallery cache
// Body (optional): { publicId: string }  → removes only that item from cache
// No body                                → wipes the whole cache (use after uploads)
app.delete('/api/gallery-cache', (req, res) => {
  try {
    const { publicId } = (req.body || {}) as { publicId?: string };
    if (publicId) {
      // Surgical remove: update cache in-place so re-fetches don't need to call Cloudinary
      const existing = readCache();
      if (existing) {
        const updated = {
          items: (existing.items as any[]).filter((i: any) => i.publicId !== publicId),
          at: existing.at,
        };
        writeCache(updated);
        return res.status(200).json({ cleared: false, removed: publicId, remaining: updated.items.length });
      }
    } else {
      if (fs.existsSync(GALLERY_CACHE_FILE)) fs.unlinkSync(GALLERY_CACHE_FILE);
    }
    return res.status(200).json({ cleared: true });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /api/gallery-upload
app.delete('/api/gallery-upload', async (req, res) => {
  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dsqjg9mfg';
  const apiKey    = process.env.VITE_CLOUDINARY_API_KEY    || '731583139833111';
  const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET || '5Kbu5rq0DcwEbqlWXTD58Mk4dOw';

  try {
    const { publicId, resourceType = 'image' } = req.body as { publicId: string; resourceType?: string };
    if (!publicId) return res.status(400).json({ error: 'publicId required' });

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const form = new URLSearchParams();
    form.append('public_id', publicId);
    form.append('timestamp', String(timestamp));
    form.append('api_key', apiKey);
    form.append('signature', signature);

    const r = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
      method: 'POST',
      body: form,
    });
    const d = await r.json() as { result?: string; error?: { message: string } };
    // Expose the real Cloudinary error so clients can show meaningful messages
    if (d.error) {
      return res.status(500).json({ error: d.error.message });
    }
    if (d.result !== 'ok' && d.result !== 'not found') {
      return res.status(500).json({ error: `Cloudinary returned: ${d.result ?? 'unknown'}` });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// GET /api/imagekit-auth
app.get('/api/imagekit-auth', (req, res) => {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    return res.status(500).json({ error: 'ImageKit private key not configured' });
  }
  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 2400;
  const signature = crypto.createHmac('sha1', privateKey).update(token + expire).digest('hex');
  return res.status(200).json({ token, expire, signature });
});

// GET /api/paystack-banks
app.get('/api/paystack-banks', async (req, res) => {
  const SECRET = process.env.PAYSTACK_SECRET_KEY;
  if (!SECRET) return res.status(500).json({ error: 'Paystack secret key not configured' });

  try {
    let allBanks: any[] = [];
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const response = await fetch(`https://api.paystack.co/bank?currency=NGN&perPage=100&page=${page}`, {
        headers: { Authorization: `Bearer ${SECRET}` },
      });
      const data = await response.json() as any;
      if (!data.status) return res.status(500).json({ error: data.message || 'Failed to fetch banks' });
      allBanks = [...allBanks, ...data.data];
      hasMore = data.meta?.next !== null && data.data.length === 100;
      page++;
    }
    allBanks.sort((a: any, b: any) => a.name.localeCompare(b.name));
    return res.status(200).json({ banks: allBanks });
  } catch (error) {
    console.error('[paystack-banks] error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/paystack-resolve-account
app.get('/api/paystack-resolve-account', async (req, res) => {
  const SECRET = process.env.PAYSTACK_SECRET_KEY;
  if (!SECRET) return res.status(500).json({ error: 'Paystack secret key not configured' });

  const { account_number, bank_code } = req.query;
  if (!account_number || !bank_code) {
    return res.status(400).json({ error: 'account_number and bank_code are required' });
  }

  try {
    const url = `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${SECRET}` } });
    const data = await response.json() as any;
    if (!data.status) return res.status(400).json({ error: data.message || 'Could not resolve account' });
    return res.status(200).json({ account_name: data.data.account_name, account_number: data.data.account_number });
  } catch (error) {
    console.error('[paystack-resolve-account] error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/paystack-transfer
app.post('/api/paystack-transfer', async (req, res) => {
  const SECRET = process.env.PAYSTACK_SECRET_KEY;
  if (!SECRET) return res.status(500).json({ error: 'Paystack secret key not configured' });

  const { account_number, bank_code, account_name, amount, narration } = req.body;
  if (!account_number || !bank_code || !account_name || !amount) {
    return res.status(400).json({ error: 'account_number, bank_code, account_name and amount are required' });
  }

  const amountInKobo = Math.round(Number(amount) * 100);
  if (amountInKobo < 100) return res.status(400).json({ error: 'Minimum transfer amount is ₦1' });

  try {
    const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'nuban', name: account_name, account_number, bank_code, currency: 'NGN' }),
    });
    const recipientData = await recipientRes.json() as any;
    if (!recipientData.status) {
      return res.status(400).json({ error: recipientData.message || 'Failed to create recipient' });
    }
    const recipientCode = recipientData.data.recipient_code;

    const transferRes = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'balance', amount: amountInKobo, recipient: recipientCode, reason: narration || 'EBSUMSA Admin Transfer' }),
    });
    const transferData = await transferRes.json() as any;
    if (!transferData.status) {
      return res.status(400).json({ error: transferData.message || 'Transfer failed' });
    }

    return res.status(200).json({
      success: true,
      transfer_code: transferData.data.transfer_code,
      reference: transferData.data.reference,
      status: transferData.data.status,
      amount: amountInKobo / 100,
      recipient: account_name,
    });
  } catch (error) {
    console.error('[paystack-transfer] error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/paystack-finalize-transfer
app.post('/api/paystack-finalize-transfer', async (req, res) => {
  const SECRET = process.env.PAYSTACK_SECRET_KEY;
  if (!SECRET) return res.status(500).json({ error: 'Paystack secret key not configured' });

  const { transfer_code, otp } = req.body;
  if (!transfer_code || !otp) {
    return res.status(400).json({ error: 'transfer_code and otp are required' });
  }

  try {
    const response = await fetch('https://api.paystack.co/transfer/finalize_transfer', {
      method: 'POST',
      headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ transfer_code, otp }),
    });
    const data = await response.json() as any;
    if (!data.status) {
      return res.status(400).json({ error: data.message || 'Failed to finalize transfer' });
    }
    return res.status(200).json({
      success: true,
      transfer_code: data.data.transfer_code,
      reference: data.data.reference,
      status: data.data.status,
    });
  } catch (error) {
    console.error('[paystack-finalize-transfer] error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/analyze-document
app.post('/api/analyze-document', async (req, res) => {
  try {
    const { documentText, fileName } = req.body;
    if (!documentText || !fileName) {
      return res.status(400).json({ error: 'Missing documentText or fileName' });
    }

    const client = new OpenAI({
      baseURL: 'https://api.puter.com/puterai/openai/v1/',
      apiKey: process.env.PUTER_AUTH_TOKEN,
    });

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
}`;

    const completion = await client.chat.completions.create({
      model: 'grok-4',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) throw new Error('Empty response from AI');

    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON in AI response');

    const studyMaterial = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ success: true, data: studyMaterial });
  } catch (error) {
    console.error('[analyze-document] error:', error);
    return res.status(500).json({ error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /api/analyze-pdf  (receives pre-extracted text from client-side PDF.js)
app.post('/api/analyze-pdf', async (req, res) => {
  try {
    const { documentText, pdfText, fileName } = req.body;
    const textToAnalyze = documentText || pdfText;
    if (!textToAnalyze || !fileName) {
      return res.status(400).json({ error: 'Missing text content or fileName' });
    }

    const client = new OpenAI({
      baseURL: 'https://api.puter.com/puterai/openai/v1/',
      apiKey: process.env.PUTER_AUTH_TOKEN,
    });

    const analysisPrompt = `Analyze the following medical/educational document and provide comprehensive study materials in JSON format.

Document: ${fileName}
Content:
${textToAnalyze.substring(0, 10000)}

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
}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) throw new Error('Empty response from AI');

    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON in AI response');

    const studyMaterial = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ success: true, data: studyMaterial });
  } catch (error) {
    console.error('[analyze-pdf] error:', error);
    return res.status(500).json({ error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /api/extract-pdf  (multipart form upload — extracts text server-side)
app.post('/api/extract-pdf', async (req, res) => {
  try {
    const form = new IncomingForm();
    const [, files] = await form.parse(req);
    const file = files.file?.[0];
    if (!file) return res.status(400).json({ error: 'No file provided' });

    const fileBuffer = fs.readFileSync(file.filepath);

    // Dynamically import pdfjs-dist with polyfill applied first
    if (typeof (Promise as any).withResolvers === 'undefined') {
      (Promise as any).withResolvers = function<T>() {
        let resolve!: (value: T | PromiseLike<T>) => void;
        let reject!: (reason?: any) => void;
        const promise = new Promise<T>((res2, rej) => { resolve = res2; reject = rej; });
        return { promise, resolve, reject };
      };
    }

    const pdfjsLib = await import('pdfjs-dist');
    const uint8Array = new Uint8Array(fileBuffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str || '').join(' ');
        fullText += pageText + '\n';
      } catch (err) {
        fullText += `[Page ${i} extraction error]\n`;
      }
    }

    fs.unlinkSync(file.filepath);
    return res.status(200).json({ success: true, text: fullText });
  } catch (error) {
    console.error('[extract-pdf] error:', error);
    return res.status(500).json({ error: 'Failed to extract PDF', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /api/send-id-registration
app.post('/api/send-id-registration', async (req, res) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_CeSJZxNW_GbDsznNnR7LF8g2vheQMPBSe';
  const ADMIN_EMAILS = ['patronkwo@gmail.com', 'oohveeyuu070@gmail.com'];

  try {
    const {
      firstName, surname, email, phoneNumber, dateOfBirth,
      level, classSet, registrationNumber, photoUrl,
      paymentReference, paymentAmount,
    } = req.body;

    const formattedAmount = new Intl.NumberFormat('en-NG', {
      style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
    }).format(paymentAmount || 100);

    const adminEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: 'EBSU MSA <onboarding@resend.dev>',
        to: ADMIN_EMAILS,
        subject: `New ID Card Registration - ${firstName} ${surname}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#16a34a;">New ID Card Registration</h2>
          <div><img src="${photoUrl}" alt="Student Photo" style="width:150px;height:180px;object-fit:cover;border-radius:8px;" /></div>
          <div style="background:#dcfce7;border:1px solid #16a34a;border-radius:8px;padding:15px;margin:20px 0;">
            <p style="margin:0;color:#166534;font-weight:bold;">Payment Confirmed</p>
            <p style="color:#166534;">Amount: <strong>${formattedAmount}</strong><br/>Reference: <code>${paymentReference || 'N/A'}</code></p>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;font-weight:bold;">Name:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;">${firstName} ${surname}</td></tr>
            <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;font-weight:bold;">Email:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;">${email}</td></tr>
            <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;font-weight:bold;">Phone:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;">${phoneNumber}</td></tr>
            <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;font-weight:bold;">Date of Birth:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;">${dateOfBirth}</td></tr>
            <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;font-weight:bold;">Level:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;">${level}</td></tr>
            <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;font-weight:bold;">Class Set:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;">${classSet}</td></tr>
            <tr><td style="padding:12px;border-bottom:1px solid #e5e7eb;font-weight:bold;">Reg. Number:</td><td style="padding:12px;border-bottom:1px solid #e5e7eb;">${registrationNumber}</td></tr>
          </table>
        </div>`,
      }),
    });

    const userEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: 'EBSU MSA <onboarding@resend.dev>',
        to: [email],
        subject: 'ID Card Registration Confirmed - EBSUMSA',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#16a34a;">Registration Confirmed!</h2>
          <p>Dear ${firstName},</p>
          <p>Your ID card registration has been received successfully.</p>
          <div style="background:#dcfce7;border:1px solid #16a34a;border-radius:8px;padding:15px;margin:20px 0;">
            <p><strong>Payment:</strong> ${formattedAmount} confirmed<br/><strong>Reference:</strong> ${paymentReference || 'N/A'}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#6b7280;">Reg. Number:</td><td style="padding:6px 0;font-weight:500;">${registrationNumber}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Level:</td><td style="padding:6px 0;font-weight:500;">${level}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Class:</td><td style="padding:6px 0;font-weight:500;">${classSet}</td></tr>
          </table>
          <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:15px;margin:25px 0;">
            <p style="margin:0;color:#92400e;font-size:14px;"><strong>What's Next?</strong><br/>Your ID card is being processed. This typically takes about 2 weeks.</p>
          </div>
          <p style="color:#6b7280;font-size:14px;">Questions? Contact the ID card officer at <a href="tel:07025336321" style="color:#16a34a;">07025336321</a></p>
        </div>`,
      }),
    });

    return res.status(200).json({
      success: true,
      adminEmailSent: adminEmailResponse.ok,
      userEmailSent: userEmailResponse.ok,
    });
  } catch (error) {
    console.error('[send-id-registration] error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
