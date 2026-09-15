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

const targetFile = process.argv[2] || "LEADS_BATCH_2.csv";
const csvPath = resolve(process.cwd(), targetFile);

if (!existsSync(csvPath)) {
  console.error(`File not found: ${csvPath}`);
  process.exit(1);
}

const content = readFileSync(csvPath, "utf-8");
const lines = content.split("\n").filter((l) => l.trim().length > 0);
const headers = parseCSVLine(lines[0]);

console.log(`\n========================================================`);
console.log(`VERIFYING LEADS IN: ${targetFile}`);
console.log(`Total Leads to Validate: ${lines.length - 1}`);
console.log(`========================================================\n`);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const domainCache = new Map();

async function checkDomainMx(domain) {
  if (domainCache.has(domain)) {
    return domainCache.get(domain);
  }
  try {
    const records = await dns.resolveMx(domain);
    const valid = Array.isArray(records) && records.length > 0;
    domainCache.set(domain, { valid, error: null, records });
    return { valid, error: null, records };
  } catch (err) {
    domainCache.set(domain, { valid: false, error: err.code || err.message });
    return { valid: false, error: err.code || err.message };
  }
}

async function verify() {
  let passedCount = 0;
  let syntaxFailCount = 0;
  let mxFailCount = 0;

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

    const domain = email.split("@")[1];
    const mxResult = await checkDomainMx(domain);

    if (mxResult.valid) {
      passedCount++;
      console.log(`✅ [ID ${lead.id}] ${lead.business_name.padEnd(35)} | ${email.padEnd(35)} | MX: OK (${domain})`);
    } else {
      mxFailCount++;
      console.log(`⚠️ [ID ${lead.id}] ${lead.business_name.padEnd(35)} | ${email.padEnd(35)} | MX Failed: ${mxResult.error}`);
    }
  }

  console.log(`\n========================================================`);
  console.log(`VERIFICATION SUMMARY FOR ${targetFile}`);
  console.log(`Total Checked:      ${lines.length - 1}`);
  console.log(`Syntax OK & MX OK:  ${passedCount}`);
  console.log(`Syntax Failed:      ${syntaxFailCount}`);
  console.log(`MX Failed:          ${mxFailCount}`);
  console.log(`Pass Rate:          ${((passedCount / (lines.length - 1)) * 100).toFixed(1)}%`);
  console.log(`========================================================\n`);
}

verify();
