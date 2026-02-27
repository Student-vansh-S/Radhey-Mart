const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendOrderEmailToAdmins({ to, subject, html }) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.warn("⚠️ Mail credentials missing. Skipping email.");
    return;
  }

  if (!to || (Array.isArray(to) && to.length === 0)) {
    console.warn("⚠️ No admin emails found. Skipping email.");
    return;
  }

  const recipients = Array.isArray(to) ? to.join(",") : to;

  await transporter.sendMail({
    from: `Radhey Mart <${process.env.MAIL_USER}>`,
    to: recipients,
    subject,
    html,
  });
}

module.exports = { sendOrderEmailToAdmins };