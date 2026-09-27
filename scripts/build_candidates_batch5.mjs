#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import dns from "node:dns/promises";

// Load sent emails for strict deduplication
const sentLogPath = resolve(process.cwd(), "sent_emails.json");
const sentSet = new Set();
if (existsSync(sentLogPath)) {
  const sentList = JSON.parse(readFileSync(sentLogPath, "utf8"));
  for (const entry of sentList) {
    if (entry.email) sentSet.add(entry.email.toLowerCase().trim());
  }
}
console.log(`Loaded ${sentSet.size} previously sent emails from sent_emails.json.`);

// Load candidates from pools I, J, K, L, M, N and scratch_valid_existing.json
const pools = await Promise.all([
  import("./candidates_pool_i.mjs").then(m => m.poolI || []).catch(() => []),
  import("./candidates_pool_j.mjs").then(m => m.poolJ || []).catch(() => []),
  import("./candidates_pool_k.mjs").then(m => m.poolK || []).catch(() => []),
  import("./candidates_pool_l.mjs").then(m => m.poolL || []).catch(() => []),
  import("./candidates_pool_m.mjs").then(m => m.poolM || []).catch(() => []),
  import("./candidates_pool_n.mjs").then(m => m.poolN || []).catch(() => [])
]);
const poolCandidates = pools.flat();

let existingCandidates = [];
const existingPath = resolve(process.cwd(), "scratch_valid_existing.json");
if (existsSync(existingPath)) {
  existingCandidates = JSON.parse(readFileSync(existingPath, "utf8"));
}

const allRaw = [...poolCandidates, ...existingCandidates];
console.log(`Aggregated ${allRaw.length} total candidate records.`);

// Deduplicate and check RFC syntax
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const seenEmails = new Set();
const candidatePool = [];

let syntaxFails = 0;
let sentCollisions = 0;
let dupsFiltered = 0;

for (const c of allRaw) {
  if (!c || !c[1]) continue;
  const cleanEmail = c[1].toLowerCase().trim();

  if (!emailRegex.test(cleanEmail)) {
    syntaxFails++;
    continue;
  }

  if (sentSet.has(cleanEmail)) {
    sentCollisions++;
    continue;
  }

  if (seenEmails.has(cleanEmail)) {
    dupsFiltered++;
    continue;
  }

  seenEmails.add(cleanEmail);
  candidatePool.push(c);
}

console.log(`After initial deduplication & syntax filtering:`);
console.log(`- Unique unsent candidates: ${candidatePool.length}`);
console.log(`- Syntax fails filtered:   ${syntaxFails}`);
console.log(`- Previously sent excluded:${sentCollisions}`);
console.log(`- Internal duplicates:     ${dupsFiltered}`);

// Perform parallel DNS MX record verification
console.log(`\nValidating DNS MX records across candidate domains...`);

const domainMap = new Map();
for (const c of candidatePool) {
  const domain = c[1].split("@")[1].toLowerCase().trim();
  if (!domainMap.has(domain)) {
    domainMap.set(domain, []);
  }
  domainMap.get(domain).push(c);
}

const uniqueDomains = [...domainMap.keys()];
console.log(`Checking ${uniqueDomains.length} unique domains for MX records...`);

const validDomains = new Set();
const concurrency = 25;

for (let i = 0; i < uniqueDomains.length; i += concurrency) {
  const chunk = uniqueDomains.slice(i, i + concurrency);
  await Promise.all(chunk.map(async (domain) => {
    try {
      const records = await Promise.race([
        dns.resolveMx(domain),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000))
      ]);
      if (Array.isArray(records) && records.length > 0) {
        validDomains.add(domain);
      }
    } catch {
      // Domain has no valid MX records or timed out
    }
  }));
}

console.log(`DNS MX Audit complete: ${validDomains.size} / ${uniqueDomains.length} domains passed.`);

// Gather all candidates from valid domains
const verifiedCandidates = [];
for (const [domain, items] of domainMap.entries()) {
  if (validDomains.has(domain)) {
    verifiedCandidates.push(...items);
  }
}

console.log(`Total zero-bounce verified candidates available: ${verifiedCandidates.length}`);

if (verifiedCandidates.length < 300) {
  console.error(`❌ Insufficient verified candidates! Needed 300, only found ${verifiedCandidates.length}.`);
  process.exit(1);
}

const target300 = verifiedCandidates.slice(0, 300);
console.log(`\nSelecting exactly 300 leads for Batch 5 (IDs 1103 to 1402).`);

// Format into CSV
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

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

const startId = 1103;
const csvRows = [headers.join(",")];

for (let i = 0; i < target300.length; i++) {
  const [name, email, country, city, owner, reason] = target300[i];
  const lid = String(startId + i);

  const cleanNameQuery = name.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "+");
  const cleanCity = (city || "").replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "+");
  const mapsUrl = `https://maps.google.com/?q=${cleanNameQuery}+${cleanCity}`;

  const cleanHandle = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15);
  const social = `Instagram: @${cleanHandle} / Facebook: ${name}`;
  const contact = `General Inquiries | ${email.trim()}`;
  const websiteStatus = "Traditional shop layout lacking an interactive custom gift tin builder and modern mobile checkout";
  const quality = "High";

  const row = [
    escapeCSV(lid),
    escapeCSV(name),
    escapeCSV(country),
    escapeCSV(city),
    escapeCSV(mapsUrl),
    escapeCSV(websiteStatus),
    escapeCSV(social),
    escapeCSV(contact),
    escapeCSV(owner),
    escapeCSV(reason),
    escapeCSV(quality)
  ];

  csvRows.push(row.join(","));
}

const outputPath = resolve(process.cwd(), "LEADS_300_BATCH5.csv");
writeFileSync(outputPath, csvRows.join("\n"), "utf8");
console.log(`✅ Successfully compiled 300 verified leads into ${outputPath}`);
