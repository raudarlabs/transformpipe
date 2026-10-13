import { Hono } from 'hono';
import { addToTally } from './usage.js';
import { CAMPAIGN } from '../shared/usage.js';

/*
 * The 1-to-10 scale in the onboarding emails.
 *
 * Each number in the email is a link to `/rate?score=N&from=onb-a1`. Opening it shows a thank-you
 * page; the score is counted by the page itself, with a POST its script sends, and not by the GET.
 * Mail scanners — Outlook's Safe Links, corporate gateways — open every link in a message before
 * a person does, and a GET that counted would record all ten scores for every email they scan.
 *
 * What is counted is the score and which email it came from, as a daily total like everything
 * else in m2h_usage_daily: nothing says who. Brevo's own click statistics are where a score can
 * be matched to a person, for the owner of the Brevo account and nobody else.
 */

const rate = new Hono();

const scoreOf = (value: unknown) => {
  const n = Number(value);

  return Number.isInteger(n) && n >= 1 && n <= 10 ? n : null;
};

const fromOf = (value: unknown) => {
  const text = String(value ?? '').toLowerCase();

  return CAMPAIGN.test(text) ? text : '';
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function page(score: number | null, from: string): string {
  const said =
    score === null
      ? 'That link did not carry a score, so nothing was recorded.'
      : score >= 9
        ? 'That made our day. If you know someone who would like it, the link to send is transformpipe.com.'
        : score >= 7
          ? 'Thank you. What would make it a 10? Reply to the email: one line is plenty.'
          : 'Thank you for being honest. What got in the way? Reply to the email and tell us: it is read by the people who build it.';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Thank you — TransformPipe</title>
<style>
  :root { color-scheme: light; --page: #f6f6f4; --card: #fff; --ink: #0b0b0b; --dim: #52514e; --line: #e4e3df; --brand: #0f8f95; }
  @media (prefers-color-scheme: dark) {
    :root { color-scheme: dark; --page: #0f0e14; --card: #17171e; --ink: #f4f4f5; --dim: #b4b4bc; --line: #2a2a35; --brand: #14a8af; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100dvh; display: grid; place-items: center; padding: 16px; background: var(--page); color: var(--ink);
         font: 16px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { width: 100%; max-width: 30rem; background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 28px; }
  h1 { margin: 0 0 8px; font-size: 22px; }
  .score { font-size: 44px; font-weight: 700; color: var(--brand); margin: 4px 0 8px; font-variant-numeric: tabular-nums; }
  p { margin: 0 0 16px; color: var(--dim); }
  a.go { display: inline-block; padding: 10px 18px; border-radius: 8px; background: var(--brand); color: #fff; font-weight: 600; text-decoration: none; }
</style>
</head>
<body>
<main>
  <h1>Thank you</h1>
  ${score === null ? '' : `<div class="score">${score}<span style="font-size:20px;color:var(--dim)">/10</span></div>`}
  <p>${escapeHtml(said)}</p>
  <a class="go" href="/history">Open TransformPipe</a>
</main>
${
  score === null
    ? ''
    : `<script>
  fetch('/rate', { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ score: ${score}, from: ${JSON.stringify(from)} }), keepalive: true }).catch(function () {});
</script>`
}
</body>
</html>`;
}

const HEADERS = { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' };

rate.get('/rate', (c) =>
  c.html(page(scoreOf(c.req.query('score')), fromOf(c.req.query('from'))), 200, HEADERS)
);

rate.post('/rate', async (c) => {
  const body = (await c.req.json().catch(() => null)) as { score?: unknown; from?: unknown } | null;
  const score = scoreOf(body?.score);

  if (score !== null) {
    await addToTally({ event: 'rating', key: String(score), lang: '', source: 'email', campaign: fromOf(body?.from) });
  }

  return c.body(null, 204);
});

export default rate;
