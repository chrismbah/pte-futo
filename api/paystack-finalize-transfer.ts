import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const SECRET = process.env.PAYSTACK_SECRET_KEY;
  if (!SECRET) return res.status(500).json({ error: "Paystack secret key not configured" });

  const { transfer_code, otp } = req.body;
  if (!transfer_code || !otp) {
    return res.status(400).json({ error: "transfer_code and otp are required" });
  }

  try {
    const response = await fetch("https://api.paystack.co/transfer/finalize_transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transfer_code, otp }),
    });
    const data = await response.json();
    if (!data.status) {
      return res.status(400).json({ error: data.message || "Failed to finalize transfer" });
    }
    return res.status(200).json({
      success: true,
      transfer_code: data.data.transfer_code,
      reference: data.data.reference,
      status: data.data.status,
    });
  } catch (error) {
    console.error("[paystack-finalize-transfer] error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
