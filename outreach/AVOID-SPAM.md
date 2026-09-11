# Stop emails landing in Spam (Brevo)

Professional copy helps a little. **A verified domain fixes most spam issues.**

## Why emails go to Spam

Shared/default senders and unverified domains look untrusted to Gmail, so messages often land in Spam even with good wording.

## Fix (required)

1. Buy or use a domain you own (e.g. `yoursite.com`).
2. Open [Brevo → Senders & IP → Domains](https://app.brevo.com/senders/domain/list) → **Add a domain**.
3. Add the DNS records Brevo shows (SPF, DKIM, and usually DMARC).
4. Wait until the domain is **authenticated / verified**.
5. Create an API key at [Brevo API keys](https://app.brevo.com/settings/keys/api).
6. Send with:

```bash
FROM_EMAIL='Sahil <hello@yoursite.com>' \
REPLY_TO='hello@yoursite.com' \
TO_EMAIL='bansari1660@gmail.com' \
BREVO_API_KEY='xkeysib-xxx' \
node scripts/send-brevo-test.mjs
```

Until the domain is verified, Brevo may limit who you can send to, and Gmail may still mark mail as Spam.

## Extra tips after domain verify

- Warm up: send a few emails/day first, not bulk.
- Keep subject lines calm (no “FREE!!!”, “URGENT”, heavy sales punctuation).
- Always include plain text + HTML (the script already does).
- Ask recipients to move one test mail to Inbox and mark “Not spam”.
- Rotate any API key you pasted in chat.
