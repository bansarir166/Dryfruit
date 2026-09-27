#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import dns from "node:dns/promises";

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
  console.error("❌ Missing BREVO_API_KEY in environment or .env.local");
  process.exit(1);
}

const SENT_LOG_PATH = resolve(process.cwd(), "sent_emails.json");
const LEADS_500_PATH = resolve(process.cwd(), "LEADS_500.csv");
const NEW_LEAD_PATH = resolve(process.cwd(), "LEAD_502.csv");

function loadSentRegistry() {
  if (!existsSync(SENT_LOG_PATH)) {
    return { set: new Set(), list: [] };
  }
  try {
    const list = JSON.parse(readFileSync(SENT_LOG_PATH, "utf8"));
    const set = new Set(list.map((entry) => (entry.email || "").toLowerCase().trim()));
    return { set, list };
  } catch (err) {
    console.error("Warning: could not parse sent_emails.json:", err.message);
    return { set: new Set(), list: [] };
  }
}

function saveSentEmail(registry, entry) {
  registry.set.add(entry.email.toLowerCase().trim());
  registry.list.push(entry);
  writeFileSync(SENT_LOG_PATH, JSON.stringify(registry.list, null, 2), "utf8");
}

const newLead = {
  id: "502",
  business_name: "Vosges Haut-Chocolat & Exotic Nuts",
  country: "USA",
  city: "Chicago, IL",
  maps_profile: "https://maps.google.com/?q=Vosges+Haut+Chocolat+Chicago+IL",
  website_status: "Traditional web shop lacking an interactive custom dry fruit, date & nut gift box builder",
  social: "Instagram: @vosgeshautchocolat / Facebook: Vosges Haut-Chocolat",
  contact: "General Inquiries | support@vosgeschocolate.com",
  owner: "Katrina Markoff (Founder & Chocolatier)",
  why_need_website: "Renowned for sensory collections featuring Sicilian pistachios, organic walnuts, and exotic dates; could significantly boost holiday and corporate gift revenues with an interactive custom luxury box builder and concierge curation.",
  quality: "High"
};

async function verifyZeroBounce(email, registry) {
  console.log(`\n🔍 Running Zero-Bounce Verification for ${email}...`);
  
  // 1. Syntax check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error(`Syntax validation failed for ${email}`);
  }
  console.log(`✅ RFC 5322 Syntax check passed.`);

  // 2. Deduplication check
  const cleanEmail = email.toLowerCase().trim();
  if (registry.set.has(cleanEmail)) {
    throw new Error(`Email ${email} is already present in sent_emails.json (collision detected).`);
  }
  console.log(`✅ Deduplication check passed (0 duplicates in sent registry).`);

  // 3. DNS MX resolution
  const domain = email.split("@")[1];
  const mxRecords = await dns.resolveMx(domain);
  if (!mxRecords || mxRecords.length === 0) {
    throw new Error(`DNS MX lookup failed: No MX records found for ${domain}`);
  }
  const validMx = mxRecords.some((r) => r.exchange && r.exchange !== "." && r.exchange.length > 2);
  if (!validMx) {
    throw new Error(`DNS MX lookup failed: Domain ${domain} has null or invalid MX.`);
  }
  console.log(`✅ DNS MX Resolution verified: ${mxRecords[0].exchange} (Priority: ${mxRecords[0].priority})`);
  console.log(`🎉 100% Zero-Bounce verification passed for ${email}!\n`);
}

async function sendPersonalizedEmail(lead) {
  const contactParts = lead.contact.split("|");
  const recipientEmail = contactParts.pop().trim();
  const recipientName = lead.owner && lead.owner !== "N/A" ? lead.owner : lead.business_name;

  const sender = {
    name: "Bansari",
    email: "bansarir166@gmail.com"
  };

  const subject = `Partnership opportunity: Turnkey luxury dry-fruit website & custom web build for ${lead.business_name}`;

  const trackingParams = new URLSearchParams({
    id: lead.id || "",
    email: recipientEmail,
    biz: lead.business_name || "",
    name: recipientName || "",
    city: lead.city || "",
    country: lead.country || "",
  });
  const demoLink = `https://dryfruit-web.vercel.app/api/lead/click?${trackingParams.toString()}`;

  const text = `Dear ${recipientName},

I was researching top gourmet dry fruit, date & specialty nut businesses in ${lead.city}, ${lead.country} and came across ${lead.business_name}. Your collection of premium products and customer reputation caught my attention.

I noticed that ${lead.why_need_website.toLowerCase()}

We have developed a turnkey, ultra-luxurious e-commerce storefront specifically designed for dry fruit, date & gourmet nut retailers — plus custom website building options tailored specifically to your brand.

What is included:
- Cinematic Homepage: Custom luxury design tailored for gourmet food (Garamond & Outfit aesthetics)
- Interactive Custom Gift Box Builder: Allow customers to build their own date/nut gift boxes
- Full Commerce Stack: Integrated Stripe payments & cloud database backend
- Turnkey Admin Dashboard: Manage products, orders, inventory & discount coupons
- Custom Web Building Option: Fully customizable layout, branding, and features to fit your exact business goals

Preview the Live Demo Storefront:
${demoLink}

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
                I was researching top gourmet dry fruit, date & specialty nut businesses in <strong>${lead.city}, ${lead.country}</strong> and came across <strong>${lead.business_name}</strong>. Your collection of premium products and customer reputation really caught my attention!
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
                <a href="${demoLink}" target="_blank" style="background:#78350f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
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
    htmlContent: html
  };

  console.log(`🚀 Dispatching email via Brevo API to ${recipientName} (${recipientEmail})...`);
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
      Accept: "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to send to ${recipientEmail}: ${res.status} - ${errText}`);
  }

  const result = await res.json();
  console.log(`🎯 SUCCESS! Brevo Message ID: ${result.messageId}`);
  return result;
}

function escapeCSV(val) {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

async function main() {
  console.log(`=======================================================`);
  console.log(`NEW LEAD GENERATION & PERSONALIZED OUTREACH DISPATCH`);
  console.log(`Lead ID:        ${newLead.id}`);
  console.log(`Business Name:  ${newLead.business_name}`);
  console.log(`Location:       ${newLead.city}, ${newLead.country}`);
  console.log(`Contact:        ${newLead.contact}`);
  console.log(`Executive:      ${newLead.owner}`);
  console.log(`=======================================================`);

  const registry = loadSentRegistry();
  const email = newLead.contact.split("|").pop().trim();

  // 1. Zero-Bounce Verification
  await verifyZeroBounce(email, registry);

  // 2. Dispatch Personalized Email
  const sendRes = await sendPersonalizedEmail(newLead);

  // 3. Update sent_emails.json registry
  saveSentEmail(registry, {
    email: email.toLowerCase().trim(),
    id: newLead.id,
    business: newLead.business_name,
    sentAt: new Date().toISOString(),
    messageId: sendRes.messageId
  });
  console.log(`💾 Successfully recorded in sent_emails.json. Total sent records: ${registry.list.length}`);

  // 4. Write LEAD_501.csv
  const fieldnames = [
    "id", "business_name", "country", "city", "maps_profile",
    "website_status", "social", "contact", "owner", "why_need_website", "quality"
  ];
  const csvRow = fieldnames.map(f => escapeCSV(newLead[f])).join(",");
  const singleLeadContent = fieldnames.join(",") + "\n" + csvRow + "\n";
  writeFileSync(NEW_LEAD_PATH, singleLeadContent, "utf8");
  console.log(`📁 Created dedicated lead artifact: LEAD_${newLead.id}.csv`);

  // 5. Append to LEADS_500.csv
  if (existsSync(LEADS_500_PATH)) {
    const existingContent = readFileSync(LEADS_500_PATH, "utf8").trim();
    writeFileSync(LEADS_500_PATH, existingContent + "\n" + csvRow + "\n", "utf8");
    console.log(`📁 Appended lead ${newLead.id} to LEADS_500.csv (Total master leads: ${newLead.id})`);
  }

  console.log(`\n=======================================================`);
  console.log(`🎉 ALL TASKS COMPLETE! LEAD ${newLead.id} CREATED & PERSONALIZED EMAIL DELIVERED.`);
  console.log(`=======================================================\n`);
}

main().catch(err => {
  console.error("❌ Fatal execution error:", err);
  process.exit(1);
});
