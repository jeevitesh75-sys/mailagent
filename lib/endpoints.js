"use strict";
// One place for the two web addresses, used by both Netlify and Vercel wrappers.
//   check: test your settings (&run=1 processes mail once, right now)
//   agent: process new mail (called on a schedule)
const core = require("./core");

// Returns { status, body } and never throws.
async function endpoint(kind, { key, run }, env = process.env, getDeps = () => require("./deps")()) {
  const k = String(env.ADMIN_KEY || "");
  if (k.length < 16) return { status: 500, body: { error: "Set ADMIN_KEY (at least 16 characters) in your environment variables, then redeploy." } };
  if (!core.sameKey(key || "", k)) return { status: 401, body: { error: "Wrong key" } };
  try {
    if (kind === "agent" || run) { core.loadConfig(env); const r = await core.run(env, getDeps()); return { status: 200, body: kind === "agent" ? { ok: true, scanned: r.scanned, drafted: r.drafted, sent: r.sent, flagged: r.flagged, skipped: r.skipped, error: r.error } : r }; }
    return { status: 200, body: { steps: await core.selfTest(env, getDeps()) } };
  } catch (e) { return { status: 200, body: { error: e.message } }; }
}

const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
// Vercel: /api/check?key=...   or   Authorization: Bearer ...
const vercel = kind => async (req, res) => {
  const q = new URL(req.url, "http://x").searchParams;
  const m = /^Bearer (.+)$/.exec(String(req.headers.authorization || ""));
  const r = await endpoint(kind, { key: m ? m[1] : q.get("key"), run: q.has("run") });
  res.statusCode = r.status; for (const [h, v] of Object.entries(headers)) res.setHeader(h, v);
  res.end(JSON.stringify(r.body, null, 2));
};
// Netlify: /.netlify/functions/check?key=...
const netlify = kind => async event => {
  const q = event.queryStringParameters || {};
  const m = /^Bearer (.+)$/.exec(String((event.headers && (event.headers.authorization || event.headers.Authorization)) || ""));
  const r = await endpoint(kind, { key: m ? m[1] : q.key, run: "run" in q });
  return { statusCode: r.status, headers, body: JSON.stringify(r.body, null, 2) };
};

module.exports = { endpoint, vercel, netlify };
