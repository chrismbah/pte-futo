import type { VercelRequest, VercelResponse } from "@vercel/node";

const RESEND_API_KEY = "re_CeSJZxNW_GbDsznNnR7LF8g2vheQMPBSe";
const ADMIN_EMAILS = ["patronkwo@gmail.com", "oohveeyuu070@gmail.com"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { 
      firstName, 
      surname, 
      email, 
      phoneNumber, 
      dateOfBirth, 
      level, 
      classSet, 
      registrationNumber, 
      photoUrl,
      paymentReference,
      paymentAmount 
    } = req.body;

    const formattedAmount = new Intl.NumberFormat("en-NG", { 
      style: "currency", 
      currency: "NGN", 
      minimumFractionDigits: 0 
    }).format(paymentAmount || 100);

    // Send email notification to Admin
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "EBSU MSA <onboarding@resend.dev>",
        to: ADMIN_EMAILS,
        subject: `New ID Card Registration - ${firstName} ${surname}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">
              New ID Card Registration
            </h2>
            
            <div style="margin: 20px 0;">
              <img src="${photoUrl}" alt="Student Photo" style="width: 150px; height: 180px; object-fit: cover; border-radius: 8px; border: 2px solid #e5e7eb;" />
            </div>
            
            <div style="background-color: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; color: #166534; font-weight: bold;">Payment Confirmed</p>
              <p style="margin: 5px 0 0 0; color: #166534;">
                Amount: <strong>${formattedAmount}</strong><br/>
                Reference: <code style="background: #f0fdf4; padding: 2px 6px; border-radius: 4px;">${paymentReference || "N/A"}</code>
              </p>
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

    if (!adminEmailResponse.ok) {
      const errorData = await adminEmailResponse.json();
      console.error("Resend admin email error:", errorData);
    }

    // Send confirmation email to User
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "EBSU MSA <onboarding@resend.dev>",
        to: [email],
        subject: `ID Card Registration Confirmed - EBSUMSA`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0;">EBSUMSA</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Ebonyi State University Medical Students Association</p>
            </div>

            <h2 style="color: #1f2937; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">
              ID Card Registration Successful!
            </h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Dear <strong>${firstName} ${surname}</strong>,
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Thank you for registering for your EBSUMSA Student ID Card. Your payment has been confirmed and your registration is being processed.
            </p>
            
            <div style="background-color: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: #166534;">Payment Receipt</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #166534;">Amount Paid:</td>
                  <td style="padding: 8px 0; color: #166534; font-weight: bold; text-align: right;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #166534;">Reference:</td>
                  <td style="padding: 8px 0; color: #166534; font-weight: bold; text-align: right;">
                    <code style="background: #f0fdf4; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${paymentReference || "N/A"}</code>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #166534;">Status:</td>
                  <td style="padding: 8px 0; color: #166534; font-weight: bold; text-align: right;">Confirmed</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Registration Details</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Name:</td>
                  <td style="padding: 6px 0; color: #374151; font-weight: 500;">${firstName} ${surname}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Reg. Number:</td>
                  <td style="padding: 6px 0; color: #374151; font-weight: 500;">${registrationNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Level:</td>
                  <td style="padding: 6px 0; color: #374151; font-weight: 500;">${level}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #6b7280;">Class:</td>
                  <td style="padding: 6px 0; color: #374151; font-weight: 500;">${classSet}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>What's Next?</strong><br/>
                Your ID card is being processed. You will receive a notification when it is ready for collection. This typically takes about 2 weeks.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              If you have any questions, please contact the ID card officer at <a href="tel:07025336321" style="color: #16a34a;">07025336321</a>
            </p>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; text-align: center;">
              This is an automated email from EBSUMSA Portal. Please do not reply directly to this email.
            </p>
          </div>
        `,
      }),
    });

    if (!userEmailResponse.ok) {
      const errorData = await userEmailResponse.json();
      console.error("Resend user email error:", errorData);
    }

    return res.status(200).json({ 
      success: true, 
      adminEmailSent: adminEmailResponse.ok,
      userEmailSent: userEmailResponse.ok
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
