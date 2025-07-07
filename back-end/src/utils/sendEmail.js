const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendResetCode = async (to, code) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Password Reset Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333;">Hello!</h2>
        <p>You requested a password reset. Use the code below to reset your password:</p>
        <div style="font-size: 24px; font-weight: bold; color: #2E86C1; margin: 20px 0;">
          ${code}
        </div>
        <p>If you didn’t request this, you can ignore this email.</p>
        <p style="margin-top: 30px; font-size: 14px; color: #777;">Thanks, <br />The Domains.ge Team</p>
      </div>
    `,
  });
};
