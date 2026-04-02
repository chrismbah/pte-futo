import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const SECRET = process.env.PAYSTACK_SECRET_KEY;
  if (!SECRET) return res.status(500).json({ error: "Paystack secret key not configured" });

  const { account_number, bank_code } = req.query;
  if (!account_number || !bank_code) {
    return res.status(400).json({ error: "account_number and bank_code are required" });
  }

  try {
    const url = `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${SECRET}` },
    });
    const data = await response.json();
    if (!data.status) return res.status(400).json({ error: data.message || "Could not resolve account" });
    return res.status(200).json({ account_name: data.data.account_name, account_number: data.data.account_number });
  } catch (error) {
    console.error("[paystack-resolve-account] error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
