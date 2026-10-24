"use strict";
// Used by the dashboard page (/dashboard.html). Needs the ADMIN_KEY.
exports.handler = require("../../lib/endpoints").netlify("stats");
