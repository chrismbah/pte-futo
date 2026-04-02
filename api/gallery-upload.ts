import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

// This endpoint handles DELETE only.
// Uploads go directly from the browser to Cloudinary (no server needed).

export const config = { api: { bodyParser: false } };

function readBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    const parts: Buffer[] = [];
    req.on("data", (c: Buffer) => parts.push(c));
    req.on("end", () => resolve(Buffer.concat(parts).toString()));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dsqjg9mfg';
  const apiKey    = process.env.VITE_CLOUDINARY_API_KEY    || '731583139833111';
  const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET || '5Kbu5rq0DcwEbqlWXTD58Mk4dOw';

  try {
    const body = await readBody(req);
    const { publicId, resourceType = "image" } = JSON.parse(body) as { publicId: string; resourceType?: string };
    if (!publicId) return res.status(400).json({ error: "publicId required" });

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash("sha1")
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    const form = new URLSearchParams();
    form.append("public_id",  publicId);
    form.append("timestamp",  String(timestamp));
    form.append("api_key",    apiKey);
    form.append("signature",  signature);

    const r = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
      { method: "POST", body: form }
    );

    const data = await r.json() as { result?: string; error?: { message: string } };
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }
    if (data.result !== "ok" && data.result !== "not found") {
      return res.status(500).json({ error: `Cloudinary returned: ${data.result ?? "unknown"}` });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
}
