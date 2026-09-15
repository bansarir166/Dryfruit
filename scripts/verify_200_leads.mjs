#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import dns from "node:dns/promises";

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

const targetFile = process.argv[2] || "LEADS_200_NEW.csv";
const csvPath = resolve(process.cwd(), targetFile);

if (!existsSync(csvPath)) {
  console.error(`File not found: ${csvPath}`);
  process.exit(1);
}

const content = readFileSync(csvPath, "utf-8");
const lines = content.split("\n").filter((l) => l.trim().length > 0);
const headers = parseCSVLine(lines[0]);

console.log(`\n========================================================`);
console.log(`ZERO-BOUNCE PRE-FLIGHT VERIFICATION: ${targetFile}`);
console.log(`Total Leads to Validate: ${lines.length - 1}`);
console.log(`========================================================\n`);

// Load previously sent emails for deduplication check
const sentLogPath = resolve(process.cwd(), "sent_emails.json");
const sentSet = new Set();
if (existsSync(sentLogPath)) {
  try {
    const sentList = JSON.parse(readFileSync(sentLogPath, "utf8"));
    for (const entry of sentList) {
      if (entry.email) sentSet.add(entry.email.toLowerCase().trim());
    }
    console.log(`Loaded ${sentSet.size} previously sent emails to guard against duplicates.\n`);
  } catch (err) {
    console.warn("Could not read sent_emails.json:", err.message);
  }
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const domainCache = new Map();

async function checkDomainMx(domain) {
  if (domainCache.has(domain)) {
    return domainCache.get(domain);
  }
  try {
    const records = await dns.resolveMx(domain);
    const validRecords = Array.isArray(records)
      ? records.filter((r) => r.exchange && r.exchange !== "." && !r.exchange.endsWith(".invalid"))
      : [];
    const valid = validRecords.length > 0;
    const result = { valid, error: valid ? null : "No active MX exchange", records: validRecords };
    domainCache.set(domain, result);
    return result;
  } catch (err) {
    const result = { valid: false, error: err.code || err.message, records: [] };
    domainCache.set(domain, result);
    return result;
  }
}

async function verify() {
  let passedCount = 0;
  let syntaxFailCount = 0;
  let mxFailCount = 0;
  let duplicateCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const lead = {};
    headers.forEach((h, idx) => {
      lead[h] = cols[idx] || "";
    });

    const contactParts = lead.contact ? lead.contact.split("|") : [];
    const email = contactParts.pop()?.trim();
    const phone = contactParts.join("|").trim();

    if (!email || !emailRegex.test(email)) {
      console.log(`❌ [ID ${lead.id}] ${lead.business_name}: INVALID EMAIL SYNTAX "${email}"`);
      syntaxFailCount++;
      continue;
    }

    const cleanEmail = email.toLowerCase();
    if (sentSet.has(cleanEmail)) {
      console.log(`⚠️ [ID ${lead.id}] ${lead.business_name}: DUPLICATE (Already sent in prior batch) -> ${email}`);
      duplicateCount++;
      continue;
    }

    const domain = email.split("@")[1];
    const mxResult = await checkDomainMx(domain);

    if (mxResult.valid) {
      passedCount++;
      const topMx = mxResult.records[0]?.exchange || "OK";
      console.log(`✅ [ID ${lead.id.padStart(3)}] ${lead.business_name.padEnd(38)} | ${email.padEnd(36)} | MX: ${topMx}`);
    } else {
      mxFailCount++;
      console.log(`❌ [ID ${lead.id.padStart(3)}] ${lead.business_name.padEnd(38)} | ${email.padEnd(36)} | MX Failed: ${mxResult.error}`);
    }
  }

  console.log(`\n========================================================`);
  console.log(`VERIFICATION SUMMARY FOR ${targetFile}`);
  console.log(`Total Leads Checked:      ${lines.length - 1}`);
  console.log(`Syntax OK & MX Verified:  ${passedCount}`);
  console.log(`Syntax Failed:            ${syntaxFailCount}`);
  console.log(`Duplicates Detected:      ${duplicateCount}`);
  console.log(`MX Resolution Failed:     ${mxFailCount}`);
  console.log(`Clean Deliverability:     ${((passedCount / (lines.length - 1)) * 100).toFixed(1)}%`);
  console.log(`========================================================\n`);

  if (passedCount === lines.length - 1) {
    console.log("🎉 ALL LEADS PASSED ZERO-BOUNCE PRE-FLIGHT CHECKS! READY FOR DISPATCH.\n");
    process.exit(0);
  } else {
    console.error("⚠️ SOME LEADS FAILED CHECKS. PLEASE RESOLVE BEFORE SENDING.");
    process.exit(1);
  }
}

verify();
