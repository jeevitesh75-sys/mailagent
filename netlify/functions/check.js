"use strict";
// Open /.netlify/functions/check?key=YOUR_ADMIN_KEY to test your settings. Add &run=1 to process mail once now.
exports.handler = require("../../lib/endpoints").netlify("check");
