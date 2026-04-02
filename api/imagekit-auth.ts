import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    return res.status(500).json({ error: 'ImageKit private key not configured' });
  }

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes from now
  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(token + expire)
    .digest('hex');

  return res.status(200).json({
    token,
    expire,
    signature,
  });
}
