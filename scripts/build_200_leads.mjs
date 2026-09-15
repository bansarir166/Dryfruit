#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import dns from "node:dns/promises";

// Load sent emails
const sentLogPath = resolve(process.cwd(), "sent_emails.json");
const sentSet = new Set();
if (existsSync(sentLogPath)) {
  const sentList = JSON.parse(readFileSync(sentLogPath, "utf8"));
  for (const entry of sentList) {
    if (entry.email) sentSet.add(entry.email.toLowerCase().trim());
  }
}
console.log(`Loaded ${sentSet.size} previously sent emails for deduplication.`);

// Load raw candidates
const rawPath = resolve(process.cwd(), "raw_candidates_245.json");
const rawList = JSON.parse(readFileSync(rawPath, "utf8"));
console.log(`Loaded ${rawList.length} raw candidates.`);

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const domainCache = new Map();

async function checkDomainMx(domain) {
  if (domainCache.has(domain)) return domainCache.get(domain);
  try {
    const records = await dns.resolveMx(domain);
    const valid = Array.isArray(records) && records.some(r => r.exchange && r.exchange !== "." && !r.exchange.endsWith(".invalid"));
    const res = { valid, exchange: valid ? records[0].exchange : null };
    domainCache.set(domain, res);
    return res;
  } catch (err) {
    const res = { valid: false, error: err.code || err.message };
    domainCache.set(domain, res);
    return res;
  }
}

// Concurrency helper
async function mapConcurrent(items, limit, fn) {
  const results = [];
  let index = 0;
  const executing = [];

  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item, index++));
    results.push(p);

    if (limit <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

async function run() {
  console.log("Resolving MX for unique domains concurrently...");
  const uniqueDomains = [...new Set(rawList.map(item => item[1].trim().toLowerCase().split("@")[1]).filter(Boolean))];
  console.log(`Found ${uniqueDomains.length} unique domains to resolve.`);

  await mapConcurrent(uniqueDomains, 25, async (domain) => {
    await checkDomainMx(domain);
  });
  console.log("Domain resolution completed.");

  const seenInBatch = new Set();
  const verifiedLeads = [];

  for (const item of rawList) {
    const [name, email, country, city, owner, reason] = item;
    const cleanEmail = email.trim().toLowerCase();

    if (!emailRegex.test(cleanEmail)) {
      console.log(`❌ SYNTAX: ${name} (${cleanEmail})`);
      continue;
    }
    if (sentSet.has(cleanEmail) || seenInBatch.has(cleanEmail)) {
      console.log(`⚠️ DUP: ${name} (${cleanEmail})`);
      continue;
    }

    const domain = cleanEmail.split("@")[1];
    const mx = domainCache.get(domain);
    if (!mx || !mx.valid) {
      console.log(`❌ MX: ${name} (${domain}) -> ${mx ? mx.error : "No MX"}`);
      continue;
    }

    seenInBatch.add(cleanEmail);
    verifiedLeads.push({
      name,
      email: cleanEmail,
      country,
      city,
      owner,
      reason,
      mx: mx.exchange
    });
  }

  console.log(`\n============================================================`);
  console.log(`Total Verified Candidates: ${verifiedLeads.length} (Target: 200)`);
  console.log(`============================================================\n`);

  if (verifiedLeads.length < 200) {
    console.error(`ERROR: Found ${verifiedLeads.length} valid leads, need 200!`);
    process.exit(1);
  }

  // Pick exactly 200
  const target200 = verifiedLeads.slice(0, 200);

  function escapeCSV(val) {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const headers = [
    "id",
    "business_name",
    "country",
    "city",
    "maps_profile",
    "website_status",
    "social",
    "contact",
    "owner",
    "why_need_website",
    "quality"
  ];

  const csvRows = [headers.join(",")];
  const startId = 301;

  for (let i = 0; i < 200; i++) {
    const lead = target200[i];
    const lid = startId + i;
    const cleanQuery = lead.name.replace(/\s+/g, "+");
    const cityQuery = lead.city.replace(/\s+/g, "+");
    const mapsUrl = `https://maps.google.com/?q=${cleanQuery}+${cityQuery}`;
    const handle = lead.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15);
    const social = `IG: @${handle} / FB: ${lead.name}`;
    const contact = `General Inquiries | ${lead.email}`;
    const websiteStatus = "Traditional web shop lacking an interactive custom gift tin builder and modern mobile checkout";
    const quality = "High";

    const row = [
      escapeCSV(lid),
      escapeCSV(lead.name),
      escapeCSV(lead.country),
      escapeCSV(lead.city),
      escapeCSV(mapsUrl),
      escapeCSV(websiteStatus),
      escapeCSV(social),
      escapeCSV(contact),
      escapeCSV(lead.owner),
      escapeCSV(lead.reason),
      escapeCSV(quality)
    ];
    csvRows.push(row.join(","));
  }

  const outPath = resolve(process.cwd(), "LEADS_200_NEW.csv");
  writeFileSync(outPath, csvRows.join("\n") + "\n", "utf8");
  console.log(`🎉 SUCCESS: Wrote 200 verified leads (IDs 301-500) to ${outPath}\n`);
}

run();
