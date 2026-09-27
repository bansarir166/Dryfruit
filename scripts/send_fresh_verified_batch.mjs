#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import dns from "node:dns/promises";

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const i = trimmed.indexOf("=");
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

const apiKey = process.env.BREVO_API_KEY;
if (!apiKey) {
  console.error("❌ Missing BREVO_API_KEY in environment or .env.local");
  process.exit(1);
}

const isLive = process.argv.includes("--live");
const isDryRun = process.argv.includes("--dry-run") || !isLive;

const sender = {
  name: "Bansari",
  email: "bansarir166@gmail.com"
};

const SENT_LOG_PATH = resolve(process.cwd(), "sent_emails.json");
const SENT_FOLLOWUPS_PATH = resolve(process.cwd(), "data", "sent_followups.json");
const PREV_MASTER_CSV = resolve(process.cwd(), "LEADS_1402.csv");
const NEW_MASTER_CSV = resolve(process.cwd(), "LEADS_1423.csv");

function loadSentRegistry() {
  const set = new Set();
  const list = [];
  if (existsSync(SENT_LOG_PATH)) {
    try {
      const records = JSON.parse(readFileSync(SENT_LOG_PATH, "utf8"));
      for (const r of records) {
        if (r.email) {
          const clean = r.email.toLowerCase().trim();
          set.add(clean);
          list.push(r);
        }
      }
    } catch (e) {
      console.error("Warning reading sent_emails.json:", e.message);
    }
  }
  if (existsSync(SENT_FOLLOWUPS_PATH)) {
    try {
      const followups = JSON.parse(readFileSync(SENT_FOLLOWUPS_PATH, "utf8"));
      for (const r of followups) {
        if (r.email) set.add(r.email.toLowerCase().trim());
      }
    } catch {}
  }
  return { set, list };
}

export const VERIFIED_LEADS = [
  {
    id: 1404,
    business_name: "Godiva Chocolatier Global",
    email: "letters@godiva.com",
    country: "USA",
    city: "New York, NY",
    owner: "Godiva Concierge",
    contact: "General Inquiries | letters@godiva.com",
    maps_profile: "https://maps.google.com/?q=Godiva+Chocolatier+New+York+NY",
    social: "Instagram: @godiva / Facebook: Godiva Chocolatier",
    why_need_website: "World-renowned luxury chocolatier crafting dark chocolate truffles, almond bark, and holiday hampers; needs interactive box customizer.",
    quality: "High"
  },
  {
    id: 1405,
    business_name: "Vosges Haut-Chocolat",
    email: "info@vosgeschocolate.com",
    country: "USA",
    city: "Chicago, IL",
    owner: "Katrina Markoff (Founder)",
    contact: "Customer Service | info@vosgeschocolate.com",
    maps_profile: "https://maps.google.com/?q=Vosges+Haut+Chocolat+Chicago+IL",
    social: "Instagram: @vosgeschocolate / Facebook: Vosges Haut-Chocolat",
    why_need_website: "Pioneering experimental chocolatier infusing exotic spices, tart cherries, and Sicilian pistachios; needs bespoke sensory shopping experience.",
    quality: "High"
  },
  {
    id: 1406,
    business_name: "Chocolove Artisan Chocolate",
    email: "info@chocolove.com",
    country: "USA",
    city: "Boulder, CO",
    owner: "Timothy Moley (Founder)",
    contact: "General Inquiries | info@chocolove.com",
    maps_profile: "https://maps.google.com/?q=Chocolove+Boulder+CO",
    social: "Instagram: @chocolove / Facebook: Chocolove",
    why_need_website: "European-style chocolate bars embedded with whole roasted almonds, hazelnuts, and dried cherries; needs customized subscription box builder.",
    quality: "High"
  },
  {
    id: 1407,
    business_name: "Alter Eco Organic Chocolate",
    email: "customercare@alterecofoods.com",
    country: "USA",
    city: "San Francisco, CA",
    owner: "Alter Eco Team",
    contact: "Customer Care | customercare@alterecofoods.com",
    maps_profile: "https://maps.google.com/?q=Alter+Eco+San+Francisco+CA",
    social: "Instagram: @alterecofoods / Facebook: Alter Eco Foods",
    why_need_website: "Regenerative agriculture pioneer crafting organic dark chocolate truffles filled with hazelnut butter and dried fruits; needs sustainability-focused storefront.",
    quality: "High"
  },
  {
    id: 1408,
    business_name: "Tony Chocolonely",
    email: "mailus@tonyschocolonely.com",
    country: "Netherlands",
    city: "Amsterdam",
    owner: "Joke van Criekinge (Director)",
    contact: "Customer Service | mailus@tonyschocolonely.com",
    maps_profile: "https://maps.google.com/?q=Tonys+Chocolonely+Amsterdam",
    social: "Instagram: @tonyschocolonely / Facebook: Tonys Chocolonely",
    why_need_website: "Fairtrade chocolate maker known for thick milk chocolate hazelnut and almond sea salt bars; needs dynamic digital flagship store.",
    quality: "High"
  },
  {
    id: 1409,
    business_name: "Valrhona Selection USA",
    email: "contact.usa@valrhona.com",
    country: "USA",
    city: "Brooklyn, NY",
    owner: "Valrhona Team",
    contact: "Inquiries | contact.usa@valrhona.com",
    maps_profile: "https://maps.google.com/?q=Valrhona+Selection+Brooklyn+NY",
    social: "Instagram: @valrhonausa / Facebook: Valrhona USA",
    why_need_website: "World-renowned French pastry and culinary chocolate used by top chefs; needs interactive trade and VIP retail portal.",
    quality: "High"
  },
  {
    id: 1410,
    business_name: "Bonnat Chocolatier France",
    email: "contact@bonnat-chocolatier.com",
    country: "France",
    city: "Voiron, Isère",
    owner: "Stéphane Bonnat (Master Chocolatier)",
    contact: "Contact | contact@bonnat-chocolatier.com",
    maps_profile: "https://maps.google.com/?q=Bonnat+Chocolatier+Voiron+France",
    social: "Instagram: @bonnatchocolatier / Facebook: Bonnat Chocolatier",
    why_need_website: "Historic French chocolatier crafting single-origin grand cru bars and roasted hazelnut praline ballotins; needs luxury online salon.",
    quality: "High"
  },
  {
    id: 1411,
    business_name: "Zaini Milano Artisan Chocolate",
    email: "info@zainimilano.it",
    country: "Italy",
    city: "Milan",
    owner: "Luigi Zaini (CEO)",
    contact: "General Inquiries | info@zainimilano.it",
    maps_profile: "https://maps.google.com/?q=Zaini+Milano+Milan+Italy",
    social: "Instagram: @zainimilano / Facebook: Zaini Milano",
    why_need_website: "Historic Milanese chocolatier pairing dark chocolate with roasted Mediterranean almonds; needs luxury boutique.",
    quality: "High"
  },
  {
    id: 1412,
    business_name: "Slitti Cioccolato e Caffè",
    email: "info@slitti.it",
    country: "Italy",
    city: "Monsummano Terme, Pistoia",
    owner: "Andrea Slitti (Master Chocolatier)",
    contact: "Contact | info@slitti.it",
    maps_profile: "https://maps.google.com/?q=Slitti+Cioccolato+Monsummano+Terme",
    social: "Instagram: @slitticioccolato / Facebook: Slitti Cioccolato",
    why_need_website: "World-acclaimed Italian chocolate master crafting hazelnut spreads and roasted nut dragees; needs luxury online salon.",
    quality: "High"
  },
  {
    id: 1413,
    business_name: "Budhani Bros Waferwala Pune",
    email: "info@budhanibros.com",
    country: "India",
    city: "Pune, Maharashtra",
    owner: "Budhani Family (Owners)",
    contact: "General Inquiries | info@budhanibros.com",
    maps_profile: "https://maps.google.com/?q=Budhani+Bros+Pune+Maharashtra",
    social: "Instagram: @budhanibros / Facebook: Budhani Bros Waferwala",
    why_need_website: "Famous Pune institution crafting crispy potato wafers and salted roasted cashew nuts; needs online direct ordering store.",
    quality: "High"
  },
  {
    id: 1414,
    business_name: "Enstrom Candies",
    email: "customerservice@enstrom.com",
    country: "USA",
    city: "Grand Junction, CO",
    owner: "Doug Simons Jr (President)",
    contact: "Customer Service | customerservice@enstrom.com",
    maps_profile: "https://maps.google.com/?q=Enstrom+Candies+Grand+Junction+CO",
    social: "Instagram: @enstromcandies / Facebook: Enstrom Candies",
    why_need_website: "Legendary Colorado confectioner handcrafting almond toffee and chocolate almond barks; needs customized corporate gifting portal.",
    quality: "High"
  },
  {
    id: 1415,
    business_name: "Daskalides Chocolatier",
    email: "info@daskalides.be",
    country: "Belgium",
    city: "Gent",
    owner: "Daskalides Team",
    contact: "Info | info@daskalides.be",
    maps_profile: "https://maps.google.com/?q=Daskalides+Chocolatier+Gent+Belgium",
    social: "Instagram: @daskalideschocolates / Facebook: Daskalides Chocolates",
    why_need_website: "Traditional Belgian master confectioner producing praline gift boxes and candied orange slices; needs digital luxury gifting suite.",
    quality: "High"
  },
  {
    id: 1416,
    business_name: "Galler Chocolatiers",
    email: "eshop@galler.com",
    country: "Belgium",
    city: "Vaux-sous-Chèvremont",
    owner: "Salvatore Iannello (CEO)",
    contact: "E-shop | eshop@galler.com",
    maps_profile: "https://maps.google.com/?q=Galler+Chocolatiers+Belgium",
    social: "Instagram: @gallerchocolatier / Facebook: Galler Chocolatier",
    why_need_website: "Independent Belgian chocolatier known for rich praline bars and filled chocolate ballotins; needs luxury online shop.",
    quality: "High"
  },
  {
    id: 1417,
    business_name: "Manoa Chocolate Hawaii",
    email: "contact@manoachocolate.com",
    country: "USA",
    city: "Kailua, HI",
    owner: "Dylan Butterbaugh (Founder)",
    contact: "Contact | contact@manoachocolate.com",
    maps_profile: "https://maps.google.com/?q=Manoa+Chocolate+Kailua+HI",
    social: "Instagram: @manoachocolate / Facebook: Manoa Chocolate",
    why_need_website: "Craft bean-to-bar chocolate maker in Oahu pairing Hawaiian sea salt, passion fruit, and roasted macadamia nuts; needs direct island gift store.",
    quality: "High"
  },
  {
    id: 1418,
    business_name: "Madre Chocolate",
    email: "info@madrechocolate.com",
    country: "USA",
    city: "Honolulu, HI",
    owner: "David Elliott (Founder)",
    contact: "Info | info@madrechocolate.com",
    maps_profile: "https://maps.google.com/?q=Madre+Chocolate+Honolulu+HI",
    social: "Instagram: @madrechocolate / Facebook: Madre Chocolate",
    why_need_website: "Direct-trade artisan bean-to-bar chocolatier infusing Hawaiian vanilla and roasted coffee beans; needs interactive chocolate club.",
    quality: "High"
  },
  {
    id: 1419,
    business_name: "Marcolini Haute Chocolaterie",
    email: "contact@pierremarcolini.com",
    country: "Belgium",
    city: "Brussels",
    owner: "Pierre Marcolini (Master Chocolatier)",
    contact: "Contact | contact@pierremarcolini.com",
    maps_profile: "https://maps.google.com/?q=Pierre+Marcolini+Brussels",
    social: "Instagram: @pierremarcolini / Facebook: Pierre Marcolini",
    why_need_website: "World champion pastry chef crafting haute chocolaterie, grand cru bars, and macarons; needs luxury global digital boutique.",
    quality: "High"
  },
  {
    id: 1420,
    business_name: "Venchi UK",
    email: "support.uk@venchi.com",
    country: "UK",
    city: "London",
    owner: "Venchi UK Team",
    contact: "Support | support.uk@venchi.com",
    maps_profile: "https://maps.google.com/?q=Venchi+London+UK",
    social: "Instagram: @venchi_uk / Facebook: Venchi UK",
    why_need_website: "Iconic Italian brand expanding in the UK with artisan gelato and hazelnut chocoviar; needs interactive corporate hamper builder.",
    quality: "High"
  },
  {
    id: 1421,
    business_name: "Montezuma Chocolate",
    email: "contact@montezumas.co.uk",
    country: "UK",
    city: "Chichester, West Sussex",
    owner: "Montezuma Team",
    contact: "Contact | contact@montezumas.co.uk",
    maps_profile: "https://maps.google.com/?q=Montezuma+Chocolate+Chichester",
    social: "Instagram: @montezumaschox / Facebook: Montezuma Chocolates",
    why_need_website: "British artisan chocolatier creating ethical organic truffles, dark chocolate almond bars, and salted peanut butter buttons; needs interactive subscription club.",
    quality: "High"
  },
  {
    id: 1422,
    business_name: "Prestat Fine Chocolates",
    email: "customerservice@prestat.co.uk",
    country: "UK",
    city: "London",
    owner: "Micaela Illy (Managing Director)",
    contact: "Customer Service | customerservice@prestat.co.uk",
    maps_profile: "https://maps.google.com/?q=Prestat+Chocolates+London",
    social: "Instagram: @prestatfinesttruffles / Facebook: Prestat Fine Chocolates",
    why_need_website: "One of London’s oldest chocolate shops holding Royal Warrants, famous for handmade truffles and pistachio marzipan; needs regal gift composer.",
    quality: "High"
  },
  {
    id: 1423,
    business_name: "Paul A Young Fine Chocolates",
    email: "info@paulayoung.co.uk",
    country: "UK",
    city: "London",
    owner: "Paul A. Young (Chocolatier)",
    contact: "Info | info@paulayoung.co.uk",
    maps_profile: "https://maps.google.com/?q=Paul+A+Young+Chocolates+London",
    social: "Instagram: @paul_a_young / Facebook: Paul A Young",
    why_need_website: "Award-winning British master chocolatier known for wild, innovative ganaches and roasted nut dragees; needs luxury online salon.",
    quality: "High"
  }
];

function escapeCSV(val) {
  if (!val) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function sendEmailToLead(lead) {
  const recipientEmail = lead.email.toLowerCase().trim();
  const recipientName = lead.owner && lead.owner !== "N/A" ? lead.owner : lead.business_name;

  const subject = `Partnership opportunity: Turnkey luxury dry-fruit website & custom web build for ${lead.business_name}`;

  const trackingParams = new URLSearchParams({
    id: String(lead.id),
    email: recipientEmail,
    biz: lead.business_name,
    name: recipientName,
    city: lead.city,
    country: lead.country,
  });
  const demoLink = `https://dryfruit-web.vercel.app/api/lead/click?${trackingParams.toString()}`;

  const text = `Dear ${recipientName},

I was researching top gourmet dry fruit, date & specialty nut businesses in ${lead.city}, ${lead.country} and came across ${lead.business_name}. Your collection of premium products and customer reputation caught my attention.

I noticed that ${lead.why_need_website.toLowerCase()}

We have developed a turnkey, ultra-luxurious e-commerce storefront specifically designed for dry fruit, date & gourmet nut retailers — plus custom website building options tailored specifically to your brand.

What is included:
- Cinematic Homepage: Custom luxury design tailored for gourmet food (Garamond & Outfit aesthetics)
- Interactive Custom Gift Box Builder: Allow customers to build their own date/nut gift boxes
- Full Commerce Stack: Integrated Stripe payments & cloud database backend
- Turnkey Admin Dashboard: Manage products, orders, inventory & discount coupons
- Custom Web Building Option: Fully customizable layout, branding, and features to fit your exact business goals

Preview the Live Demo Storefront:
${demoLink}

Whether you want to acquire this ready-made storefront to launch in 24 hours or need a custom web build tailored for your business, we can set it up seamlessly.

Would you be open for a quick 5-minute call or reply over email to discuss options?

Best regards,
Bansari`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f9f8f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1c1917;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;padding:40px;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td>
              <h2 style="margin:0 0 20px;font-size:22px;color:#451a03;font-family:Georgia,serif;">Dear ${recipientName},</h2>
              
              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                I was researching top gourmet dry fruit, date & specialty nut businesses in <strong>${lead.city}, ${lead.country}</strong> and came across <strong>${lead.business_name}</strong>. Your collection of premium products and customer reputation really caught my attention!
              </p>
              
              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                I noticed that ${lead.why_need_website.toLowerCase()}
              </p>

              <div style="background:#fffbeb;border-left:4px solid #d97706;padding:16px;margin:24px 0;border-radius:6px;">
                <p style="margin:0;font-size:15px;color:#92400e;font-weight:600;">
                  ✨ Turnkey Ready-to-Launch Storefront + Custom Website Building Option
                </p>
              </div>

              <h4 style="margin:20px 0 10px;font-size:16px;color:#1c1917;">What's ready in our solution:</h4>
              <ul style="padding-left:20px;margin:0 0 24px;font-size:14px;line-height:1.8;color:#57534e;">
                <li><strong>Cinematic Homepage:</strong> Custom luxury design tailored for gourmet food</li>
                <li><strong>Interactive Custom Gift Box Builder:</strong> Allow customers to build their own date/nut gift boxes</li>
                <li><strong>Full Commerce Stack:</strong> Integrated Stripe payments & cloud database backend</li>
                <li><strong>Turnkey Admin Dashboard:</strong> Manage products, orders, inventory & discount coupons</li>
                <li><strong>Custom Web Building Option:</strong> Fully customizable layout, branding, and features to fit your exact business goals</li>
              </ul>

              <div style="text-align:center;margin:32px 0;">
                <a href="${demoLink}" target="_blank" style="background:#78350f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
                  👉 Preview Live Storefront Demo
                </a>
              </div>

              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                Whether you want to acquire this complete ready-to-launch store or build a custom e-commerce experience from scratch, we can get your online sales up and running smoothly.
              </p>

              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                Would you be open for a quick 5-minute call or reply over email to explore options?
              </p>

              <hr style="border:none;border-top:1px solid #f5f5f4;margin:32px 0 24px;" />
              
              <p style="margin:0;font-size:15px;color:#1c1917;">
                Best regards,<br/>
                <strong>Bansari</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const payload = {
    sender,
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    textContent: text,
    htmlContent: html
  };

  if (isDryRun) {
    return { messageId: `dryrun-${Date.now()}-${lead.id}` };
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
      Accept: "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Brevo API Error (${res.status}): ${errText}`);
  }

  return await res.json();
}

async function main() {
  console.log(`\n======================================================`);
  console.log(`🚀 OUTREACH BATCH DISPATCHER (Mode: ${isLive ? "LIVE DISPATCH" : "DRY RUN"})`);
  console.log(`======================================================\n`);

  const registry = loadSentRegistry();
  console.log(`Loaded sent registry: ${registry.set.size} unique emails indexed.`);

  // 1. Pre-flight verification on all leads
  console.log(`\n🔍 Performing 100% pre-flight check across all ${VERIFIED_LEADS.length} candidates...`);
  for (const lead of VERIFIED_LEADS) {
    const clean = lead.email.toLowerCase().trim();
    if (registry.set.has(clean)) {
      console.error(`🚨 CRITICAL DUPLICATE DETECTED: ${clean} is already in sent registry! ABORTING.`);
      process.exit(1);
    }
    const domain = clean.split("@")[1];
    const mx = await dns.resolveMx(domain);
    if (!mx || mx.length === 0 || !mx[0].exchange) {
      console.error(`🚨 MX RESOLUTION FAILED for domain: ${domain}`);
      process.exit(1);
    }
  }
  console.log(`✅ All ${VERIFIED_LEADS.length} candidates passed anti-duplicate and MX verification.\n`);

  let sentCount = 0;
  const newlySent = [];

  for (const lead of VERIFIED_LEADS) {
    const clean = lead.email.toLowerCase().trim();
    // Safety check again
    if (registry.set.has(clean)) {
      console.error(`Duplicate prevented right before send: ${clean}`);
      continue;
    }

    console.log(`[#${lead.id}] Sending to: ${lead.business_name} <${clean}> (${lead.city}, ${lead.country})...`);

    try {
      const result = await sendEmailToLead(lead);
      console.log(`   ✅ SUCCESS! Message ID: ${result.messageId}`);

      const sentEntry = {
        id: String(lead.id),
        lead_id: lead.id,
        business_name: lead.business_name,
        email: clean,
        recipient_name: lead.owner,
        country: lead.country,
        city: lead.city,
        batch: "fresh_verified_batch_1404_1423",
        subject: `Partnership opportunity: Turnkey luxury dry-fruit website & custom web build for ${lead.business_name}`,
        messageId: result.messageId,
        sent_at: new Date().toISOString()
      };

      registry.set.add(clean);
      registry.list.push(sentEntry);
      newlySent.push(sentEntry);
      sentCount++;

      if (isLive) {
        // Save to sent_emails.json incrementally
        writeFileSync(SENT_LOG_PATH, JSON.stringify(registry.list, null, 2), "utf8");
        // Rate limit delay between sends
        await new Promise(r => setTimeout(r, 1200));
      }
    } catch (err) {
      console.error(`   ❌ Failed sending to ${clean}:`, err.message);
      if (isLive) {
        // Halt on live error to protect reputation
        console.error("Halting batch execution due to dispatch error.");
        break;
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 Batch Summary: ${sentCount} / ${VERIFIED_LEADS.length} leads dispatched`);
  console.log(`Mode: ${isLive ? "LIVE SENT" : "DRY RUN COMPLETED"}`);
  console.log(`Total sent_emails.json entries: ${registry.list.length}`);
  console.log(`======================================================\n`);

  if (isLive && sentCount > 0) {
    // Generate updated LEADS_1423.csv
    let csvContent = "";
    if (existsSync(PREV_MASTER_CSV)) {
      csvContent = readFileSync(PREV_MASTER_CSV, "utf8").trim() + "\n";
    } else {
      csvContent = "id,business_name,country,city,maps_profile,website_status,social,contact,owner,why_need_website,quality\n";
    }

    for (const lead of VERIFIED_LEADS.slice(0, sentCount)) {
      const row = [
        lead.id,
        escapeCSV(lead.business_name),
        escapeCSV(lead.country),
        escapeCSV(lead.city),
        escapeCSV(lead.maps_profile),
        escapeCSV("Traditional shop layout lacking an interactive custom gift tin builder and modern mobile checkout"),
        escapeCSV(lead.social),
        escapeCSV(lead.contact),
        escapeCSV(lead.owner),
        escapeCSV(lead.why_need_website),
        escapeCSV(lead.quality)
      ].join(",");
      csvContent += row + "\n";
    }

    writeFileSync(NEW_MASTER_CSV, csvContent, "utf8");
    console.log(`✅ Updated master leads written to: ${NEW_MASTER_CSV}`);
  }
}

main().catch(err => {
  console.error("Fatal error in batch execution:", err);
  process.exit(1);
});
