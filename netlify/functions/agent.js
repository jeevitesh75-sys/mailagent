"use strict";
// Netlify runs this on the schedule in netlify.toml. Reads new mail and writes replies.
const core = require("../../lib/core");
exports.handler = async () => {
  try {
    core.loadConfig(process.env); // fails first with a plain message if a setting is missing
    const r = await core.run(process.env, require("../../lib/deps")(), e => console.log(JSON.stringify(e)));
    console.log(JSON.stringify({ mode: r.mode, scanned: r.scanned, drafted: r.drafted, sent: r.sent, flagged: r.flagged, skipped: r.skipped, error: r.error }));
  } catch (e) { console.log("Agent stopped: " + (e && e.message)); }
  return { statusCode: 200 };
};
