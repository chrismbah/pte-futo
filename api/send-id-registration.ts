import type { VercelRequest, VercelResponse } from "@vercel/node";

const RESEND_API_KEY = "re_CeSJZxNW_GbDsznNnR7LF8g2vheQMPBSe";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { firstName, surname, email, phoneNumber, dateOfBirth, level, classSet, registrationNumber, photoUrl } = req.body;

    // Send email notification via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "EBSU MSA <onboarding@resend.dev>",
        to: ["patronkwo@gmail.com"], // Admin email to receive notifications
        subject: `New ID Card Registration - ${firstName} ${surname}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">
              New ID Card Registration
            </h2>
            
            <div style="margin: 20px 0;">
              <img src="${photoUrl}" alt="Student Photo" style="width: 150px; height: 180px; object-fit: cover; border-radius: 8px; border: 2px solid #e5e7eb;" />
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">First Name:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${firstName}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Surname:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${surname}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Phone Number:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${phoneNumber}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Date of Birth:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${dateOfBirth}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Level:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${level}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Registration Number:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${registrationNumber}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Class:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${classSet}</td>
              </tr>
            </table>
            
            <p style="margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-radius: 8px; color: #6b7280; font-size: 14px;">
              This registration was submitted through the EBSU MSA portal. Please review and process accordingly.
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Resend error:", errorData);
      return res.status(500).json({ error: "Failed to send email notification" });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, messageId: data.id });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
