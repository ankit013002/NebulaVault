import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: process.env.SMTP_SECURE === "true",
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

const FROM = process.env.SMTP_FROM || "NebulaVault <noreply@nebulavault.dev>";
const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000";

export async function sendVerificationEmail(
  to: string,
  rawToken: string,
): Promise<void> {
  const link = `${APP_ORIGIN}/verify-email?token=${rawToken}`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Verify your NebulaVault email",
    html: `
      <p>Welcome to NebulaVault!</p>
      <p>Click the link below to verify your email:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  rawToken: string,
): Promise<void> {
  const link = `${APP_ORIGIN}/reset-password?token=${rawToken}`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Reset your NebulaVault password",
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${link}">${link}</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}
