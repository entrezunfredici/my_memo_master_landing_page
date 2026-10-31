import { connect } from 'cloudflare:sockets';

const MAX_MESSAGE_LENGTH = 5000;
const ALLOWED_ORIGINS = ['https://my-memo-master.com', 'https://www.my-memo-master.com'];

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

const b64 = (text) => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const wrap76 = (text) => text.match(/.{1,76}/g)?.join('\r\n') ?? '';

async function verifyTurnstile(token, secret, ip) {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body
  });
  const data = await res.json();
  return data.success === true;
}

// Client SMTP minimal (TLS implicite, port 465, AUTH LOGIN) : suffisant pour
// envoyer un seul message vers Infomaniak.
async function sendMail(env, { subject, text }) {
  const socket = connect(
    { hostname: env.SMTP_HOST, port: Number(env.SMTP_PORT) },
    { secureTransport: 'on' }
  );
  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  // Lit une réponse SMTP complète (les lignes "250-..." sont des continuations).
  const readResponse = async () => {
    for (;;) {
      const lines = buffer.split('\r\n');
      const complete = lines.slice(0, -1);
      const last = complete[complete.length - 1];
      if (last && /^\d{3} /.test(last)) {
        buffer = lines[lines.length - 1];
        return { code: Number(last.slice(0, 3)), text: complete.join('\n') };
      }
      const { value, done } = await reader.read();
      if (done) throw new Error('SMTP: connexion fermée');
      buffer += decoder.decode(value, { stream: true });
    }
  };

  const command = async (line, expected) => {
    if (line !== null) await writer.write(encoder.encode(`${line}\r\n`));
    const res = await readResponse();
    if (res.code !== expected) throw new Error(`SMTP ${res.code}: ${res.text}`);
  };

  try {
    await command(null, 220);
    await command('EHLO my-memo-master.com', 250);
    await command('AUTH LOGIN', 334);
    await command(b64(env.SMTP_USER), 334);
    await command(b64(env.SMTP_PASS), 235);
    await command(`MAIL FROM:<${env.MAIL_FROM}>`, 250);
    await command(`RCPT TO:<${env.MAIL_TO}>`, 250);
    await command('DATA', 354);

    const message = [
      `From: MyMemoMaster <${env.MAIL_FROM}>`,
      `To: ${env.MAIL_TO}`,
      `Subject: =?UTF-8?B?${b64(subject)}?=`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${crypto.randomUUID()}@my-memo-master.com>`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      wrap76(b64(text)),
      '.'
    ].join('\r\n');
    await command(message, 250);
    await command('QUIT', 221).catch(() => {});
  } finally {
    await writer.close().catch(() => {});
    socket.close().catch(() => {});
  }
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

    // Même origine uniquement : le worker est routé sur my-memo-master.com/api/feedback.
    const origin = request.headers.get('Origin');
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) return json({ error: 'forbidden' }, 403);

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'invalid_json' }, 400);
    }

    const message = String(payload.message ?? '').trim();
    const token = String(payload.turnstileToken ?? '');
    if (!message || message.length > MAX_MESSAGE_LENGTH) return json({ error: 'invalid_message' }, 400);
    if (!token) return json({ error: 'captcha_required' }, 400);

    const ip = request.headers.get('CF-Connecting-IP');
    if (!(await verifyTurnstile(token, env.TURNSTILE_SECRET, ip))) {
      return json({ error: 'captcha_failed' }, 403);
    }

    try {
      await sendMail(env, {
        subject: 'Nouveau retour depuis le site MyMemoMaster',
        text: message
      });
    } catch (error) {
      console.error(error.message);
      return json({ error: 'send_failed' }, 502);
    }
    return json({ ok: true });
  }
};
