#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fetchBrevoEvents, loadAllLeadsIndex } from "./fetch_brevo_activity.mjs";

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
  console.error("❌ Missing BREVO_API_KEY in .env.local");
  process.exit(1);
}

const DATA_DIR = resolve(process.cwd(), "data");
const CLICKED_LEADS_PATH = resolve(DATA_DIR, "clicked_leads.json");
const SENT_FOLLOWUPS_PATH = resolve(DATA_DIR, "sent_followups.json");

function loadSentFollowups() {
  if (!existsSync(SENT_FOLLOWUPS_PATH)) return new Set();
  try {
    const list = JSON.parse(readFileSync(SENT_FOLLOWUPS_PATH, "utf8"));
    return new Set(list.map(item => item.email?.toLowerCase().trim()));
  } catch {
    return new Set();
  }
}

function saveSentFollowup(entry) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  let list = [];
  if (existsSync(SENT_FOLLOWUPS_PATH)) {
    try {
      list = JSON.parse(readFileSync(SENT_FOLLOWUPS_PATH, "utf8"));
    } catch {
      list = [];
    }
  }
  list.push(entry);
  writeFileSync(SENT_FOLLOWUPS_PATH, JSON.stringify(list, null, 2), "utf8");
}

function syncToClickedLeads(leadList) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  let current = [];
  if (existsSync(CLICKED_LEADS_PATH)) {
    try {
      current = JSON.parse(readFileSync(CLICKED_LEADS_PATH, "utf8"));
    } catch {
      current = [];
    }
  }

  for (const l of leadList) {
    const idx = current.findIndex(c => c.email.toLowerCase().trim() === l.email.toLowerCase().trim());
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...l };
    } else {
      current.push(l);
    }
  }

  writeFileSync(CLICKED_LEADS_PATH, JSON.stringify(current, null, 2), "utf8");
}

/**
 * Generate a highly personalized follow-up email for a prospect who clicked our demo link
 */
export function generatePersonalizedFollowup(lead) {
  const recipientName = lead.owner && lead.owner !== "N/A"
    ? lead.owner
    : lead.business_name;

  const subject = `Regarding ${lead.business_name}: Luxury e-commerce storefront & custom builder`;

  const locationStr = [lead.city, lead.country].filter(Boolean).join(", ");
  const customObservation = lead.why_need_website
    ? lead.why_need_website.trim()
    : `Elevating ${lead.business_name}'s digital presence with a direct-to-consumer luxury shopping experience.`;

  const textContent = `Dear ${recipientName},

I noticed you recently took a look at our luxury storefront demo from my previous email.

Given ${lead.business_name}'s reputation${locationStr ? ` in ${locationStr}` : ""}, I wanted to follow up with a quick thought:

${customObservation}

We built our platform specifically for high-end gourmet food and specialty confections, featuring:
1. Interactive Custom Box & Hamper Builder — Allows corporate & retail buyers to compose custom gift tins, assortments, and luxury collections online.
2. Turnkey Luxury Design — Built with Garamond typography, fluid micro-interactions, and instant Stripe checkout.
3. Custom Development Options — We can either hand over this turnkey storefront ready-to-sell in 24 hours, or build a fully bespoke e-commerce experience tailored to your exact brand aesthetics and backend workflows.

Live Demo Link: https://dryfruit-web.vercel.app/

Would you be open for a brief 5-minute call or a quick exchange here over email to discuss how we might tailor this for ${lead.business_name}?

Warm regards,
Bansari
E-Commerce & Digital Storefront Specialist
bansarir166@gmail.com`;

  const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f9f8f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1c1917;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f6;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;padding:36px;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <tr>
            <td>
              <h2 style="font-family:Georgia,serif;color:#451a03;font-size:22px;margin:0 0 16px;">Dear ${recipientName},</h2>
              
              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                I noticed you recently took a look at our luxury storefront demo from my previous note.
              </p>

              <div style="background:#fef3c7;border-left:4px solid #d97706;padding:14px 16px;border-radius:4px;margin:20px 0;">
                <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;">
                  <strong>Note for ${lead.business_name}:</strong> ${customObservation}
                </p>
              </div>

              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                We built this solution specifically for premium gourmet retailers and confectioners:
              </p>

              <ul style="padding-left:20px;margin:0 0 24px;font-size:14px;line-height:1.8;color:#57534e;">
                <li><strong>Interactive Gift Box Builder:</strong> Allow corporate and retail buyers to curate custom assortments and gift boxes in real time.</li>
                <li><strong>Turnkey Luxury Design:</strong> Ready to launch in 24 hours with integrated Stripe checkout, mobile optimization, and inventory controls.</li>
                <li><strong>Custom Build Option:</strong> Fully bespoke development to match your exact brand guidelines and operational requirements.</li>
              </ul>

              <div style="text-align:center;margin:32px 0;">
                <a href="https://dryfruit-web.vercel.app/" target="_blank"
                   style="background:#78350f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
                  👉 Explore Storefront & Gift Box Builder
                </a>
              </div>

              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                Would you be open for a quick 5-minute call or a brief reply over email to explore options for <strong>${lead.business_name}</strong>?
              </p>

              <hr style="border:none;border-top:1px solid #f5f5f4;margin:28px 0 20px;" />
              <p style="font-size:14px;color:#1c1917;margin:0;line-height:1.5;">
                Warm regards,<br/>
                <strong>Bansari</strong><br/>
                <span style="color:#78716c;font-size:13px;">E-Commerce & Digital Storefront Specialist</span><br/>
                <a href="mailto:bansarir166@gmail.com" style="color:#78350f;font-size:13px;">bansarir166@gmail.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, textContent, htmlContent };
}

async function sendFollowup(lead) {
  const { subject, textContent, htmlContent } = generatePersonalizedFollowup(lead);
  const recipientName = lead.owner && lead.owner !== "N/A" ? lead.owner : lead.business_name;

  const payload = {
    sender: { name: "Bansari", email: "bansarir166@gmail.com" },
    to: [{ email: lead.email, name: recipientName }],
    subject,
    textContent,
    htmlContent,
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to send to ${lead.email}: ${res.status} - ${errText}`);
  }

  return await res.json();
}

async function main() {
  const isLive = process.argv.includes("--live");
  const force = process.argv.includes("--force");
  const singleEmail = process.argv.find(a => a.includes("@"));

  console.log("==========================================================================");
  console.log("🎯 PERSONALIZED FOLLOW-UP DISPATCH FOR PROSPECTS WHO CLICKED OUR LINK");
  console.log(`Mode: ${isLive ? "🚀 LIVE SENDING VIA BREVO" : "🔍 DRY RUN (Preview only, use --live to send)"}`);
  console.log("==========================================================================\n");

  const leadsIndex = loadAllLeadsIndex();
  const sentFollowups = loadSentFollowups();

  console.log("📡 Fetching click events from Brevo API...");
  const clickEvents = await fetchBrevoEvents("clicks");
  console.log(`📊 Found ${clickEvents.length} click events in Brevo.\n`);

  const clickersMap = new Map();
  for (const c of clickEvents) {
    const email = c.email?.toLowerCase().trim();
    if (!email) continue;
    const existing = clickersMap.get(email) || { email, clicks: 0, lastClicked: c.date };
    existing.clicks++;
    clickersMap.set(email, existing);
  }

  const targets = [];
  for (const [email, info] of clickersMap.entries()) {
    const leadMeta = leadsIndex.get(email) || {};
    const lead = {
      id: leadMeta.id || `click_${Date.now()}`,
      email,
      business_name: leadMeta.business_name || "Gourmet Specialty Brand",
      owner: leadMeta.owner || "",
      city: leadMeta.city || "",
      country: leadMeta.country || "",
      why_need_website: leadMeta.why_need_website || "",
      click_count: info.clicks,
      first_clicked_at: info.lastClicked || new Date().toISOString(),
      last_clicked_at: info.lastClicked || new Date().toISOString(),
      status: "HOT_LEAD",
    };
    targets.push(lead);
  }

  // Sync these leads to data/clicked_leads.json so Admin dashboard reflects them
  syncToClickedLeads(targets);
  console.log(`💾 Synced ${targets.length} clicked leads into data/clicked_leads.json for Admin Dashboard.\n`);

  let toProcess = targets;
  if (singleEmail) {
    toProcess = targets.filter(t => t.email.toLowerCase() === singleEmail.toLowerCase());
    if (toProcess.length === 0) {
      const meta = leadsIndex.get(singleEmail.toLowerCase()) || {};
      toProcess = [{
        email: singleEmail,
        business_name: meta.business_name || "Gourmet Partner",
        owner: meta.owner || "",
        city: meta.city || "",
        country: meta.country || "",
        why_need_website: meta.why_need_website || "",
        click_count: 1,
      }];
    }
  } else if (!force) {
    toProcess = targets.filter(t => !sentFollowups.has(t.email.toLowerCase()));
  }

  console.log(`📋 Total Clickers Found:    ${targets.length}`);
  console.log(`🎯 Pending Follow-Up:       ${toProcess.length}`);
  console.log(`⏭️ Previously Contacted:   ${sentFollowups.size}\n`);

  if (toProcess.length === 0) {
    console.log("✅ All clickers have already been sent a follow-up email!");
    console.log("💡 To force re-send to everyone, add --force");
    return;
  }

  for (let i = 0; i < toProcess.length; i++) {
    const lead = toProcess[i];
    const { subject, textContent } = generatePersonalizedFollowup(lead);

    console.log(`--------------------------------------------------------------------------`);
    console.log(`[${i + 1}/${toProcess.length}] ${lead.business_name} (${lead.email})`);
    console.log(`👤 Executive:   ${lead.owner || "N/A"}`);
    console.log(`📍 Location:    ${[lead.city, lead.country].filter(Boolean).join(", ") || "N/A"}`);
    console.log(`🖱️ Clicks:      ${lead.click_count || 1}`);
    console.log(`📌 Subject:     ${subject}`);

    if (!isLive) {
      console.log(`\n📝 Preview Text Body:`);
      console.log(textContent.split("\n").slice(0, 8).join("\n") + "\n...\n");
    } else {
      try {
        console.log(`🚀 Dispatching personalized follow-up via Brevo...`);
        const res = await sendFollowup(lead);
        console.log(`✅ SENT! Brevo Message ID: ${res.messageId}`);
        saveSentFollowup({
          email: lead.email,
          business: lead.business_name,
          sentAt: new Date().toISOString(),
          messageId: res.messageId,
        });

        // Update clicked_leads.json with contacted status
        lead.followed_up_at = new Date().toISOString();
        lead.status = "CONTACTED";
        syncToClickedLeads([lead]);

        // Rate-limit safety delay
        await new Promise(r => setTimeout(r, 800));
      } catch (err) {
        console.error(`❌ Failed to send to ${lead.email}:`, err.message);
      }
    }
  }

  console.log("\n==========================================================================");
  if (!isLive) {
    console.log("🔍 DRY RUN FINISHED.");
    console.log("👉 To dispatch live emails to all clickers, run:");
    console.log("   node scripts/send_personalized_followup_to_clickers.mjs --live");
    console.log("👉 To dispatch to one specific prospect as a test:");
    console.log("   node scripts/send_personalized_followup_to_clickers.mjs --live contact@laduree.com");
  } else {
    console.log("🎉 ALL FOLLOW-UP EMAILS DELIVERED SUCCESSFULLY!");
  }
  console.log("==========================================================================\n");
}

main().catch(console.error);
