const { z } = require('zod');
const prisma = require('../lib/prisma');
const { sendEmail } = require('../../emails');

const contactSchema = z.object({
  fullName: z
    .string({ required_error: 'fullName is required' })
    .trim()
    .min(2, 'fullName must be at least 2 characters')
    .max(120, 'fullName must be at most 120 characters'),
  email: z
    .string({ required_error: 'email is required' })
    .trim()
    .email('email must be a valid email address'),
  phoneNumber: z
    .string({ required_error: 'Phone Number is required' })
    .trim()
    .min(2, 'Phone Number must be at least 2 characters')
    .max(120, 'Phone Number must be at most 120 characters'),
  message: z
    .string({ required_error: 'message is required' })
    .trim()
    .min(10, 'message must be at least 10 characters')
    .max(2000, 'message must be at most 2000 characters'),
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildContactEmail({ fullName, email, phoneNumber, message }) {
  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safePhoneNumber = escapeHtml(phoneNumber);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

  return {
    subject: `New Contact Form Submission - ${fullName}`,
    text: [
      'A new contact request was submitted on DR Hub.',
      '',
      `Full name: ${fullName}`,
      `Email: ${email}`,
      '',
      'Message:',
      message,
    ].join('\n'),
    html: [
      '<h2>New Contact Form Submission</h2>',
      '<p>A new contact request was submitted on DR Hub.</p>',
      `<p><strong>Full name:</strong> ${safeName}</p>`,
      `<p><strong>Email:</strong> ${safeEmail}</p>`,
      `<p><strong>Message:</strong><br />${safeMessage}</p>`,
    ].join(''),
  };
}

async function submitContactForm(req, res, next) {
  try {
    const result = contactSchema.safeParse(req.body);

    if (!result.success) {
      const errors = (result.error?.errors ?? []).map((err) => ({
        field: err.path?.join('.') || 'unknown',
        message: err.message || 'Invalid value',
      }));

      return res.status(400).json({
        message: 'Validation failed.',
        errors,
      });
    }

    const { fullName, email, phoneNumber, message } = result.data;

    const savedMessage = await prisma.contactMessage.create({
      data: {
        fullName,
        email,
        phoneNumber,
        message,
      },
    });

    const supportInbox = process.env.SITE_EMAIL || process.env.EMAIL_FROM || process.env.SMTP_USER;
    let notificationSent = false;

    if (supportInbox) {
      const emailContent = buildContactEmail({ fullName, email, message });
      const emailResult = await sendEmail({
        to: supportInbox,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });
      notificationSent = Boolean(emailResult?.ok);
    }

    return res.status(201).json({
      message: 'Contact request received successfully.',
      contactId: savedMessage.id,
      notificationSent,
    });
  } catch (error) {
    return next(error);
  }
}

async function getAllMessages(req, res, next) {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      message: 'Messages fetched successfully.',
      count: messages.length,
      messages: messages
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  submitContactForm,
  getAllMessages
};
