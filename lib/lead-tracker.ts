import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@/lib/supabase/server";

export interface ClickedLead {
  id: string;
  email: string;
  business_name: string;
  owner?: string;
  city?: string;
  country?: string;
  why_need_website?: string;
  first_clicked_at: string;
  last_clicked_at: string;
  click_count: number;
  last_ip?: string;
  last_user_agent?: string;
  status: "HOT_LEAD" | "CONTACTED" | "CONVERTED" | "ARCHIVED";
  followed_up_at?: string;
  notes?: string;
}

const DATA_DIR = resolve(process.cwd(), "data");
const LEADS_FILE_PATH = resolve(DATA_DIR, "clicked_leads.json");
const ADMIN_ALERT_EMAIL = process.env.ADMIN_ALERT_EMAIL || "bansarir166@gmail.com";
const BREVO_API_KEY = process.env.BREVO_API_KEY;

function ensureStorage(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(LEADS_FILE_PATH)) {
    writeFileSync(LEADS_FILE_PATH, JSON.stringify([], null, 2), "utf8");
  }
}

export async function getClickedLeads(): Promise<ClickedLead[]> {
  ensureStorage();
  try {
    const raw = readFileSync(LEADS_FILE_PATH, "utf8");
    const leads: ClickedLead[] = JSON.parse(raw);
    return leads.sort(
      (a, b) => new Date(b.last_clicked_at).getTime() - new Date(a.last_clicked_at).getTime()
    );
  } catch (error) {
    console.error("Error reading clicked_leads.json:", error);
    return [];
  }
}

export async function saveClickedLead(lead: ClickedLead): Promise<void> {
  ensureStorage();
  try {
    const leads = await getClickedLeads();
    const existingIndex = leads.findIndex(
      (l) =>
        (lead.id && l.id === lead.id) ||
        (lead.email && l.email.toLowerCase().trim() === lead.email.toLowerCase().trim())
    );

    if (existingIndex >= 0) {
      leads[existingIndex] = {
        ...leads[existingIndex],
        ...lead,
        click_count: (leads[existingIndex].click_count || 1) + 1,
        last_clicked_at: lead.last_clicked_at || new Date().toISOString(),
      };
    } else {
      leads.unshift(lead);
    }

    writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving clicked lead to local JSON:", error);
  }

  // Also attempt Supabase persistence if available
  try {
    const supabase = await createClient();
    await supabase.from("clicked_leads").upsert(
      {
        id: lead.id,
        email: lead.email,
        business_name: lead.business_name,
        owner: lead.owner || null,
        city: lead.city || null,
        country: lead.country || null,
        click_count: lead.click_count,
        last_clicked_at: lead.last_clicked_at,
        last_ip: lead.last_ip || null,
        status: lead.status,
      },
      { onConflict: "email" }
    );
  } catch {
    // Supabase table may not be migrated yet; local storage succeeds reliably
  }
}

/**
 * Sends a high-priority "Hot Lead" notification email via Brevo to the admin/team.
 */
export async function sendHotLeadAlertEmail(lead: ClickedLead): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.warn("BREVO_API_KEY not configured. Skipping alert email dispatch.");
    return false;
  }

  const subject = `🔥 Hot Lead Alert: ${lead.business_name || lead.email} clicked your demo link!`;

  const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:20px;background:#f9f8f6;font-family:sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
    <div style="background:#fef3c7;border-left:4px solid #d97706;padding:12px 16px;border-radius:4px;margin-bottom:24px;">
      <p style="margin:0;font-size:15px;font-weight:bold;color:#92400e;">
        🎯 An outreach prospect just clicked your link!
      </p>
    </div>

    <h2 style="margin:0 0 16px;font-size:22px;color:#451a03;">
      ${lead.business_name || "New Prospect"}
    </h2>

    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0;color:#78716c;font-weight:600;width:130px;">Email:</td>
        <td style="padding:8px 0;color:#1c1917;">
          <a href="mailto:${lead.email}" style="color:#78350f;font-weight:bold;text-decoration:none;">${lead.email}</a>
        </td>
      </tr>
      ${lead.owner ? `
      <tr>
        <td style="padding:8px 0;color:#78716c;font-weight:600;">Executive / Contact:</td>
        <td style="padding:8px 0;color:#1c1917;">${lead.owner}</td>
      </tr>` : ""}
      ${lead.city || lead.country ? `
      <tr>
        <td style="padding:8px 0;color:#78716c;font-weight:600;">Location:</td>
        <td style="padding:8px 0;color:#1c1917;">${[lead.city, lead.country].filter(Boolean).join(", ")}</td>
      </tr>` : ""}
      <tr>
        <td style="padding:8px 0;color:#78716c;font-weight:600;">Total Clicks:</td>
        <td style="padding:8px 0;color:#1c1917;font-weight:bold;">${lead.click_count}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#78716c;font-weight:600;">Clicked At:</td>
        <td style="padding:8px 0;color:#1c1917;">${new Date(lead.last_clicked_at).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })} (IST)</td>
      </tr>
      ${lead.last_ip ? `
      <tr>
        <td style="padding:8px 0;color:#78716c;font-weight:600;">IP Address:</td>
        <td style="padding:8px 0;color:#78716c;font-family:monospace;">${lead.last_ip}</td>
      </tr>` : ""}
    </table>

    <div style="text-align:center;margin-top:24px;">
      <a href="mailto:${lead.email}?subject=Re:%20Turnkey%20luxury%20dry-fruit%20storefront%20for%20${encodeURIComponent(lead.business_name || '')}"
         style="background:#78350f;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;display:inline-block;">
        Reply to Lead Directly →
      </a>
    </div>
  </div>
</body>
</html>`;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "NOURA Outreach Alert", email: "bansarir166@gmail.com" },
        to: [{ email: ADMIN_ALERT_EMAIL, name: "Bansari" }],
        subject,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Failed to send Brevo hot lead alert:", res.status, errText);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error sending hot lead alert via Brevo:", err);
    return false;
  }
}

/**
 * Highly personalized follow-up email sent to a lead prospect who clicked our link.
 */
export async function sendLeadFollowupEmail(lead: ClickedLead): Promise<boolean> {
  if (!BREVO_API_KEY || !lead.email) return false;

  const recipientName = lead.owner && lead.owner !== "N/A" ? lead.owner : (lead.business_name || "there");
  const subject = `Regarding ${lead.business_name}: Luxury e-commerce storefront & custom builder`;

  const locationStr = [lead.city, lead.country].filter(Boolean).join(", ");
  const customObservation = lead.why_need_website
    ? lead.why_need_website.trim()
    : `Elevating ${lead.business_name}'s digital presence with a direct-to-consumer luxury shopping experience.`;

  const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f9f8f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1c1917;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f6;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e7e5e4;border-radius:12px;padding:36px;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <tr>
            <td>
              <h2 style="font-family:Georgia,serif;color:#451a03;font-size:22px;margin:0 0 16px;">Dear ${recipientName},</h2>
              
              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                I noticed you recently took a look at our luxury storefront demo from my previous note.
              </p>

              <div style="background:#fef3c7;border-left:4px solid #d97706;padding:14px 16px;border-radius:4px;margin:20px 0;">
                <p style="margin:0;font-size:14px;color:#92400e;line-height:1.5;">
                  <strong>Note for ${lead.business_name}:</strong> ${customObservation}
                </p>
              </div>

              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                We built this solution specifically for premium gourmet retailers and confectioners:
              </p>

              <ul style="padding-left:20px;margin:0 0 24px;font-size:14px;line-height:1.8;color:#57534e;">
                <li><strong>Interactive Gift Box Builder:</strong> Allow corporate and retail buyers to curate custom assortments and gift boxes in real time.</li>
                <li><strong>Turnkey Luxury Design:</strong> Ready to launch in 24 hours with integrated Stripe checkout, mobile optimization, and inventory controls.</li>
                <li><strong>Custom Build Option:</strong> Fully bespoke development to match your exact brand guidelines and operational requirements.</li>
              </ul>

              <div style="text-align:center;margin:32px 0;">
                <a href="https://dryfruit-web.vercel.app/" target="_blank"
                   style="background:#78350f;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
                  👉 Explore Storefront & Gift Box Builder
                </a>
              </div>

              <p style="font-size:15px;line-height:1.6;color:#44403c;">
                Would you be open for a quick 5-minute call or a brief reply over email to explore options for <strong>${lead.business_name}</strong>?
              </p>

              <hr style="border:none;border-top:1px solid #f5f5f4;margin:28px 0 20px;" />
              <p style="font-size:14px;color:#1c1917;margin:0;line-height:1.5;">
                Warm regards,<br/>
                <strong>Bansari</strong><br/>
                <span style="color:#78716c;font-size:13px;">E-Commerce & Digital Storefront Specialist</span><br/>
                <a href="mailto:bansarir166@gmail.com" style="color:#78350f;font-size:13px;">bansarir166@gmail.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Bansari", email: "bansarir166@gmail.com" },
        to: [{ email: lead.email, name: recipientName }],
        subject,
        htmlContent,
      }),
    });

    if (res.ok) {
      lead.followed_up_at = new Date().toISOString();
      lead.status = "CONTACTED";
      await saveClickedLead(lead);
      return true;
    }
    const err = await res.text();
    console.error("Brevo follow-up dispatch failed:", res.status, err);
    return false;
  } catch (err) {
    console.error("Error sending automated follow-up to lead:", err);
    return false;
  }
}

/**
 * Main recording function invoked when a lead clicks a tracked link.
 */
export async function recordLeadClick(params: {
  id?: string;
  email: string;
  business_name?: string;
  owner?: string;
  city?: string;
  country?: string;
  ip?: string;
  userAgent?: string;
}): Promise<ClickedLead> {
  const existingList = await getClickedLeads();
  const existing = existingList.find(
    (l) =>
      (params.id && l.id === params.id) ||
      (params.email && l.email.toLowerCase().trim() === params.email.toLowerCase().trim())
  );

  const now = new Date().toISOString();
  const lead: ClickedLead = {
    id: params.id || existing?.id || `lead_${Date.now()}`,
    email: params.email.toLowerCase().trim(),
    business_name: params.business_name || existing?.business_name || "Gourmet Food Business",
    owner: params.owner || existing?.owner || "",
    city: params.city || existing?.city || "",
    country: params.country || existing?.country || "",
    first_clicked_at: existing?.first_clicked_at || now,
    last_clicked_at: now,
    click_count: (existing?.click_count || 0) + 1,
    last_ip: params.ip || existing?.last_ip,
    last_user_agent: params.userAgent || existing?.last_user_agent,
    status: existing?.status || "HOT_LEAD",
    followed_up_at: existing?.followed_up_at,
  };

  await saveClickedLead(lead);

  // Send hot lead alert to Bansari
  await sendHotLeadAlertEmail(lead);

  // If AUTO_FOLLOWUP_ON_CLICK is enabled, send automated follow-up
  const autoFollowup = process.env.AUTO_FOLLOWUP_ON_CLICK !== "false";
  if (autoFollowup && !lead.followed_up_at) {
    await sendLeadFollowupEmail(lead);
  }

  return lead;
}

/**
 * Manually or programmatically send a follow-up email to a specific lead.
 */
export async function sendFollowupToLead(leadIdOrEmail: string): Promise<{ success: boolean; message: string; lead?: ClickedLead }> {
  const leads = await getClickedLeads();
  const cleanKey = leadIdOrEmail.toLowerCase().trim();
  const lead = leads.find((l) => l.id === leadIdOrEmail || l.email.toLowerCase().trim() === cleanKey);

  if (!lead) {
    return { success: false, message: `Lead '${leadIdOrEmail}' not found in records.` };
  }

  const ok = await sendLeadFollowupEmail(lead);
  if (ok) {
    return { success: true, message: `Follow-up email successfully sent to ${lead.email}!`, lead };
  } else {
    return { success: false, message: `Failed to dispatch follow-up email via Brevo.` };
  }
}

/**
 * Dispatch follow-up emails to all clicked leads who have not yet received one.
 */
export async function sendFollowupToAllPending(): Promise<{ total: number; sent: number; failed: number; leads: ClickedLead[] }> {
  const leads = await getClickedLeads();
  const pending = leads.filter((l) => !l.followed_up_at);

  let sent = 0;
  let failed = 0;
  const processed: ClickedLead[] = [];

  for (const lead of pending) {
    const ok = await sendLeadFollowupEmail(lead);
    if (ok) {
      sent++;
      processed.push(lead);
    } else {
      failed++;
    }
  }

  return { total: pending.length, sent, failed, leads: processed };
}
