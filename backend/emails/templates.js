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

module.exports = {
  buildWelcomeEmail,
  buildActivationEmail,
};
