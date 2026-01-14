import { Resend } from "resend";

// Safety check for environment variables
if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY MISSING: Check your .env file");
  console.error("Get your API key from: https://resend.com/api-keys");
}

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send Elevated Welcome Email
 * @param {Object} userData - Contains email and firstName
 * @returns {Promise<Object>} - Returns success status and message ID
 */
export const sendWelcomeEmail = async ({ email, firstName }) => {
  console.log(`--- Initiating Email Sequence for: ${email} ---`);

  try {
    const loginUrl = "https://kemchutahomes.netlify.app/login";

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Kemchuta Homes <onboarding@resend.dev>", // Change to your verified domain
      to: email,
      subject: "Welcome to Kemchuta Homes - Let's Build Your Legacy 🏡",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Inter', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f5f5f5; padding-bottom: 40px; }
            .main { background-color: #ffffff; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; margin-top: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            
            /* Brand Header */
            .header { background-color: #700CEB; padding: 50px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase; }
            
            /* Content Area */
            .content { padding: 40px 35px; color: #262626; line-height: 1.7; }
            .content h2 { color: #000000; font-size: 22px; margin-top: 0; font-weight: 700; }
            .content p { font-size: 16px; color: #525252; }
            
            /* CTA Button */
            .btn-wrapper { text-align: center; margin: 35px 0; }
            .btn { background-color: #700CEB; color: #ffffff !important; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(112, 12, 235, 0.25); }
            
            /* Footer */
            .footer { background-color: #171717; padding: 30px; text-align: center; color: #a3a3a3; font-size: 13px; }
            .footer a { color: #bd80f8; text-decoration: none; font-weight: 600; }
            .footer p { margin: 8px 0; }
            .divider { height: 1px; background-color: #404040; margin: 20px auto; width: 80%; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="main">
              <div class="header">
                <h1>Kemchuta Homes</h1>
              </div>
              
              <div class="content">
                <h2>Welcome aboard, ${firstName}! 👋</h2>
                <p>We're thrilled to have you join our network of professional realtors. At Kemchuta Homes, we provide you with the tools and platform to scale your real estate career to new heights.</p>
                
                <p>Your account is now fully active. You can log in to your personalized dashboard to access property listings, track your earnings, and manage your referrals.</p>
                
                <div class="btn-wrapper">
                  <a href="${loginUrl}" class="btn">Launch Your Dashboard</a>
                </div>
                
                <p>Stay tuned for updates on new properties and exclusive realtor training sessions.</p>
                <p style="margin-bottom: 0;">Best Regards,</p>
                <p style="margin-top: 0; color: #700CEB; font-weight: 700;">The Kemchuta Homes Team</p>
              </div>
              
              <div class="footer">
                <p>Connect with us</p>
                <p>
                  <a href="https://kemchutahomes.netlify.app">Website</a> &nbsp;|&nbsp; 
                  <a href="#">Instagram</a> &nbsp;|&nbsp; 
                  <a href="#">Support</a>
                </p>
                <div class="divider"></div>
                <p>&copy; 2026 Kemchuta Homes. Empowering Realtors. </p>
                <p>Lekki, Lagos, Nigeria</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Check for errors
    if (error) {
      throw new Error(error.message);
    }

    console.log(`✅ SUCCESS: Welcome email sent to ${email}`);
    console.log(`Message ID: ${data.id}`);

    return {
      success: true,
      messageId: data.id,
    };
  } catch (err) {
    console.error("❌ MAILER ERROR:");
    console.error(`Status: Failed to deliver to ${email}`);
    console.error(`Reason: ${err.message}`);
    console.error(`Full Error:`, err);

    return {
      success: false,
      error: err.message,
    };
  }
};
