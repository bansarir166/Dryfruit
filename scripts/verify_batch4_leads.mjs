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
  const domainCache = new Map();

  console.log("Pre-resolving unique domains concurrently...");
  const uniqueDomains = [...new Set(leads.map(l => (l.contact || "").split("|").pop().trim().toLowerCase().split("@")[1]).filter(Boolean))];
  console.log(`Checking ${uniqueDomains.length} unique domains for MX records...`);

  const concurrency = 30;
  for (let i = 0; i < uniqueDomains.length; i += concurrency) {
    const batch = uniqueDomains.slice(i, i + concurrency);
    await Promise.all(batch.map(async (domain) => {
      try {
        const records = await Promise.race([
          dns.resolveMx(domain),
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 2500))
        ]);
        const valid = Array.isArray(records) && records.some(r => r.exchange && r.exchange !== "." && !r.exchange.endsWith(".invalid"));
        domainCache.set(domain, valid);
      } catch (err) {
        domainCache.set(domain, false);
      }
    }));
  }
  console.log("Domain resolution complete. Validating rows...\n");

  let syntaxFailed = 0;
  let dupsDetected = 0;
  let mxFailed = 0;
  let verifiedCount = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const contactParts = (lead.contact || "").split("|");
    const email = contactParts.pop().trim().toLowerCase();

    // 1. Syntax check
    if (!emailRegex.test(email)) {
      console.error(`❌ [Row ${i + 2}] Invalid email syntax: ${email} (${lead.business_name})`);
      syntaxFailed++;
      continue;
    }

    // 2. Deduplication check
    if (sentSet.has(email)) {
      console.error(`❌ [Row ${i + 2}] Collision with sent_emails.json: ${email} (${lead.business_name})`);
      dupsDetected++;
      continue;
    }
    if (seenInBatch.has(email)) {
      console.error(`❌ [Row ${i + 2}] Internal batch duplicate: ${email} (${lead.business_name})`);
      dupsDetected++;
      continue;
    }
    seenInBatch.add(email);

    // 3. DNS MX check
    const domain = email.split("@")[1];
    const mxValid = domainCache.get(domain);

    if (!mxValid) {
      console.error(`❌ [Row ${i + 2}] DNS MX resolution failed for domain: ${domain} (${email})`);
      mxFailed++;
      continue;
    }

    verifiedCount++;
  }

  const passRate = ((verifiedCount / leads.length) * 100).toFixed(1);

  console.log(`\n========================================================`);
  console.log(`VERIFICATION SUMMARY FOR ${filename}`);
  console.log(`Total Leads Checked:      ${leads.length}`);
  console.log(`Syntax OK & MX Verified:  ${verifiedCount}`);
  console.log(`Syntax Failed:            ${syntaxFailed}`);
  console.log(`Duplicates Detected:      ${dupsDetected}`);
  console.log(`MX Resolution Failed:     ${mxFailed}`);
  console.log(`Clean Deliverability:     ${passRate}%`);
  console.log(`========================================================\n`);

  if (verifiedCount === leads.length && syntaxFailed === 0 && dupsDetected === 0 && mxFailed === 0) {
    console.log(`🎉 ALL ${leads.length} LEADS PASSED ZERO-BOUNCE PRE-FLIGHT CHECKS WITH 100.0% SUCCESS!`);
  } else {
    console.error(`⚠️ Deliverability issues found! Pass rate: ${passRate}%`);
    process.exit(1);
  }
}

const targetFile = process.argv[2] || "LEADS_300_BATCH4.csv";
verifyLeads(targetFile).catch(console.error);
