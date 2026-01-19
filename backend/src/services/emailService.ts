// src/services/emailService.ts
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

// Initialize transporter with Ethereal SMTP
export const initEmailService = async () => {
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log("✅ Ethereal SMTP initialized");
    console.log("Login to Ethereal:", testAccount.user, testAccount.pass);
  }
  return transporter;
};

// Send email function
export const sendEmail = async ({
  to,
  subject,
  body,
  senderEmail,
}: {
  to: string;
  subject: string;
  body: string;
  senderEmail: string;
}) => {
  if (!transporter) {
    await initEmailService();
  }

  const info = await transporter!.sendMail({
    from: senderEmail,
    to,
    subject,
    text: body,
    html: `<p>${body}</p>`,
  });

  console.log(`📧 Email sent to ${to}`);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  return info;
};
