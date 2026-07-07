import nodemailer from 'nodemailer';

let lastAlertAt = 0;
const COOLDOWN_MS = 60 * 60 * 1000; // at most one alert per hour

function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
    auth: { user, pass },
  });
}

async function sendSlack(text) {
  const url = process.env.ERROR_ALERT_WEBHOOK;
  if (!url) return false;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return res.ok;
}

async function sendEmail(subject, text) {
  const to = process.env.ERROR_ALERT_EMAIL || process.env.TO_EMAIL || process.env.SMTP_USER;
  const transporter = createTransporter();
  if (!to || !transporter) return false;
  await transporter.sendMail({
    from: `Parjad Portfolio <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
  return true;
}

/** Fire a single alert when client errors spike (rate-limited). */
export async function notifyErrorSpike({ count, windowMinutes, samples }) {
  const threshold = Number(process.env.ERROR_ALERT_THRESHOLD || 5);
  if (count < threshold) return;
  if (Date.now() - lastAlertAt < COOLDOWN_MS) return;

  const lines = samples.slice(0, 5).map((e) => `• ${e.message} (${e.url || 'unknown'})`).join('\n');
  const body = [
    `Client error spike on parjadm.ca`,
    `${count} errors in the last ${windowMinutes} minutes (threshold: ${threshold}).`,
    '',
    'Recent samples:',
    lines,
  ].join('\n');

  try {
    const viaSlack = await sendSlack(body);
    const viaEmail = await sendEmail('[parjadm.ca] Client error spike', body);
    if (viaSlack || viaEmail) lastAlertAt = Date.now();
  } catch (err) {
    console.error('Error alert failed:', err.message);
  }
}
