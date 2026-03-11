# Cold Email Templates

## Variables

- `{{first_name}}` — Lead's first name
- `{{company_website}}` — Lead's company website (e.g., "AcmeConstruction.com")
- `{{industry}}` — Industry name in lowercase (e.g., "construction")
- `{{industry_slug}}` — URL slug (e.g., "construction")
- `{{code}}` — Promo code (e.g., "CONSTRUCTION-VIP")
- `{{max_uses}}` — Max uses for the code (e.g., "50")
- `{{pain_points}}` — Industry-specific pain description (see industry-variables.md)
- `{{case_study_line}}` — Industry-specific case study sentence (see industry-variables.md)
- `{{humor_variant}}` — Industry-specific joke for email 3 (see industry-variables.md)

---

## Email 1 — Soft Intro (no links)

**Timing:** Day 1
**Subject:** Are you the owner of {{company_website}}?

Hi!

I found your website and thought I'd reach out :)

I work at a start-up and we've built a tool that helps {{industry}} companies save hours every week by replacing {{pain_points}} with one custom platform. We've built +100 platforms, but we're looking for our first {{industry}} customers.

Would you be interested in trying it out? I'd send you a private access code — totally free, no strings.

If you're open to it, just reply and I'll send you the details.

Cheers,
Iñigo

---

## Email 2 — Code + Case Study (non-responders only)

**Timing:** 3-5 days after Email 1
**Subject:** Your access code for Evercreate

Hi again!

I know you're busy, so I'll cut to the chase. Here's your private access code:

**{{code}}**

Go to evercreate.co/{{industry_slug}} and enter it. It takes 20 minutes to see if it's a fit — we hop on a quick call and I show you what we'd build for you.

We recently helped a {{industry}} company consolidate 4 different tools into one custom platform. {{case_study_line}}.

We only have {{max_uses}} spots for {{industry}} this month. And there's no upfront cost, so all the risk is on us.

Cheers,
Iñigo

---

## Email 3 — Humor Follow-up (non-responders only)

**Timing:** 5-7 days after Email 2
**Subject:** Quick question

Hi {{first_name}},

I figure you're probably swamped, so I'll make it easy — just reply with a number:

1. I'm sorry, I've been swamped but I'm open to talking. When works for you?
2. I will never, ever talk to you. Leave me alone!
3. {{humor_variant}}

Either way, no hard feelings :)

Cheers,
Iñigo
