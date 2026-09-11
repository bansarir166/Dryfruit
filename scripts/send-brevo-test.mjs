#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const i = trimmed.indexOf("=");
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

const apiKey = process.env.BREVO_API_KEY;
const to = process.env.TO_EMAIL || "bansarir166@gmail.com";

if (!apiKey) {
  console.error("Missing BREVO_API_KEY");
  process.exit(1);
}

// Sender name set explicitly to Bansari
const sender = {
  name: "Bansari",
  email: "bansarir166@gmail.com"
};

const subject = "Partnership opportunity: Turnkey luxury dry-fruit website & custom web build";

const text = `Dear Store Owner,

I was researching top gourmet snack & dry fruit businesses and wanted to reach out regarding your online presence.

We have developed a turnkey, ultra-luxurious e-commerce storefront specifically designed for dry fruit, date & gourmet nut retailers — plus custom website building options tailored specifically to your brand.

What is included:
- Cinematic Homepage: Custom luxury aesthetic (Garamond & Outfit fonts)
- Interactive Custom Gift Box Builder: Build-your-own nut/date gift sets
- Complete Commerce Stack: Integrated Stripe payments & cloud backend
- Turnkey Admin Dashboard: Manage products, orders, inventory & discount coupons
- Custom Development & Branding: Full customization available to suit your specific catalog and brand design

Preview the Live Demo Storefront:
https://dryfruit-web.vercel.app/

Whether you want to acquire this ready-made storefront to launch in 24 hours or need a custom web build tailored for your business, we can set it up seamlessly.

Would you be open for a quick 5-minute call or reply over email to discuss options?

Best regards,
Bansari`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f9f8f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1c1917;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;padding:40px;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td>
              <h2 style="margin:0 0 20px;font-size:22px;color:#451a03;font-family:Georgia,serif;">Dear Store Owner,</h2>
              
              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                I hope you are doing well. I am reaching out to share a premium web solution built specifically for dry fruit, date, and gourmet nut retailers.
              </p>

              <div style="background:#fffbeb;border-left:4px solid #d97706;padding:16px;margin:24px 0;border-radius:6px;">
                <p style="margin:0;font-size:15px;color:#92400e;font-weight:600;">
                  ✨ Turnkey Ready-to-Launch Storefront + Custom Website Building Option
                </p>
              </div>

              <h4 style="margin:20px 0 10px;font-size:16px;color:#1c1917;">What's ready in our solution:</h4>
              <ul style="padding-left:20px;margin:0 0 24px;font-size:14px;line-height:1.8;color:#57534e;">
                <li><strong>Cinematic Homepage:</strong> Custom luxury design tailored for gourmet food</li>
                <li><strong>Interactive Custom Gift Box Builder:</strong> Allow customers to build their own date/nut gift boxes</li>
                <li><strong>Full Commerce Stack:</strong> Integrated Stripe payments & cloud database backend</li>
                <li><strong>Turnkey Admin Dashboard:</strong> Manage products, orders, inventory & discount coupons</li>
                <li><strong>Custom Web Building Option:</strong> Fully customizable layout, branding, and features to fit your exact business goals</li>
              </ul>

              <div style="text-align:center;margin:32px 0;">
                <a href="https://dryfruit-web.vercel.app/" target="_blank" style="background:#78350f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
                  👉 Preview Live Storefront Demo
                </a>
              </div>

              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                Whether you want to acquire this complete ready-to-launch store or build a custom e-commerce experience from scratch, we can get your online sales up and running smoothly.
              </p>

              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                Would you be open for a quick 5-minute call or reply over email to explore options?
              </p>

              <hr style="border:none;border-top:1px solid #f5f5f4;margin:32px 0 24px;" />
              
              <p style="margin:0;font-size:15px;color:#1c1917;">
                Best regards,<br/>
                <strong>Bansari</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const payload = {
  sender,
  to: [{ email: to, name: "Bansari" }],
  subject,
  textContent: text,
  htmlContent: html,
};

const res = await fetch("https://api.brevo.com/v3/smtp/email", {
  method: "POST",
  headers: {
    "api-key": apiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify(payload),
});

const body = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error("Brevo error:", res.status, body);
  process.exit(1);
}
console.log("Sent OK to bansarir166@gmail.com with Bansari signature:", body);
