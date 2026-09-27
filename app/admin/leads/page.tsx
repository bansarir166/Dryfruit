import Link from "next/link";
import { getClickedLeads } from "@/lib/lead-tracker";
import { Flame, Mail, ExternalLink, MousePointerClick, Users, Clock, Globe } from "lucide-react";
import { FollowupLeadButton, FollowupAllButton } from "@/components/admin/FollowupButtons";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await getClickedLeads();

  const totalClicks = leads.reduce((acc, l) => acc + (l.click_count || 1), 0);
  const uniqueLeads = leads.length;
  const uncontactedCount = leads.filter((l) => !l.followed_up_at).length;

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentClicks = leads.filter(
    (l) => new Date(l.last_clicked_at).getTime() > oneDayAgo
  ).length;

  const mostActive = leads.length > 0 ? leads.slice().sort((a, b) => b.click_count - a.click_count)[0] : null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Cold Outreach Pipeline</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">Hot Leads & Clicks</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Prospects who clicked your storefront demo link in cold outreach emails. These are warm, engaged prospects actively exploring your e-commerce solution.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <FollowupAllButton uncontactedCount={uncontactedCount} />
          <Link
            href="/admin"
            className="text-[11px] uppercase tracking-[0.2em] text-muted underline underline-offset-4 hover:text-espresso"
          >
            ← Back to Overview
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid gap-px bg-espresso/10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-ivory px-5 py-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Total Clicks</p>
            <MousePointerClick className="h-4 w-4 text-espresso/40" />
          </div>
          <p className="mt-3 font-serif text-3xl tabular-nums">{totalClicks}</p>
          <p className="mt-1 text-[11px] text-muted">Across all campaigns</p>
        </div>

        <div className="bg-ivory px-5 py-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Hot Prospects</p>
            <Users className="h-4 w-4 text-espresso/40" />
          </div>
          <p className="mt-3 font-serif text-3xl tabular-nums text-amber-900">{uniqueLeads}</p>
          <p className="mt-1 text-[11px] text-muted">Unique interested businesses</p>
        </div>

        <div className="bg-ivory px-5 py-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Active Today (24h)</p>
            <Clock className="h-4 w-4 text-espresso/40" />
          </div>
          <p className="mt-3 font-serif text-3xl tabular-nums text-emerald-800">{recentClicks}</p>
          <p className="mt-1 text-[11px] text-muted">Leads clicking in last 24h</p>
        </div>

        <div className="bg-ivory px-5 py-6">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Top Engaged</p>
            <Flame className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-3 truncate font-serif text-xl" title={mostActive?.business_name || "None"}>
            {mostActive ? mostActive.business_name : "None yet"}
          </p>
          <p className="mt-1 text-[11px] text-muted">
            {mostActive ? `${mostActive.click_count} clicks` : "No clicks recorded"}
          </p>
        </div>
      </div>

      {/* Leads Table */}
      <div className="mt-12">
        <div className="flex items-center justify-between border-b border-espresso/10 pb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-600" />
            <h2 className="font-serif text-2xl">Engaged Prospects List</h2>
          </div>
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
            {leads.length} recorded
          </span>
        </div>

        {leads.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-espresso/20 bg-cream/40 p-12 text-center">
            <MousePointerClick className="mx-auto h-8 w-8 text-espresso/30" />
            <h3 className="mt-3 font-serif text-xl">No email link clicks recorded yet</h3>
            <p className="mx-auto mt-2 max-w-md text-xs text-muted">
              Once you dispatch outreach emails with your tracked links, any business owner who clicks your demo link will instantly appear here with their contact details and trigger an alert!
            </p>
            <div className="mt-6 inline-block rounded bg-ivory p-4 text-left text-xs font-mono border border-espresso/10">
              <p className="font-sans font-semibold text-espresso mb-1">Example Tracked Link:</p>
              <code>
                https://dryfruit-web.vercel.app/api/lead/click?id=502&email=prospect@domain.com&biz=Vosges+Haut-Chocolat
              </code>
            </div>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-espresso/10 text-[10px] uppercase tracking-[0.2em] text-muted">
                  <th className="pb-3 pr-4 font-normal">Status</th>
                  <th className="pb-3 pr-4 font-normal">Business & Owner</th>
                  <th className="pb-3 pr-4 font-normal">Email & Location</th>
                  <th className="pb-3 pr-4 font-normal text-center">Clicks</th>
                  <th className="pb-3 pr-4 font-normal">Last Clicked</th>
                  <th className="pb-3 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/5">
                {leads.map((lead) => {
                  const clickDate = new Date(lead.last_clicked_at);
                  const formattedDate = clickDate.toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const formattedTime = clickDate.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={lead.id + lead.email} className="transition-colors hover:bg-cream/50">
                      <td className="py-4 pr-4 align-top">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-900 border border-amber-300">
                          <Flame className="h-3 w-3 text-amber-600" />
                          HOT LEAD
                        </span>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <p className="font-serif text-base font-semibold text-espresso">
                          {lead.business_name}
                        </p>
                        {lead.owner && (
                          <p className="mt-0.5 text-xs text-muted">
                            {lead.owner}
                          </p>
                        )}
                        {lead.why_need_website && (
                          <p className="mt-1.5 text-[11px] text-amber-900/90 italic line-clamp-2 max-w-md bg-amber-50/70 p-1.5 rounded border border-amber-200/50">
                            &ldquo;{lead.why_need_website}&rdquo;
                          </p>
                        )}
                        {lead.id && (
                          <span className="mt-1 inline-block text-[10px] font-mono text-muted/80">
                            ID: #{lead.id}
                          </span>
                        )}
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <a
                          href={`mailto:${lead.email}`}
                          className="font-medium text-amber-900 underline underline-offset-2 hover:text-espresso flex items-center gap-1.5"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {lead.email}
                        </a>
                        {(lead.city || lead.country) && (
                          <p className="mt-1 text-xs text-muted flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {[lead.city, lead.country].filter(Boolean).join(", ")}
                          </p>
                        )}
                        {lead.last_ip && (
                          <p className="mt-0.5 text-[10px] font-mono text-muted/70">
                            IP: {lead.last_ip}
                          </p>
                        )}
                      </td>

                      <td className="py-4 pr-4 text-center align-top">
                        <span className="inline-block rounded bg-cream px-2.5 py-1 font-serif text-base font-bold text-espresso border border-espresso/10">
                          {lead.click_count}
                        </span>
                      </td>

                      <td className="py-4 pr-4 align-top text-xs text-muted">
                        <p className="font-medium text-espresso">{formattedDate}</p>
                        <p className="mt-0.5 text-[11px] text-muted">{formattedTime}</p>
                      </td>

                      <td className="py-4 text-right align-top">
                        <FollowupLeadButton
                          email={lead.email}
                          id={lead.id}
                          followedUpAt={lead.followed_up_at}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
