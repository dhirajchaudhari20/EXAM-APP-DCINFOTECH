const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

/**
 * sendSessionEmail
 * 
 * Simple HTTP endpoint to send emails via Nodemailer.
 * Requires SMTP credentials to be set in environment variables:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 */
exports.sendSessionEmail = functions.https.onRequest(async (req, res) => {
  // 1. Validate request
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { session_title, session_date, session_time, meeting_link, recipients, minutes_until, type } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).send("No recipients provided.");
  }

  logger.info(`Sending ${type || 'alert'} to ${recipients.length} users for: ${session_title}`);

  // 2. Configure Transporter
  const smtpConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Addition: explicit timeout
    connectionTimeout: 10000, // 10s
  };

  const transporter = nodemailer.createTransport(smtpConfig);

  // 3. Verify Connection and Send
  try {
    // Optional: Only verify if we really suspect authentication issues
    // await transporter.verify();
    
    // Prepare Email Content
    const timeText = minutes_until ? `in ${minutes_until} minutes` : "soon";
    const subject = minutes_until ? `[REMINDER] ${session_title} starts ${timeText}` : `[URGENT] ${session_title}`;
    
    const mailOptions = {
      from: `"DC Cloud Solutions" <${process.env.SMTP_USER}>`,
      // Use Bcc for privacy and to avoid "Too many recipients" errors in some SMTP servers
      to: process.env.SMTP_USER, // Send to self as primary
      bcc: recipients,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background: #0044cc; color: #fff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Session Reminder</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #0044cc; margin-top: 0;">${session_title}</h2>
            <p>This is a reminder for your upcoming training session.</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Date:</strong> ${session_date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${session_time}</p>
              <p style="margin: 5px 0;"><strong>Platform:</strong> DC Cloud Solutions Portal</p>
            </div>
            <p>Please join the session using the link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${meeting_link}" style="background: #0044cc; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; border: none;">Join Session Now</a>
            </div>
            <p style="font-size: 0.8em; color: #888; border-top: 1px solid #eee; padding-top: 15px;">
              <i>Note: This is an automated reminder sent to all registered students.</i>
            </p>
          </div>
          <div style="background: #f4f4f4; color: #888; padding: 15px; text-align: center; font-size: 12px;">
            &copy; 2026 DC Cloud Solutions. All rights reserved.
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info("Email sent successfully", { messageId: info.messageId, recipients: recipients.length });
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    logger.error("Error in SMTP process:", {
      code: error.code,
      command: error.command,
      response: error.response,
      message: error.message
    });
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code,
      tip: "If code is EAUTH, check SMTP_USER and SMTP_PASS. If ETIMEDOUT, check proxy/firewall."
    });
  }
});
