const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendVerificationEmail = async (to, name, token) => {
    const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: 'CivicEye — Verify your email',
        html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;">
        <h2 style="color:#1a56db;">Welcome to CivicEye, ${name}!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#1a56db;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">Verify Email</a>
        <p style="color:#888;font-size:12px;margin-top:24px;">This link expires in 24 hours. If you did not register, ignore this email.</p>
      </div>
    `,
    });
};

exports.sendResetEmail = async (to, name, token) => {
    const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: 'CivicEye — Password Reset',
        html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;">
        <h2 style="color:#1a56db;">Password Reset Request</h2>
        <p>Hi ${name}, click below to reset your password. This link expires in 1 hour.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#e3342f;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">Reset Password</a>
        <p style="color:#888;font-size:12px;margin-top:24px;">If you did not request this, ignore this email.</p>
      </div>
    `,
    });
};
