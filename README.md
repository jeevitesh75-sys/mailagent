# Email agent (Gmail + Groq AI, on Vercel or Netlify)

It reads new emails in your Gmail, writes a reply using the answers you give it, and then either:
- **MODE=draft** (default): saves the reply as a Gmail draft. You read it and press Send. Safest way to start.
- **MODE=send**: sends the reply by itself.

You choose in one setting. No database, no login page, no PC needed.

## What it will NOT answer
It skips newsletters, mailing lists, "no-reply" senders, bounce messages, automatic replies and your own emails, so two robots can never reply to each other forever. Anything the AI cannot answer from your own text is labelled **AI-Needs-You** in Gmail and left for you. Replies may only contain links and addresses that you wrote in `knowledge.txt`.

Gmail labels it creates: `AI-Drafted`, `AI-Replied`, `AI-Needs-You`, `AI-Skipped`.

## Read this first
- The AI can be wrong. Start with `MODE=draft` for a week and read what it writes before you switch to `send`.
- Customer emails are sent to Groq (the AI provider) to write replies. Tell customers if your law or industry needs it, and do not use this for private, medical, legal or financial emails.
- Free plans change. Check the current limits of **Groq** (console.groq.com, Settings > Limits) and **Vercel** (vercel.com/pricing) or **Netlify** (netlify.com/pricing). On Netlify's free plan, if you use up the monthly credits, your site is paused until next month.
- Each run is time limited (about 30 seconds on Netlify, up to a minute on Vercel), so it answers up to `MAX_PER_RUN` emails (default 5) each time.
- Gmail limits sending. `DAILY_SEND_CAP` (default 100) and `MAX_PER_SENDER_PER_DAY` (default 2) keep you safe. Do not raise them a lot.
- Provided as is, without warranty.

## Setup from your phone

### 1. Write your answers
Open `knowledge.txt` and replace the text with your own: prices, timings, location, how to order, refund policy, links, contact. The more exact it is, the better the replies. Only facts written here are used.

### 2. Get a Groq key (free account)
1. Open https://console.groq.com and sign up.
2. **API Keys** > **Create API Key**. Copy it. Keep it private.

### 3. Get a Gmail app password
1. Turn on **2-Step Verification** in your Google account.
2. Open https://myaccount.google.com/apppasswords, create one named "email agent", copy the 16 letters.
You can delete it there any time to stop the agent.

### 4. Put the code on GitHub
Make a **private** repository on https://github.com and upload everything from this folder (do not upload `node_modules` or `.env`; `.gitignore` already skips them if you use git).

### 5A. Host on Vercel
1. https://vercel.com > sign up with GitHub > **Add New... > Project** > import the repository.
2. **Framework Preset: Other.** Leave Build and Output settings empty.
3. Open **Environment Variables** and add: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `GROQ_API_KEY`, `ADMIN_KEY` (20+ random characters) and `MODE` (`draft` or `send`). Optional: `BUSINESS_NAME`, `SIGNATURE`.
4. **Deploy**. Your address looks like `https://mailagent-xxxx.vercel.app`.
5. Test: open `https://YOUR-SITE.vercel.app/api/check?key=YOUR_ADMIN_KEY`. Every line must say `"ok": true`. To process new mail once right now, add `&run=1`.
6. Schedule: Vercel's free plan cannot run jobs more than once a day, so use a free scheduler. On https://cron-job.org create a cronjob: URL `https://YOUR-SITE.vercel.app/api/agent`, every 10 minutes, and under Advanced add the header `Authorization` = `Bearer YOUR_ADMIN_KEY`. The first run must show status 200.
7. Vercel's free Hobby plan is for **non-commercial use only**. If you run this for a business, use a paid Vercel plan or host it on Netlify.

### 5B. Host on Netlify (instead)
1. https://app.netlify.com > **Add new site > Import an existing project** > GitHub > choose the repository. Leave the build command empty.
2. **Site configuration > Environment variables**: add the same settings as above. Then **Deploys > Trigger deploy**.
3. Test: `https://YOUR-SITE.netlify.app/.netlify/functions/check?key=YOUR_ADMIN_KEY` (add `&run=1` to process mail once).
4. Schedule: Netlify runs the `agent` function every 10 minutes by itself (`schedule` in `netlify.toml`, UTC cron). Check it under **Logs > Functions > agent**. Netlify's free plan pauses the site when its monthly credits run out.

### 6. First real test
Send a question from another email address to your Gmail, for example "What are your timings?". Within ten minutes you should see a draft in Gmail (draft mode) or a reply (send mode). The original gets a Gmail label (`AI-Drafted`, `AI-Replied` or `AI-Needs-You`).

## Settings
| Name | Meaning |
|---|---|
| `MODE` | `draft` (you approve) or `send` (automatic). Anything else counts as `draft` |
| `GROQ_MODEL` | Default `openai/gpt-oss-20b`. Groq changes its model list. If the check page says the model is not accepted, pick one from console.groq.com/docs/models |
| `UNKNOWN_ACTION` | `flag` (default) leaves unanswerable emails for you. `holding` (send mode only) sends "we received it and will get back to you" |
| `MAX_PER_RUN` | Emails answered per run. Default 5 |
| `MAX_PER_SENDER_PER_DAY` | Replies to one person per day. Default 2 |
| `DAILY_SEND_CAP` | Emails sent per day in send mode. Default 100 |
| `LOOKBACK_DAYS` | Only emails newer than this are looked at. Default 2 |
| `TONE`, `SIGNATURE`, `BUSINESS_NAME` | Style of the replies |
| `BUSINESS_INFO` | Your answers as a setting. Used instead of `knowledge.txt` if set |

## Troubleshooting
| Problem | Fix |
|---|---|
| Check page: "Gmail refused the login" | Wrong Gmail address or app password, or 2-Step Verification is off. Make a new app password |
| Check page: Groq rejected the key / model | Make a new key. Or set `GROQ_MODEL` to a model in your Groq console |
| Nothing happens | Open the check page with `&run=1`. Look at the `events` list for the reason. Emails in Promotions, Social or Updates tabs are ignored on purpose |
| Many emails labelled `AI-Needs-You` | Your `knowledge.txt` does not contain the answer. Add it |
| "rate limit" message | Groq's free limit was reached. It continues next run. Lower `MAX_PER_RUN` |
| Replies look wrong | Switch to `MODE=draft`, improve `knowledge.txt`, set `TONE` |
| To stop it | Delete the Gmail app password, or pause the site in Netlify |

## For developers
`npm test` needs no install and uses fake mail and AI servers. The real libraries (`imapflow`, `mailparser`, `nodemailer`) are installed by Netlify during deploy.
