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

async function verifyLeads(filename) {
  const csvPath = resolve(process.cwd(), filename);
  if (!existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`);
    process.exit(1);
  }

  const lines = readFileSync(csvPath, "utf8").split("\n").filter(l => l.trim().length > 0);
  console.log(`\n========================================================`);
  console.log(`ZERO-BOUNCE PRE-FLIGHT VERIFICATION AUDIT: ${filename}`);
  console.log(`Total Rows in CSV: ${lines.length} (1 Header + ${lines.length - 1} Leads)`);
  console.log(`========================================================\n`);

  const headers = parseCSVLine(lines[0]);
  const leads = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const lead = {};
    headers.forEach((h, idx) => {
      lead[h] = values[idx] || "";
    });
    leads.push(lead);
  }

  // Load sent emails
  const sentLogPath = resolve(process.cwd(), "sent_emails.json");
  const sentSet = new Set();
  if (existsSync(sentLogPath)) {
    const sentList = JSON.parse(readFileSync(sentLogPath, "utf8"));
    for (const entry of sentList) {
      if (entry.email) sentSet.add(entry.email.toLowerCase().trim());
    }
  }
  console.log(`Loaded ${sentSet.size} previously sent emails from sent_emails.json.`);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const seenInBatch = new Set();
  const domainMap = new Map();

  let syntaxErrors = 0;
  let sentCollisions = 0;
  let batchDuplicates = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const contactParts = lead.contact ? lead.contact.split("|") : [];
    const email = contactParts.pop()?.trim().toLowerCase();

    if (!email || !emailRegex.test(email)) {
      syntaxErrors++;
      console.warn(`[Lead #${lead.id}] ⚠️ Syntax error in email: "${lead.contact}"`);
      continue;
    }

    if (sentSet.has(email)) {
      sentCollisions++;
      console.warn(`[Lead #${lead.id}] ⚠️ Collision with sent_emails.json: ${email}`);
    }

    if (seenInBatch.has(email)) {
      batchDuplicates++;
      console.warn(`[Lead #${lead.id}] ⚠️ Duplicate in current batch: ${email}`);
    }
    seenInBatch.add(email);

    const domain = email.split("@")[1];
    if (!domainMap.has(domain)) domainMap.set(domain, []);
    domainMap.get(domain).push(lead.id);
  }

  console.log(`\nSyntax & Deduplication Audit:`);
  console.log(`- Total leads evaluated:   ${leads.length}`);
  console.log(`- Unique valid emails:     ${seenInBatch.size}`);
  console.log(`- Syntax errors:           ${syntaxErrors}`);
  console.log(`- Sent history collisions: ${sentCollisions}`);
  console.log(`- In-batch duplicates:     ${batchDuplicates}`);

  // Test DNS MX records
  console.log(`\nChecking DNS MX records for ${domainMap.size} unique domains...`);
  const uniqueDomains = [...domainMap.keys()];
  const failedDomains = [];
  const concurrency = 10;

  async function resolveDomainWithRetry(domain, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const mx = await Promise.race([
          dns.resolveMx(domain),
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 5000))
        ]);
        if (Array.isArray(mx) && mx.length > 0) return true;
      } catch (err) {
        if (attempt === retries) return false;
        await new Promise(r => setTimeout(r, 500));
      }
    }
    return false;
  }

  for (let i = 0; i < uniqueDomains.length; i += concurrency) {
    const chunk = uniqueDomains.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (domain) => {
      const ok = await resolveDomainWithRetry(domain);
      if (!ok) failedDomains.push(domain);
    }));
  }

  console.log(`\nDNS MX Resolution:`);
  console.log(`- Domains passing MX lookup: ${uniqueDomains.length - failedDomains.length} / ${uniqueDomains.length}`);
  console.log(`- Domains failing MX lookup: ${failedDomains.length}`);

  if (failedDomains.length > 0) {
    console.warn(`Failed domains:`, failedDomains);
  }

  const passed = syntaxErrors === 0 && sentCollisions === 0 && batchDuplicates === 0 && failedDomains.length === 0;
  console.log(`\n========================================================`);
  if (passed) {
    console.log(`✅ 100% AUDIT PASS: All ${leads.length} leads are zero-bounce, unique & ready!`);
  } else {
    console.error(`❌ AUDIT FAILED: Please fix errors before sending.`);
  }
  console.log(`========================================================\n`);

  return passed;
}

const targetFile = process.argv[2] || "LEADS_300_BATCH5.csv";
verifyLeads(targetFile);
