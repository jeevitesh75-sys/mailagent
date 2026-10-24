"use strict";
// Vercel: your scheduler (cron-job.org) calls this every 10 minutes with the header  Authorization: Bearer YOUR_ADMIN_KEY
module.exports = require("../lib/endpoints").vercel("agent");
