#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { recordLeadClick, getClickedLeads } from "../lib/lead-tracker.ts";

async function runTest() {
  console.log("🧪 Testing Lead Click Tracking System...\n");

  const simulatedLead = {
    id: "test-502",
    email: "lead-test@vosgeschocolate.com",
    business_name: "Vosges Haut-Chocolat & Exotic Nuts",
    owner: "Katrina Markoff",
    city: "Chicago, IL",
    country: "USA",
    ip: "192.168.1.100",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
  };

  console.log("1️⃣ Recording simulated email link click...");
  const lead = await recordLeadClick(simulatedLead);
  console.log(`✅ Recorded Lead: ${lead.business_name} (${lead.email})`);
  console.log(`   Click count: ${lead.click_count}`);
  console.log(`   Status:      ${lead.status}`);
  console.log(`   Last click:  ${lead.last_clicked_at}\n`);

  console.log("2️⃣ Verifying persistence in data/clicked_leads.json...");
  const allLeads = await getClickedLeads();
  const found = allLeads.find(l => l.email === simulatedLead.email);

  if (found) {
    console.log(`✅ Found lead in local JSON storage: ${found.business_name}`);
    console.log(`🎉 Lead Click Tracking System Test Passed successfully!`);
  } else {
    console.error("❌ Lead not found in storage!");
  }
}

runTest().catch(err => {
  console.error("Test error:", err);
});
