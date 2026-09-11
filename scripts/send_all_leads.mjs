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
if (!apiKey) {
  console.error("Missing BREVO_API_KEY in environment");
  process.exit(1);
}

const sender = {
  name: "Bansari",
  email: "bansarir166@gmail.com"
};

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function sendPersonalizedEmail(lead) {
  const recipientEmail = lead.contact.split("|").pop().trim();
  const recipientName = lead.owner !== "N/A" ? lead.owner : lead.business_name;
  
  const subject = `Partnership opportunity: Turnkey luxury dry-fruit website & custom web build for ${lead.business_name}`;

  const text = `Dear ${recipientName},

I was researching top gourmet snack & dry fruit businesses in ${lead.city}, ${lead.country} and came across ${lead.business_name}. Your collection of premium products and customer reputation caught my attention.

I noticed that ${lead.why_need_website.toLowerCase()}

We have developed a turnkey, ultra-luxurious e-commerce storefront specifically designed for dry fruit, date & gourmet nut retailers — plus custom website building options tailored specifically to your brand.

What is included:
- Cinematic Homepage: Custom luxury design tailored for gourmet food
- Interactive Custom Gift Box Builder: Allow customers to build their own date/nut gift boxes
- Complete Commerce Stack: Integrated Stripe payments & cloud database backend
- Turnkey Admin Dashboard: Manage products, orders, inventory & discount coupons
- Custom Web Building Option: Fully customizable layout, branding, and features to fit your exact business goals

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
              <h2 style="margin:0 0 20px;font-size:22px;color:#451a03;font-family:Georgia,serif;">Dear ${recipientName},</h2>
              
              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                I was researching top gourmet snack & dry fruit businesses in <strong>${lead.city}, ${lead.country}</strong> and came across <strong>${lead.business_name}</strong>. Your collection of premium products and customer reputation really caught my attention!
              </p>
              
              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                I noticed that ${lead.why_need_website.toLowerCase()}
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
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    textContent: text,
    htmlContent: html,
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
      Accept: "application/json"
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to send to ${recipientEmail}: ${res.status} - ${errText}`);
  }

  return await res.json();
}

async function main() {
  const csvPath = resolve(process.cwd(), "LEADS_100.csv");
  if (!existsSync(csvPath)) {
    console.error("LEADS_100.csv not found");
    process.exit(1);
  }

  const content = readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter(l => l.trim().length > 0);
  if (lines.length <= 1) {
    console.error("No lead entries found in LEADS_100.csv");
    process.exit(1);
  }

  const headers = parseCSVLine(lines[0]);
  const leads = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= headers.length) {
      const lead = {};
      headers.forEach((h, idx) => {
        lead[h] = values[idx] || "";
      });
      leads.push(lead);
    }
  }

  console.log(`Loaded ${leads.length} target leads. Starting personalized email campaign...`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    try {
      const res = await sendPersonalizedEmail(lead);
      successCount++;
      console.log(`[${i + 1}/${leads.length}] SUCCESS: Sent to ${lead.business_name} (${lead.contact.split("|").pop().trim()}) - Message ID: ${res.messageId}`);
    } catch (err) {
      failCount++;
      console.error(`[${i + 1}/${leads.length}] ERROR: Failed for ${lead.business_name}:`, err.message);
    }
    // Brief pause between requests
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("\n============================================");
  console.log(`Campaign Summary`);
  console.log(`Successfully Sent: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log("============================================");
}

main();
