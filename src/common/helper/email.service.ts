import nodemailer from "nodemailer";

interface IEmailOptions {
  email: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ email, subject, html }: IEmailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use a reliable email service (e.g., Gmail, SMTP)
      auth: {
        user: process.env.SMTP_USER as string, // Your email address
        pass: process.env.SMTP_PASS as string, // Your email password or App Password
      },
    });

    const mailOptions = {
      from: `"Job Huntly" <${process.env.SMTP_USER}>`, // Sender name and email
      to: email,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};
