#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync } from "node:fs";
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
  console.error("❌ Missing BREVO_API_KEY in .env.local");
  process.exit(1);
}

// Build a master lead lookup index from all CSVs in workspace
export function loadAllLeadsIndex() {
  const map = new Map();
  const root = process.cwd();
  const files = readdirSync(root).filter(f => f.startsWith("LEAD") && f.endsWith(".csv"));

  for (const file of files) {
    try {
      const content = readFileSync(resolve(root, file), "utf8");
      const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) continue;

      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
      for (let i = 1; i < lines.length; i++) {
        // Simple CSV parse handling quotes
        const row = parseCSVLine(lines[i]);
        if (!row.length) continue;
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = row[idx] || "";
        });

        // Extract email
        const contact = obj.contact || "";
        const emailMatch = contact.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
          const email = emailMatch[0].toLowerCase().trim();
          if (!map.has(email)) {
            map.set(email, obj);
          }
        }
      }
    } catch {
      // Ignore file errors
    }
  }

  // Also check sent_emails.json
  const sentPath = resolve(root, "sent_emails.json");
  if (existsSync(sentPath)) {
    try {
      const sentList = JSON.parse(readFileSync(sentPath, "utf8"));
      for (const item of sentList) {
        if (item.email) {
          const email = item.email.toLowerCase().trim();
          if (!map.has(email)) {
            map.set(email, {
              id: item.id || "",
              business_name: item.business || "",
              owner: item.owner || "",
              contact: item.email,
              city: item.city || "",
              country: item.country || "",
              why_need_website: item.why_need_website || "",
            });
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  return map;
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function fetchBrevoEvents(eventType = "clicks") {
  const url = `https://api.brevo.com/v3/smtp/statistics/events?event=${eventType}&limit=100&sort=desc`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "api-key": apiKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API Error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.events || [];
}

async function main() {
  console.log("==========================================================");
  console.log("🔍 FETCHING PAST EMAIL LINK CLICKS & OPENS FROM BREVO");
  console.log("==========================================================\n");

  const leadIndex = loadAllLeadsIndex();
  console.log(`📚 Indexed ${leadIndex.size} total leads from CSV files and sent logs.\n`);

  console.log("1️⃣ Querying Brevo for 'clicks' events...");
  let clicks = [];
  try {
    clicks = await fetchBrevoEvents("clicks");
    console.log(`👉 Found ${clicks.length} total click events in Brevo history.\n`);
  } catch (err) {
    console.error("Error fetching clicks:", err.message);
  }

  console.log("2️⃣ Querying Brevo for 'opened' events...");
  let opens = [];
  try {
    opens = await fetchBrevoEvents("opened");
    console.log(`👉 Found ${opens.length} total open events in Brevo history.\n`);
  } catch (err) {
    console.error("Error fetching opens:", err.message);
  }

  const combinedMap = new Map();

  for (const c of clicks) {
    const email = c.email?.toLowerCase().trim();
    if (!email) continue;
    const existing = combinedMap.get(email) || { email, clicks: 0, opens: 0, lastEvent: c.date, link: c.link };
    existing.clicks += 1;
    if (c.link) existing.link = c.link;
    combinedMap.set(email, existing);
  }

  for (const o of opens) {
    const email = o.email?.toLowerCase().trim();
    if (!email) continue;
    const existing = combinedMap.get(email) || { email, clicks: 0, opens: 0, lastEvent: o.date };
    existing.opens += 1;
    combinedMap.set(email, existing);
  }

  const list = Array.from(combinedMap.values());
  console.log(`\n🎯 Found ${list.length} unique prospects who engaged with past emails!\n`);

  for (const item of list) {
    const lead = leadIndex.get(item.email) || {};
    console.log("----------------------------------------------------------");
    console.log(`📧 Email:         ${item.email}`);
    console.log(`🏢 Business:      ${lead.business_name || "N/A"}`);
    console.log(`👤 Owner/Exec:    ${lead.owner || "N/A"}`);
    console.log(`📍 Location:      ${[lead.city, lead.country].filter(Boolean).join(", ") || "N/A"}`);
    console.log(`💡 Why Need Site: ${lead.why_need_website || "N/A"}`);
    console.log(`🖱️ Link Clicks:   ${item.clicks}`);
    console.log(`👀 Email Opens:   ${item.opens}`);
    console.log(`⏰ Last Activity: ${item.lastEvent || "N/A"}`);
    if (item.link) console.log(`🔗 Clicked Link:  ${item.link}`);
  }

  console.log("\n==========================================================");
  console.log("Summary complete.");
}

if (process.argv[1]?.endsWith("fetch_brevo_activity.mjs")) {
  main().catch(console.error);
}
