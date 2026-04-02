import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const SECRET = process.env.PAYSTACK_SECRET_KEY;
  if (!SECRET) return res.status(500).json({ error: "Paystack secret key not configured" });

  const { account_number, bank_code, account_name, amount, narration } = req.body;

  if (!account_number || !bank_code || !account_name || !amount) {
    return res.status(400).json({ error: "account_number, bank_code, account_name and amount are required" });
  }

  const amountInKobo = Math.round(Number(amount) * 100);
  if (amountInKobo < 100) return res.status(400).json({ error: "Minimum transfer amount is ₦1" });

  try {
    // Step 1 — Create a transfer recipient
    const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: account_name,
        account_number,
        bank_code,
        currency: "NGN",
      }),
    });
    const recipientData = await recipientRes.json();
    if (!recipientData.status) {
      return res.status(400).json({ error: recipientData.message || "Failed to create recipient" });
    }
    const recipientCode = recipientData.data.recipient_code;

    // Step 2 — Initiate the transfer
    const transferRes = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: amountInKobo,
        recipient: recipientCode,
        reason: narration || "EBSUMSA Admin Transfer",
      }),
    });
    const transferData = await transferRes.json();
    if (!transferData.status) {
      return res.status(400).json({ error: transferData.message || "Transfer failed" });
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
    console.error("[paystack-transfer] error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
