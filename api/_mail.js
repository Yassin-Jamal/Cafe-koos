// Gedeelde logica voor de formulieren. Verstuurt via Resend.
// Bestanden die met _ beginnen worden door Vercel niet als endpoint aangeboden.
//
// Benodigde environment variables in Vercel:
//   RESEND_API_KEY   je API-sleutel van resend.com   (verplicht)
//   MAIL_TO          waar de berichten heen gaan     (standaard: zie hieronder)
//   MAIL_FROM        afzender                        (standaard: zie hieronder)
//
// De afzender moet op een domein staan dat in Resend geverifieerd is —
// dat is hier mail.permaflare.com, niet cafekoos.com.

const MAIL_FROM = 'Café Koos <noreply@mail.permaflare.com>';
const MAIL_TO = 'bakkerlianne@live.nl';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const LIMITS = {
  naam: 100,
  email: 200,
  telefoon: 40,
  onderwerp: 150,
  functie: 100,
  bericht: 5000
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clean(value, max) {
  return String(value == null ? '' : value).replace(/\s+$/g, '').trim().slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

// Bouwt een leesbare mail uit een lijst [label, waarde] paren.
function renderMail(title, fields, message) {
  const rows = fields
    .filter(([, value]) => value)
    .map(([label, value]) => `
      <tr>
        <td style="padding:6px 16px 6px 0;color:#6b5a52;font:600 13px/1.5 Arial,sans-serif;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td>
        <td style="padding:6px 0;color:#2e1c15;font:400 14px/1.5 Arial,sans-serif">${escapeHtml(value)}</td>
      </tr>`)
    .join('');

  const html = `<!doctype html>
<html lang="nl"><body style="margin:0;padding:24px;background:#f9f5f0">
  <div style="max-width:600px;margin:0 auto;background:#fffdfa;border:2px solid #ded0c4;border-radius:4px;overflow:hidden">
    <div style="background:#2e1c15;border-bottom:4px solid #f9bf10;padding:20px 24px">
      <div style="color:#f9bf10;font:400 24px/1.2 Georgia,serif">Café Koos</div>
      <div style="color:#e8ddd2;font:400 12px/1.6 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;margin-top:4px">${escapeHtml(title)}</div>
    </div>
    <div style="padding:24px">
      <table style="border-collapse:collapse;width:100%">${rows}</table>
      ${message ? `
      <div style="margin-top:20px;padding-top:20px;border-top:1px solid #ded0c4">
        <div style="color:#6b5a52;font:600 13px/1.5 Arial,sans-serif;margin-bottom:8px">Bericht</div>
        <div style="color:#2e1c15;font:400 14px/1.7 Arial,sans-serif;white-space:pre-wrap">${escapeHtml(message)}</div>
      </div>` : ''}
    </div>
    <div style="padding:14px 24px;background:#f4ece3;color:#6b5a52;font:400 12px/1.5 Arial,sans-serif">
      Verstuurd via het formulier op cafekoos.com
    </div>
  </div>
</body></html>`;

  const text = fields.filter(([, v]) => v).map(([l, v]) => `${l}: ${v}`).join('\n') +
    (message ? `\n\nBericht:\n${message}` : '') +
    '\n\n— Verstuurd via het formulier op cafekoos.com';

  return { html, text };
}

async function sendViaResend({ subject, html, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const err = new Error('RESEND_API_KEY ontbreekt');
    err.code = 'CONFIG';
    throw err;
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || MAIL_FROM,
      to: [process.env.MAIL_TO || MAIL_TO],
      reply_to: replyTo, // het adres dat de bezoeker invulde

      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const err = new Error(`Resend gaf ${response.status}: ${detail.slice(0, 300)}`);
    err.code = 'PROVIDER';
    throw err;
  }

  return response.json().catch(() => ({}));
}

/**
 * Wikkelt een endpoint: methode-check, spamfilter, validatie, verzenden.
 * `build(data)` geeft { subject, title, fields, message, replyTo } terug,
 * of gooit een Error met code 'VALIDATION' en een nette melding.
 */
function handler(build) {
  return async function (req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ ok: false, error: 'Methode niet toegestaan.' });
    }

    const data = parseBody(req);

    // Honeypot: dit veld is voor mensen onzichtbaar. Ingevuld = bot.
    // We doen alsof het gelukt is, zodat de bot niets leert.
    if (clean(data.website, 200)) {
      return res.status(200).json({ ok: true });
    }

    try {
      const mail = build(data);
      const { html, text } = renderMail(mail.title, mail.fields, mail.message);
      await sendViaResend({ subject: mail.subject, html, text, replyTo: mail.replyTo });
      return res.status(200).json({ ok: true });
    } catch (err) {
      if (err.code === 'VALIDATION') {
        return res.status(400).json({ ok: false, error: err.message });
      }
      // Echte fout: loggen voor onszelf, maar niets technisch teruggeven.
      console.error('[formulier]', err.code || 'ONBEKEND', err.message);
      return res.status(502).json({
        ok: false,
        error: 'Versturen lukte niet. Probeer het later nog eens, of mail ons direct op bakkerlianne@live.nl.'
      });
    }
  };
}

function invalid(message) {
  const err = new Error(message);
  err.code = 'VALIDATION';
  return err;
}

module.exports = { LIMITS, clean, isEmail, escapeHtml, handler, invalid };
