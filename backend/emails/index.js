const { createTransporter } = require('./transporter');
const { buildWelcomeEmail, buildActivationEmail, buildBookingPendingEmail } = require('./templates');

async function sendEmail({ to, subject, text, html }) {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM;

  if (!transporter || !from) {
    return {
      ok: false,
      reason: 'Email service not configured. Set SMTP_* and EMAIL_FROM env variables.',
    };
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return { ok: true };
}

async function sendWelcomeEmail({ to, name }) {
  const { subject, text, html } = buildWelcomeEmail({ name });
  return sendEmail({ to, subject, text, html });
}

async function sendActivationEmail({ to, name, activationUrl }) {
  const { subject, text, html } = buildActivationEmail({ name, activationUrl });
  return sendEmail({ to, subject, text, html });
}

async function sendBookingPendingEmail({ to, name, reference, roomName, date, slot, amountDue }) {
  const { subject, text, html } = buildBookingPendingEmail({
    name,
    reference,
    roomName,
    date,
    slot,
    amountDue,
  });
  return sendEmail({ to, subject, text, html });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendActivationEmail,
  sendBookingPendingEmail
};
