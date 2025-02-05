import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import createHttpError from "http-errors";

// Validate environment variables
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER and SMTP_PASS environment variables are required.");
}


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
    try {
        const mailOptions: Mail.Options = {
            from: process.env.SMTP_USER,
            to,
            subject,
            html,
        };
        console.log("Sending email with options:", mailOptions);
        await transporter.sendMail(mailOptions);
    } catch (error: any) {
        console.error("Email sending failed:", error);
        throw createHttpError(500, { message: "Failed to send email: " + error.message });
    }
};

export const resetPasswordEmailTemplate = (token: string): string => `
  <html>
    <body>
      <h3>Password Reset Request</h3>
      <p>Click the link below to reset your password. This link will expire in 15 minutes:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" target="_blank">
        Reset Password
      </a>
    </body>
  </html>`;