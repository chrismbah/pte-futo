import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dsqjg9mfg';
  const apiKey    = process.env.VITE_CLOUDINARY_API_KEY    || '731583139833111';
  const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET || '5Kbu5rq0DcwEbqlWXTD58Mk4dOw';

  type CloudinaryResource = {
    public_id: string;
    secure_url: string;
    resource_type: string;
    created_at: string;
    bytes: number;
    context?: { custom?: { category?: string; caption?: string } };
  };

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    const search = (resourceType: string) =>
      fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          expression: `folder:ebsu_gallery AND resource_type:${resourceType}`,
          sort_by: [{ created_at: "desc" }],
          max_results: 500,
          with_field: ["context", "tags"],
        }),
      });

    // Fetch images and videos in parallel
    const [imgRes, vidRes] = await Promise.all([search("image"), search("video")]);

    const mapResources = (resources: CloudinaryResource[], forcedType: "image" | "video") =>
      resources.map((r) => ({
        url:        r.secure_url,
        publicId:   r.public_id,
        category:   r.context?.custom?.category || "general",
        caption:    r.context?.custom?.caption  || "",
        type:       forcedType,
        uploadedAt: r.created_at,
        size:       r.bytes,
      }));

    const imgJson = imgRes.ok
      ? (await imgRes.json() as { resources?: CloudinaryResource[]; error?: { message: string } })
      : { resources: [], error: { message: `HTTP ${imgRes.status}` } };
    const vidJson = vidRes.ok
      ? (await vidRes.json() as { resources?: CloudinaryResource[]; error?: { message: string } })
      : { resources: [], error: { message: `HTTP ${vidRes.status}` } };

    if (imgJson.error || vidJson.error) {
      const msg = imgJson.error?.message || vidJson.error?.message;
      return res.status(200).json({ items: [], error: msg });
    }

    const items = [
      ...mapResources(imgJson.resources || [], "image"),
      ...mapResources(vidJson.resources || [], "video"),
    ].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    // 2-minute CDN cache — short enough that uploads appear quickly,
    // long enough to avoid hammering Cloudinary's rate limit.
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
    return res.status(200).json({ items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
}

