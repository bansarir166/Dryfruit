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

// Load Batch 3 emails
const batch3Path = resolve(process.cwd(), "LEADS_BATCH_3.csv");
if (existsSync(batch3Path)) {
  for (const line of readFileSync(batch3Path, "utf8").split("\n")) {
    if (!line.includes("@")) continue;
    const parts = line.split(",");
    const contact = parts[parts.length - 4];
    if (contact && contact.includes("|")) {
      const em = contact.split("|").pop().trim().toLowerCase();
      sentSet.add(em);
    }
  }
}

console.log(`Loaded ${sentSet.size} existing sent/batch3 emails.`);

async function checkDomainMx(domain) {
  try {
    const records = await dns.resolveMx(domain);
    const validRecords = Array.isArray(records)
      ? records.filter((r) => r.exchange && r.exchange !== "." && !r.exchange.endsWith(".invalid"))
      : [];
    return validRecords.length > 0;
  } catch (err) {
    return false;
  }
}

// Import or define candidates
export async function compileLeads(rawCandidates) {
  console.log(`Testing ${rawCandidates.length} candidate businesses...`);
  const valid = [];
  const seenLocal = new Set();

  for (const c of rawCandidates) {
    const email = c.contact.split("|").pop().trim().toLowerCase();
    if (sentSet.has(email) || seenLocal.has(email)) {
      continue;
    }
    const domain = email.split("@")[1];
    const hasMx = await checkDomainMx(domain);
    if (!hasMx) {
      continue;
    }
    seenLocal.add(email);
    valid.push(c);
    if (valid.length === 200) {
      console.log("Reached 200 perfectly verified leads!");
      break;
    }
  }

  console.log(`Total Verified Leads compiled: ${valid.length}`);
  return valid;
}
