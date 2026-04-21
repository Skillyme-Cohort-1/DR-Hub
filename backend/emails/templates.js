const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'templates');

function renderTemplate(fileName, replacements) {
  const filePath = path.join(templatesDir, fileName);
  const content = fs.readFileSync(filePath, 'utf8');

  return Object.entries(replacements).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(value));
  }, content);
}

function buildWelcomeEmail({ name }) {
  const safeName = name || 'there';

  const subject = 'Welcome to DRHub';
  const text = [
    `Hi ${safeName},`,
    '',
    'Welcome to DRHub. Your account has been created successfully.',
    'You can now sign in and start using the platform.',
    '',
    'Best regards,',
    'DRHub Team',
  ].join('\n');

  const html = renderTemplate('welcome.html', {
    name: safeName,
  });

  return { subject, text, html };
}

function buildActivationEmail({ name, activationUrl }) {
  const safeName = name || 'there';
  const subject = 'Activate your DRHub account';
  const text = [
    `Hi ${safeName},`,
    '',
    'Thanks for creating your DRHub account.',
    'Please activate your account by opening this link:',
    activationUrl,
    '',
    'Best regards,',
    'DRHub Team',
  ].join('\n');

  const html = renderTemplate('activate-account.html', {
    name: safeName,
    activationUrl,
  });

  return { subject, text, html };
}

function buildBookingPendingEmail({ name, reference, roomName, date, slot, amountDue }) {
  const safeName = name || 'there';

  const subject = `Booking ${reference} — Payment Required`;

  const text = [
    `Hi ${safeName},`,
    '',
    'Your booking has been received and is pending payment.',
    '',
    'Booking Details:',
    `  Reference : ${reference}`,
    `  Room      : ${roomName}`,
    `  Date      : ${date}`,
    `  Slot      : ${slot}`,
    `  Amount Due: ${amountDue}`,
    '',
    // TODO: Replace with real payment instructions
    'Please contact support@drhub.com with your booking reference to receive payment instructions.',
    '',
    'Your slot will be held for 24 hours pending payment.',
    '',
    'Best regards,',
    'DRHub Team',
  ].join('\n');

  const html = renderTemplate('booking-pending.html', {
    name: safeName,
    reference,
    roomName,
    date,
    slot,
    amountDue,
  });

  return { subject, text, html };
}

module.exports = {
  buildWelcomeEmail,
  buildActivationEmail,
  buildBookingPendingEmail
};
