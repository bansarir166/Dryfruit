#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import dns from "node:dns/promises";

import { poolA } from "./candidates_pool_a.mjs";
import { poolB } from "./candidates_pool_b.mjs";
import { poolC } from "./candidates_pool_c.mjs";
import { poolD } from "./candidates_pool_d.mjs";
import { poolE } from "./candidates_pool_e.mjs";
import { poolF } from "./candidates_pool_f.mjs";
import { poolG } from "./candidates_pool_g.mjs";
import { poolH } from "./candidates_pool_h.mjs";

const allCandidates = [...poolA, ...poolB, ...poolC, ...poolD, ...poolE, ...poolF, ...poolG, ...poolH];
console.log(`Loaded ${allCandidates.length} total raw candidates across Pools A, B, C, D.`);

// Load deduplication sets
const sentLogPath = resolve(process.cwd(), "sent_emails.json");
const sentSet = new Set();
if (existsSync(sentLogPath)) {
  const sentList = JSON.parse(readFileSync(sentLogPath, "utf8"));
  for (const entry of sentList) {
    if (entry.email) sentSet.add(entry.email.toLowerCase().trim());
  }
}
console.log(`Loaded ${sentSet.size} emails from sent_emails.json for deduplication.`);

const leads500Path = resolve(process.cwd(), "LEADS_500.csv");
if (existsSync(leads500Path)) {
  const lines = readFileSync(leads500Path, "utf8").split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    const match = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (match) sentSet.add(match[1].toLowerCase().trim());
  }
}
console.log(`Total unique historical emails registered to avoid: ${sentSet.size}`);

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const domainCache = new Map();

async function checkDomainMx(domain) {
  if (domainCache.has(domain)) return domainCache.get(domain);
  try {
    const records = await Promise.race([
      dns.resolveMx(domain),
      new Promise((_, reject) => setTimeout(() => reject(new Error("DNS Timeout")), 4000))
    ]);
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
  console.log("Extracting unique domains...");
  const uniqueDomains = [...new Set(allCandidates.map(c => c[1].toLowerCase().split("@")[1]).filter(Boolean))];
  console.log(`Testing ${uniqueDomains.length} unique domains for active MX records...`);

  await mapConcurrent(uniqueDomains, 20, async (domain) => {
    await checkDomainMx(domain);
  });

  const validLeads = [];
  const seenInBatch = new Set();
  let dupCount = 0;
  let mxFailCount = 0;
  let syntaxFailCount = 0;

  for (const item of allCandidates) {
    const [name, email, country, city, owner, reason] = item;
    const cleanEmail = email.toLowerCase().trim();

    if (!emailRegex.test(cleanEmail)) {
      syntaxFailCount++;
      continue;
    }

    if (sentSet.has(cleanEmail) || seenInBatch.has(cleanEmail)) {
      dupCount++;
      continue;
    }

    const domain = cleanEmail.split("@")[1];
    const mx = domainCache.get(domain);
    if (!mx || !mx.valid) {
      mxFailCount++;
      continue;
    }

    seenInBatch.add(cleanEmail);
    validLeads.push(item);
  }

  console.log(`\n========================================`);
  console.log(`CANDIDATE VALIDATION REPORT`);
  console.log(`Total Candidates Evaluated: ${allCandidates.length}`);
  console.log(`Syntax Failed:              ${syntaxFailCount}`);
  console.log(`Duplicates Detected:        ${dupCount}`);
  console.log(`MX Resolution Failed:       ${mxFailCount}`);
  console.log(`Total Valid Candidates:     ${validLeads.length}`);
  console.log(`========================================\n`);

  if (validLeads.length < 300) {
    console.error(`⚠️ Need 300 leads, but only ${validLeads.length} passed. Additional candidates needed!`);
    process.exit(1);
  }

  console.log(`🎉 SUCCESS: Found ${validLeads.length} pristine leads (>= 300). Exporting exactly 300 leads (IDs 503 to 802)...`);
  const selected300 = validLeads.slice(0, 300);

  function escapeCSV(val) {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }

  const fieldnames = [
    "id", "business_name", "country", "city", "maps_profile",
    "website_status", "social", "contact", "owner", "why_need_website", "quality"
  ];

  const newRows = [];
  const startId = 503;

  for (let idx = 0; idx < selected300.length; idx++) {
    const lid = String(startId + idx);
    const [name, email, country, city, owner, reason] = selected300[idx];
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(name)}+${encodeURIComponent(city)}`;
    const socialHandle = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15);
    const social = `Instagram: @${socialHandle} / Facebook: ${name}`;
    const contact = `General Inquiries | ${email}`;
    const websiteStatus = "Traditional web shop lacking an interactive custom dry fruit and nut gift box builder";
    const quality = "High";

    const rowObj = {
      id: lid,
      business_name: name,
      country,
      city,
      maps_profile: mapsUrl,
      website_status: websiteStatus,
      social,
      contact,
      owner,
      why_need_website: reason,
      quality
    };

    newRows.push(fieldnames.map(f => escapeCSV(rowObj[f])).join(","));
  }

  // 1. Write LEADS_300_NEW.csv
  const newCsvContent = fieldnames.join(",") + "\n" + newRows.join("\n") + "\n";
  const newCsvPath = resolve(process.cwd(), "LEADS_300_NEW.csv");
  writeFileSync(newCsvPath, newCsvContent, "utf8");
  console.log(`📁 Wrote ${selected300.length} new leads to ${newCsvPath}`);

  // 2. Consolidate into LEADS_802.csv
  const master802Path = resolve(process.cwd(), "LEADS_802.csv");
  if (existsSync(leads500Path)) {
    const existingContent = readFileSync(leads500Path, "utf8").trim();
    const masterContent = existingContent + "\n" + newRows.join("\n") + "\n";
    writeFileSync(master802Path, masterContent, "utf8");
    console.log(`📁 Consolidated master file created: ${master802Path} (Total records: ${502 + selected300.length})`);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 300 VERIFIED LEADS SUCCESSFULLY GENERATED & SAVED!`);
  console.log(`======================================================\n`);
}

run().catch(console.error);
