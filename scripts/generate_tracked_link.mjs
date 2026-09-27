#!/usr/bin/env node

/**
 * Utility to generate trackable links for cold outreach email campaigns.
 *
 * Usage:
 *   node scripts/generate_tracked_link.mjs <id> <email> <business_name> <owner> <city> <country>
 *
 * Example:
 *   node scripts/generate_tracked_link.mjs 502 "support@vosgeschocolate.com" "Vosges Haut-Chocolat" "Katrina Markoff" "Chicago, IL" "USA"
 */

const BASE_URL = process.env.SITE_URL || "https://dryfruit-web.vercel.app";

export function createTrackedLeadLink(lead, baseUrl = BASE_URL) {
  const contactParts = lead.contact ? lead.contact.split("|") : [];
  const email = lead.email || contactParts.pop()?.trim() || "";
  const name = lead.owner && lead.owner !== "N/A" ? lead.owner : (lead.business_name || "");

  const url = new URL("/api/lead/click", baseUrl);
  if (lead.id) url.searchParams.set("id", String(lead.id));
  if (email) url.searchParams.set("email", email);
  if (lead.business_name) url.searchParams.set("biz", lead.business_name);
  if (name) url.searchParams.set("name", name);
  if (lead.city) url.searchParams.set("city", lead.city);
  if (lead.country) url.searchParams.set("country", lead.country);

  return url.toString();
}

// CLI direct execution
if (process.argv[1]?.endsWith("generate_tracked_link.mjs")) {
  const [,, id, email, business_name, owner, city, country] = process.argv;

  if (!email) {
    console.log("Usage: node scripts/generate_tracked_link.mjs <id> <email> [business_name] [owner] [city] [country]");
    console.log("\nExample:");
    console.log(createTrackedLeadLink({
      id: "502",
      email: "support@vosgeschocolate.com",
      business_name: "Vosges Haut-Chocolat",
      owner: "Katrina Markoff",
      city: "Chicago, IL",
      country: "USA"
    }));
    process.exit(0);
  }

  const trackedLink = createTrackedLeadLink({
    id: id || "demo",
    email,
    business_name: business_name || "Gourmet Partner",
    owner: owner || "",
    city: city || "",
    country: country || ""
  });

  console.log("\nGenerated Tracked Link:");
  console.log(trackedLink);
}
