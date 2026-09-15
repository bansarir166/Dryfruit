#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { sendPersonalizedEmail } from "./send_all_leads.mjs";

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

async function sendTestToBansari() {
  const csvPath = resolve(process.cwd(), "LEADS_BATCH_2.csv");
  if (!existsSync(csvPath)) {
    console.error("LEADS_BATCH_2.csv not found");
    process.exit(1);
  }

  const content = readFileSync(csvPath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  const headers = parseCSVLine(lines[0]);
  const sampleValues = parseCSVLine(lines[1]); // Lead 101: Sunnyland Farms

  const sampleLead = {};
  headers.forEach((h, idx) => {
    sampleLead[h] = sampleValues[idx] || "";
  });

  // Override recipient to Bansari's inbox for review
  const originalEmail = sampleLead.contact.split("|").pop().trim();
  sampleLead.contact = `${sampleLead.contact.split("|")[0]} | bansarir166@gmail.com`;

  console.log(`\n============================================================`);
  console.log(`SENDING PERSONALIZED TEST SAMPLE TO: bansarir166@gmail.com`);
  console.log(`Sample Business:   ${sampleLead.business_name} (${sampleLead.city}, ${sampleLead.country})`);
  console.log(`Sample Recipient:  ${sampleLead.owner}`);
  console.log(`Real Lead Email:   ${originalEmail}`);
  console.log(`============================================================\n`);

  try {
    const res = await sendPersonalizedEmail(sampleLead);
    console.log(`✅ SUCCESS! Personalized email delivered to bansarir166@gmail.com`);
    console.log(`Message ID: ${res.messageId}`);
    console.log(`\nPlease check your inbox at bansarir166@gmail.com to review the email.`);
  } catch (err) {
    console.error(`❌ FAILED to send test email:`, err.message);
    process.exit(1);
  }
}

sendTestToBansari();
