"use strict";
// Vercel: used by the dashboard page (/dashboard.html). Needs the ADMIN_KEY.
module.exports = require("../lib/endpoints").vercel("stats");
