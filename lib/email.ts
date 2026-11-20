import 'server-only';

const FROM = () => process.env.EMAIL_FROM || 'TS-HURT <orders@ts-hurt.com>';

export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return {skipped: true};
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({from: FROM(), to, subject, html}),
  });
  if (!res.ok) console.error('Resend send failed', res.status, await res.text());
  return {ok: res.ok};
}

/** Adds a subscriber to the Resend audience the marketing broadcasts go to. */
export async function addSubscriber(email: string, source: string) {
  const key = process.env.RESEND_API_KEY, audience = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audience) return {skipped: true};
  const res = await fetch(`https://api.resend.com/audiences/${audience}/contacts`, {
    method: 'POST',
    headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({email, unsubscribed: false, first_name: source}),
  });
  return {ok: res.ok || res.status === 409};
}

export const shell = (body: string) => `<div style="background:#0b0b0b;color:#eee8d8;font-family:Arial,sans-serif;padding:32px"><div style="max-width:560px;margin:auto"><div style="font:900 28px Arial;letter-spacing:-1px">TS-<span style="color:#d52a24">HURT</span></div><div style="font:700 10px monospace;letter-spacing:2px;color:#a6a197;margin-bottom:24px">FEELINGS SOLD SEPARATELY</div>${body}<p style="font:11px monospace;color:#81786f;margin-top:32px">TS-HURT // AN UNDERGROUND PRINT OPERATION</p></div></div>`;
export const button = (href: string, label: string) => `<a href="${href}" style="display:inline-block;background:#d52a24;color:#fff;padding:16px 22px;font:900 13px monospace;letter-spacing:1px;text-decoration:none">${label}</a>`;
