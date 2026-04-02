import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  // Vercel functions are stateless — no persistent cache to modify.
  // Just return success so client-side calls don't fail.
  if (req.method === "POST") {
    return res.status(200).json({ added: true });
  }
  const { publicId } = (req.body || {}) as { publicId?: string };
  if (publicId) {
    return res.status(200).json({ cleared: false, removed: publicId });
  }
  return res.status(200).json({ cleared: true });
}
