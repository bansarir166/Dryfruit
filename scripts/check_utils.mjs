import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import dns from "node:dns/promises";

const sentLogPath = resolve(process.cwd(), "sent_emails.json");
const sentSet = new Set();
if (existsSync(sentLogPath)) {
  const sentList = JSON.parse(readFileSync(sentLogPath, "utf8"));
  for (const entry of sentList) {
    if (entry.email) sentSet.add(entry.email.toLowerCase().trim());
  }
}

export async function checkDomainMx(domain) {
  try {
    const records = await dns.resolveMx(domain);
    const validRecords = Array.isArray(records)
      ? records.filter((r) => r.exchange && r.exchange !== "." && !r.exchange.endsWith(".invalid"))
      : [];
    const valid = validRecords.length > 0;
    return { valid, error: valid ? null : "No active MX exchange", records: validRecords };
  } catch (err) {
    return { valid: false, error: err.code || err.message, records: [] };
  }
}

export function isSent(email) {
  return sentSet.has(email.toLowerCase().trim());
}
