#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

// 1. Load .env.local
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

const DATA_DIR = resolve(process.cwd(), "data");
const LEADS_FILE_PATH = resolve(DATA_DIR, "clicked_leads.json");
const SENT_LOG_PATH = resolve(process.cwd(), "sent_emails.json");

function loadClickedLeads() {
  if (!existsSync(LEADS_FILE_PATH)) return [];
  try {
    return JSON.parse(readFileSync(LEADS_FILE_PATH, "utf8"));
  } catch {
    return [];
  }
}

function saveClickedLeads(leads) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf8");
}

function loadSentRegistryMap() {
  if (!existsSync(SENT_LOG_PATH)) return new Map();
  try {
    const list = JSON.parse(readFileSync(SENT_LOG_PATH, "utf8"));
    const map = new Map();
    for (const item of list) {
      if (item.email) {
        map.set(item.email.toLowerCase().trim(), item);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

/**
 * Check Brevo transactional statistics events API for any link clicks
 */
async function syncClicksFromBrevo(leadsList, sentMap) {
  console.log("📡 Checking Brevo Transactional Statistics for click events...");
  try {
    const url = "https://api.brevo.com/v3/smtp/statistics/events?event=clicks&limit=100";
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "api-key": apiKey,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.log(`ℹ️ Brevo events check status: ${res.status} (Standard SMTP events)`);
      return;
    }

    const data = await res.json();
    const events = data.events || [];
    console.log(`📊 Retrieved ${events.length} click events from Brevo API.`);

    let addedCount = 0;
    for (const evt of events) {
      const email = evt.email?.toLowerCase().trim();
      if (!email) continue;

      const existing = leadsList.find((l) => l.email.toLowerCase().trim() === email);
      if (!existing) {
        const sentInfo = sentMap.get(email);
        leadsList.push({
          id: sentInfo?.id || `brevo_${Date.now()}`,
          email,
          business_name: sentInfo?.business || "Gourmet Dry Fruit Partner",
          owner: sentInfo?.owner || "",
          city: sentInfo?.city || "",
          country: sentInfo?.country || "",
          first_clicked_at: evt.date || new Date().toISOString(),
          last_clicked_at: evt.date || new Date().toISOString(),
          click_count: 1,
          status: "HOT_LEAD",
        });
        addedCount++;
      }
    }

    if (addedCount > 0) {
      console.log(`✨ Synced ${addedCount} newly discovered clickers from Brevo into local tracking!`);
      saveClickedLeads(leadsList);
    }
  } catch (err) {
    console.log("Notice: Brevo events sync skipped or not configured:", err.message);
  }
}

/**
 * Dispatch personalized follow-up email via Brevo
 */
async function sendFollowupEmail(lead) {
  const recipientName = lead.owner && lead.owner !== "N/A" ? lead.owner : (lead.business_name || "there");
  const subject = `Glad you took a look at our luxury dry-fruit storefront — quick question for ${lead.business_name}`;

  const text = `Dear ${recipientName},

I noticed you recently took a look at our luxury dry fruit & gourmet nut e-commerce storefront demo.

I'd love to hear your thoughts — would you be looking for a ready-to-launch turnkey setup to begin selling online immediately, or a fully custom web design tailored to ${lead.business_name}'s exact aesthetic and catalog?

If you have 5 minutes, feel free to reply directly to this email or let me know a convenient time for a brief introductory call.

Warm regards,
Bansari
Gourmet E-commerce Specialist`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f9f8f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;padding:36px;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
    <h2 style="font-family:Georgia,serif;color:#451a03;font-size:22px;margin:0 0 16px;">Dear ${recipientName},</h2>
    
    <p style="font-size:15px;line-height:1.6;color:#44403c;">
      I noticed you recently took a look at our luxury dry fruit & gourmet nut e-commerce storefront demo.
    </p>

    <div style="background:#fef3c7;border-left:4px solid #d97706;padding:14px 16px;border-radius:4px;margin:20px 0;">
      <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">
        ✨ Tailored Storefront or Custom Build for ${lead.business_name}
      </p>
    </div>

    <p style="font-size:15px;line-height:1.6;color:#44403c;">
      I'd love to hear your thoughts — would you be looking for a ready-to-launch turnkey setup to begin selling online immediately, or a fully custom web design tailored to <strong>${lead.business_name}</strong>'s exact aesthetic and catalog?
    </p>
    
    <p style="font-size:15px;line-height:1.6;color:#44403c;">
      If you have 5 minutes, feel free to reply directly to this email or let me know a convenient time for a brief introductory call.
    </p>

    <div style="text-align:center;margin:28px 0;">
      <a href="mailto:bansarir166@gmail.com?subject=Re:%20Discussion%20for%20${encodeURIComponent(lead.business_name)}"
         style="background:#78350f;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;display:inline-block;">
        Reply to Bansari
      </a>
    </div>

    <hr style="border:none;border-top:1px solid #f5f5f4;margin:28px 0 20px;" />
    <p style="font-size:14px;color:#1c1917;margin:0;">
      Warm regards,<br/>
      <strong>Bansari</strong><br/>
      <span style="color:#78716c;font-size:13px;">Gourmet E-commerce Specialist</span>
    </p>
  </div>
</body>
</html>`;

  const payload = {
    sender: { name: "Bansari", email: "bansarir166@gmail.com" },
    to: [{ email: lead.email, name: recipientName }],
    subject,
    textContent: text,
    htmlContent: html,
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
    throw new Error(`Failed to send follow-up to ${lead.email}: ${res.status} - ${errText}`);
  }

  return await res.json();
}

async function main() {
  console.log("=================================================================");
  console.log("🚀 FOLLOW-UP DISPATCHER FOR EMAIL LINK CLICKERS");
  console.log("=================================================================\n");

  const sentMap = loadSentRegistryMap();
  let clickedLeads = loadClickedLeads();

  // Sync any clicks from Brevo
  await syncClicksFromBrevo(clickedLeads, sentMap);

  const targetArg = process.argv[2];
  const force = process.argv.includes("--force");

  let targets = [];
  if (targetArg && !targetArg.startsWith("--")) {
    const match = clickedLeads.find(
      (l) => l.email.toLowerCase().trim() === targetArg.toLowerCase().trim() || l.id === targetArg
    );
    if (match) {
      targets = [match];
    } else {
      console.log(`ℹ️ Email '${targetArg}' not found in clicked_leads. Creating temporary entry...`);
      const sentEntry = sentMap.get(targetArg.toLowerCase().trim());
      targets = [
        {
          id: sentEntry?.id || "manual",
          email: targetArg,
          business_name: sentEntry?.business || "Gourmet Partner",
          owner: sentEntry?.owner || "",
          click_count: 1,
          first_clicked_at: new Date().toISOString(),
          last_clicked_at: new Date().toISOString(),
          status: "HOT_LEAD",
        },
      ];
    }
  } else {
    targets = force
      ? clickedLeads
      : clickedLeads.filter((l) => !l.followed_up_at);
  }

  console.log(`📋 Total Clicked Leads in Registry:  ${clickedLeads.length}`);
  console.log(`🎯 Leads Pending Follow-Up:          ${targets.length}\n`);

  if (targets.length === 0) {
    console.log("✅ All clicked leads have already received follow-ups! (Or no clicks recorded yet)");
    console.log("💡 Tip: To send to a specific email directly, run:");
    console.log("   node scripts/send_followup_to_clicked_leads.mjs prospect@domain.com");
    console.log("💡 Tip: To force re-send to all clickers, run:");
    console.log("   node scripts/send_followup_to_clicked_leads.mjs --force\n");
    return;
  }

  let successCount = 0;
  for (const lead of targets) {
    try {
      console.log(`✉️ Sending follow-up to: ${lead.business_name} (${lead.email})...`);
      const res = await sendFollowupEmail(lead);
      console.log(`   ✅ Sent successfully! Message ID: ${res.messageId}`);

      lead.followed_up_at = new Date().toISOString();
      lead.status = "CONTACTED";
      successCount++;

      // Save progress immediately
      const idx = clickedLeads.findIndex((l) => l.email === lead.email);
      if (idx >= 0) {
        clickedLeads[idx] = lead;
      } else {
        clickedLeads.unshift(lead);
      }
      saveClickedLeads(clickedLeads);

      // Brief delay between sends to avoid rate limits
      await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      console.error(`   ❌ Error sending to ${lead.email}:`, err.message);
    }
  }

  console.log("\n=================================================================");
  console.log(`🎉 DISPATCH COMPLETE: ${successCount} of ${targets.length} follow-ups sent!`);
  console.log("=================================================================\n");
}

main().catch((err) => {
  console.error("❌ Execution error:", err);
  process.exit(1);
});
