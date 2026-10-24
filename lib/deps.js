"use strict";
// Loads the real libraries. Kept separate so tests never need them installed.
module.exports = () => ({
  ImapFlow: require("imapflow").ImapFlow,
  simpleParser: require("mailparser").simpleParser,
  nodemailer: require("nodemailer"),
  MailComposer: require("nodemailer/lib/mail-composer"),
  fetch: (...a) => fetch(...a),
  now: () => Date.now(),
});
