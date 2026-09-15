"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  UserCheck,
  Eye,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  RefreshCw,
  Search,
  Share2,
  Mail,
  Activity,
  Layers,
  MapPin,
  Laptop,
} from "lucide-react";
import type {
  AnalyticsDashboardData,
  AnalyticsRange,
} from "@/lib/analytics-storage";

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [activeGeoTab, setActiveGeoTab] = useState<"countries" | "cities">("countries");
  const [activeTrafficTab, setActiveTrafficTab] = useState<"channels" | "campaigns">("channels");

  const fetchData = async (selectedRange: AnalyticsRange) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${selectedRange}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(range);
  }, [range]);

  // Max value calculation for SVG timeline chart
  const { maxTimelineViews, maxTimelineVisitors } = useMemo(() => {
    if (!data?.timeline?.length) return { maxTimelineViews: 100, maxTimelineVisitors: 50 };
    const maxV = Math.max(...data.timeline.map((p) => p.pageViews));
    const maxVis = Math.max(...data.timeline.map((p) => p.visitors));
    return {
      maxTimelineViews: Math.ceil(maxV * 1.15) || 100,
      maxTimelineVisitors: Math.ceil(maxVis * 1.15) || 50,
    };
  }, [data]);

  const ranges: { label: string; value: AnalyticsRange }[] = [
    { label: "Today", value: "today" },
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
    { label: "All Time", value: "all" },
  ];

  if (!data && loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted" />
        <p className="mt-4 font-serif text-lg text-muted">Gathering storefront analytics...</p>
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="space-y-10 pb-16">
      {/* Header with Title & Date Range Controls */}
      <div className="flex flex-col gap-4 border-b border-espresso/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Performance & Intelligence</p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pistachio/30 bg-pistachio/10 px-2.5 py-0.5 text-[10px] font-medium text-pistachio">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pistachio" />
              Live Telemetry
            </span>
          </div>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">Storefront Analytics</h1>
          <p className="mt-2 max-w-xl text-xs text-muted">
            Holistic intelligence tracking visitors, acquisition channels, dwell times, and audience demographics for NOURA.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-md border border-espresso/10 bg-cream p-1">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`rounded px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-all ${
                  range === r.value
                    ? "bg-espresso text-ivory shadow-xs"
                    : "text-muted hover:text-espresso"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchData(range)}
            disabled={loading}
            className="flex items-center gap-1.5 border border-espresso/10 bg-cream px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:bg-sand/40 hover:text-espresso"
            title="Refresh metrics"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Real-time Ticker Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gold/30 bg-cream/60 px-5 py-3.5 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
          </span>
          <p className="text-xs">
            <span className="font-semibold tabular-nums text-espresso">{summary?.activeUsers ?? 1} active visitors</span>{" "}
            browsing the catalog in the last 15 minutes
          </p>
        </div>
        <p className="text-[11px] text-muted">
          Last synchronized at <span className="font-mono">{data?.lastUpdated}</span>
        </p>
      </div>

      {/* ── 1. CORE KPI SUMMARY METRICS (4 CARDS) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Visitors */}
        <div className="relative overflow-hidden rounded-lg border border-espresso/10 bg-cream/40 p-6 transition-all hover:bg-cream/70 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Total Visitors / Users</p>
            <Users className="h-4 w-4 text-gold" strokeWidth={1.5} />
          </div>
          <p className="mt-3 font-serif text-3xl tabular-nums text-espresso">
            {summary?.totalVisitors.toLocaleString() ?? "0"}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted">
            <span className="inline-flex items-center gap-1 text-[11px] text-pistachio font-medium">
              <TrendingUp className="h-3 w-3" />
              {summary?.visitorGrowth}
            </span>
            <span className="text-[11px] tabular-nums">{summary?.totalSessions.toLocaleString()} sessions</span>
          </div>
        </div>

        {/* Card 2: New vs Returning */}
        <div className="relative overflow-hidden rounded-lg border border-espresso/10 bg-cream/40 p-6 transition-all hover:bg-cream/70 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted">New vs Returning</p>
            <UserCheck className="h-4 w-4 text-gold" strokeWidth={1.5} />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="font-serif text-3xl tabular-nums text-espresso">
              {summary?.newPercentage}% <span className="font-sans text-xs text-muted">New</span>
            </p>
            <p className="text-xs tabular-nums text-muted">
              {summary?.returningPercentage}% <span className="text-[10px] uppercase">Returning</span>
            </p>
          </div>
          {/* Progress bar visual */}
          <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-sand/60">
            <div
              className="h-full bg-espresso transition-all duration-500"
              style={{ width: `${summary?.newPercentage}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted">
            <span>{summary?.newUsers.toLocaleString()} first-time</span>
            <span>{summary?.returningUsers.toLocaleString()} loyal</span>
          </div>
        </div>

        {/* Card 3: Page / Screen Views */}
        <div className="relative overflow-hidden rounded-lg border border-espresso/10 bg-cream/40 p-6 transition-all hover:bg-cream/70 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Page & Screen Views</p>
            <Eye className="h-4 w-4 text-gold" strokeWidth={1.5} />
          </div>
          <p className="mt-3 font-serif text-3xl tabular-nums text-espresso">
            {summary?.totalPageViews.toLocaleString() ?? "0"}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted">
            <span className="inline-flex items-center gap-1 text-[11px] text-pistachio font-medium">
              <TrendingUp className="h-3 w-3" />
              {summary?.viewsGrowth}
            </span>
            <span className="text-[11px] tabular-nums">{summary?.viewsPerSession} views / session</span>
          </div>
        </div>

        {/* Card 4: User Engagement */}
        <div className="relative overflow-hidden rounded-lg border border-espresso/10 bg-cream/40 p-6 transition-all hover:bg-cream/70 hover:shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted">User Engagement</p>
            <Clock className="h-4 w-4 text-gold" strokeWidth={1.5} />
          </div>
          <p className="mt-3 font-serif text-3xl tabular-nums text-espresso">
            {summary?.avgSessionDurationFormatted}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted">
            <span className="text-[11px] text-pistachio font-medium">{summary?.engagementRate}% Engaged</span>
            <span className="text-[11px]">{summary?.bounceRate}% Bounce</span>
          </div>
        </div>
      </div>

      {/* ── 2. TIMELINE CHART: VISITORS & PAGE VIEWS OVER TIME ── */}
      <div className="rounded-lg border border-espresso/10 bg-cream/30 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-2xl">Audience & Views Timeline</h2>
            <p className="text-xs text-muted">
              Trend of unique visitors vs overall page views across the selected timeframe
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-espresso" />
              <span>Page Views</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-champagne" />
              <span>Unique Visitors</span>
            </div>
          </div>
        </div>

        {/* SVG Interactive Timeline */}
        <div className="relative mt-8 h-64 w-full">
          {data?.timeline && data.timeline.length > 0 && (
            <svg
              className="h-full w-full overflow-visible"
              viewBox={`0 0 ${data.timeline.length * 40} 200`}
              preserveAspectRatio="none"
            >
              {/* Horizontal Grid lines */}
              {[0, 50, 100, 150].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2={data.timeline.length * 40}
                  y2={y}
                  stroke="currentColor"
                  className="text-espresso/5"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Area fill for Views */}
              <path
                d={
                  data.timeline.reduce((acc, p, i) => {
                    const x = i * 40 + 20;
                    const y = 190 - (p.pageViews / maxTimelineViews) * 170;
                    return `${acc} ${i === 0 ? "M" : "L"} ${x} ${y}`;
                  }, "") +
                  ` L ${(data.timeline.length - 1) * 40 + 20} 190 L 20 190 Z`
                }
                fill="currentColor"
                className="text-espresso/5"
              />

              {/* Views Line */}
              <path
                d={data.timeline.reduce((acc, p, i) => {
                  const x = i * 40 + 20;
                  const y = 190 - (p.pageViews / maxTimelineViews) * 170;
                  return `${acc} ${i === 0 ? "M" : "L"} ${x} ${y}`;
                }, "")}
                fill="none"
                stroke="#14110e"
                strokeWidth="2"
              />

              {/* Visitors Line */}
              <path
                d={data.timeline.reduce((acc, p, i) => {
                  const x = i * 40 + 20;
                  const y = 190 - (p.visitors / maxTimelineVisitors) * 170;
                  return `${acc} ${i === 0 ? "M" : "L"} ${x} ${y}`;
                }, "")}
                fill="none"
                stroke="#b89b6a"
                strokeWidth="2"
                strokeDasharray="2 2"
              />

              {/* Interactive Hover Points */}
              {data.timeline.map((point, i) => {
                const x = i * 40 + 20;
                const yViews = 190 - (point.pageViews / maxTimelineViews) * 170;
                const isHovered = hoveredPoint === i;

                return (
                  <g key={point.date} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                    {/* Hover vertical guide line */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1="0"
                        x2={x}
                        y2="190"
                        stroke="#14110e"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        opacity="0.3"
                      />
                    )}
                    <circle
                      cx={x}
                      cy={yViews}
                      r={isHovered ? 5 : 3}
                      fill="#14110e"
                      className="cursor-pointer transition-all"
                    />
                  </g>
                );
              })}
            </svg>
          )}

          {/* Hover Tooltip Overlay */}
          {hoveredPoint !== null && data?.timeline[hoveredPoint] && (
            <div
              className="pointer-events-none absolute -top-4 rounded border border-espresso/20 bg-ivory p-3 shadow-lg transition-all"
              style={{
                left: `clamp(10%, ${(hoveredPoint / (data.timeline.length - 1)) * 100}%, 85%)`,
                transform: "translateX(-50%)",
              }}
            >
              <p className="text-[11px] font-semibold text-espresso">
                {data.timeline[hoveredPoint].date}
              </p>
              <div className="mt-1 space-y-0.5 text-xs">
                <p className="text-espresso">
                  Page Views: <span className="font-semibold tabular-nums">{data.timeline[hoveredPoint].pageViews}</span>
                </p>
                <p className="text-gold">
                  Visitors: <span className="font-semibold tabular-nums">{data.timeline[hoveredPoint].visitors}</span>
                </p>
                <p className="text-muted text-[10px]">
                  Avg Engagement: {data.timeline[hoveredPoint].avgEngagementSec}s
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Date labels along bottom */}
        <div className="mt-4 flex justify-between border-t border-espresso/10 pt-2 text-[10px] uppercase tracking-wider text-muted">
          <span>{data?.timeline[0]?.date}</span>
          <span>{data?.timeline[Math.floor((data?.timeline.length ?? 1) / 2)]?.date}</span>
          <span>{data?.timeline[(data?.timeline.length ?? 1) - 1]?.date}</span>
        </div>
      </div>

      {/* ── 3. TOP PAGES / SCREEN VIEWS TABLE ── */}
      <div className="rounded-lg border border-espresso/10 bg-cream/30 p-6">
        <div className="flex items-center justify-between border-b border-espresso/10 pb-4">
          <div>
            <h2 className="font-serif text-2xl">Page & Screen Views</h2>
            <p className="text-xs text-muted">Most frequently explored destinations and artisanal collections</p>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
            {data?.topPages.length ?? 0} Tracked Routes
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-espresso/10 text-[10px] uppercase tracking-[0.2em] text-muted">
                <th className="py-3 font-medium">Page Title & Path</th>
                <th className="py-3 text-right font-medium">Page Views</th>
                <th className="py-3 text-right font-medium">Unique Visitors</th>
                <th className="py-3 text-right font-medium">Avg. Dwell Time</th>
                <th className="py-3 text-right font-medium">Bounce Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso/5">
              {data?.topPages.map((page) => (
                <tr key={page.path} className="group transition-colors hover:bg-cream/60">
                  <td className="py-3.5 pr-4">
                    <p className="font-medium text-espresso group-hover:text-gold transition-colors">
                      {page.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted">{page.path}</p>
                  </td>
                  <td className="py-3.5 text-right font-serif text-sm tabular-nums text-espresso">
                    {page.views.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-right tabular-nums text-muted">
                    {page.uniqueVisitors.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-right font-mono tabular-nums text-espresso">
                    {page.avgDwellTime}
                  </td>
                  <td className="py-3.5 text-right tabular-nums text-muted">
                    {page.bounceRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. TRAFFIC SOURCES & CAMPAIGNS ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Traffic Channels */}
        <div className="rounded-lg border border-espresso/10 bg-cream/30 p-6">
          <div className="flex items-center justify-between border-b border-espresso/10 pb-4">
            <div>
              <h2 className="font-serif text-2xl">Traffic Acquisition Sources</h2>
              <p className="text-xs text-muted">Inbound visitor origins and discovery channels</p>
            </div>
            <div className="flex rounded border border-espresso/10 bg-cream p-0.5 text-[10px]">
              <button
                onClick={() => setActiveTrafficTab("channels")}
                className={`px-2 py-1 uppercase tracking-wider ${
                  activeTrafficTab === "channels" ? "bg-espresso text-ivory rounded-xs" : "text-muted"
                }`}
              >
                Channels
              </button>
              <button
                onClick={() => setActiveTrafficTab("campaigns")}
                className={`px-2 py-1 uppercase tracking-wider ${
                  activeTrafficTab === "campaigns" ? "bg-espresso text-ivory rounded-xs" : "text-muted"
                }`}
              >
                UTMs
              </button>
            </div>
          </div>

          {activeTrafficTab === "channels" ? (
            <div className="mt-5 space-y-4">
              {data?.trafficSources.channels.map((ch) => (
                <div key={ch.channel} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-espresso flex items-center gap-1.5">
                      {ch.channel.includes("Search") && <Search className="h-3 w-3 text-muted" />}
                      {ch.channel.includes("Social") && <Share2 className="h-3 w-3 text-muted" />}
                      {ch.channel.includes("Email") && <Mail className="h-3 w-3 text-muted" />}
                      {ch.channel.includes("Direct") && <CompassIcon className="h-3 w-3 text-muted" />}
                      {ch.channel}
                    </span>
                    <span className="tabular-nums text-muted">
                      {ch.visitors.toLocaleString()} ({ch.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-sand/50">
                    <div
                      className="h-full bg-espresso transition-all duration-500"
                      style={{ width: `${ch.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-espresso/10 text-[10px] uppercase tracking-wider text-muted">
                    <th className="py-2">Campaign</th>
                    <th className="py-2">Source / Medium</th>
                    <th className="py-2 text-right">Visitors</th>
                    <th className="py-2 text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-espresso/5 font-mono text-[11px]">
                  {data?.trafficSources.campaigns.map((camp) => (
                    <tr key={camp.campaign} className="hover:bg-cream/40">
                      <td className="py-2.5 font-sans font-medium text-espresso">{camp.campaign}</td>
                      <td className="py-2.5 text-muted">{camp.source} / {camp.medium}</td>
                      <td className="py-2.5 text-right font-sans tabular-nums text-espresso">
                        {camp.visitors.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-sans tabular-nums text-muted">
                        {camp.views.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Engagement Breakdown */}
        <div className="rounded-lg border border-espresso/10 bg-cream/30 p-6">
          <div className="border-b border-espresso/10 pb-4">
            <h2 className="font-serif text-2xl">Engagement & Scroll Depth</h2>
            <p className="text-xs text-muted">Visitor reading depth and dwell duration by device</p>
          </div>

          <div className="mt-5 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-3">
                Scroll Depth Reached (Fold Milestones)
              </p>
              <div className="space-y-3">
                {data?.userEngagement.scrollDistribution.map((item) => (
                  <div key={item.depth} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-espresso font-medium">{item.depth}</span>
                      <span className="tabular-nums font-semibold text-espresso">{item.percentage}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-sand/50">
                      <div
                        className="h-full bg-gold transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-espresso/10 pt-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-3">
                Average Engagement by Device
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {data?.userEngagement.engagementByDevice.map((dev) => (
                  <div key={dev.device} className="rounded border border-espresso/10 bg-cream p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted">{dev.device}</p>
                    <p className="mt-1 font-serif text-lg tabular-nums text-espresso">{dev.duration}</p>
                    <p className="mt-0.5 text-[10px] text-pistachio font-medium">
                      {dev.engagementRate}% engaged
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. GEOGRAPHY (COUNTRIES & CITIES) & DEVICE/BROWSER ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Geography (Countries / Cities) */}
        <div className="rounded-lg border border-espresso/10 bg-cream/30 p-6">
          <div className="flex items-center justify-between border-b border-espresso/10 pb-4">
            <div>
              <h2 className="font-serif text-2xl">Geographic Reach</h2>
              <p className="text-xs text-muted">Audience footprint across international and domestic territories</p>
            </div>
            <div className="flex rounded border border-espresso/10 bg-cream p-0.5 text-[10px]">
              <button
                onClick={() => setActiveGeoTab("countries")}
                className={`px-2.5 py-1 uppercase tracking-wider ${
                  activeGeoTab === "countries" ? "bg-espresso text-ivory rounded-xs" : "text-muted"
                }`}
              >
                Countries
              </button>
              <button
                onClick={() => setActiveGeoTab("cities")}
                className={`px-2.5 py-1 uppercase tracking-wider ${
                  activeGeoTab === "cities" ? "bg-espresso text-ivory rounded-xs" : "text-muted"
                }`}
              >
                Top Cities
              </button>
            </div>
          </div>

          {activeGeoTab === "countries" ? (
            <div className="mt-5 space-y-3.5">
              {data?.countries.map((c) => (
                <div key={c.country} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-espresso">
                      <span className="text-base">{c.flag}</span>
                      {c.country}
                    </span>
                    <span className="tabular-nums text-muted">
                      {c.visitors.toLocaleString()} ({c.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-sand/50">
                    <div
                      className="h-full bg-espresso transition-all duration-500"
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-espresso/10 text-[10px] uppercase tracking-wider text-muted">
                    <th className="py-2">City</th>
                    <th className="py-2">Country</th>
                    <th className="py-2 text-right">Visitors</th>
                    <th className="py-2 text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-espresso/5">
                  {data?.cities.map((city) => (
                    <tr key={city.city} className="hover:bg-cream/40">
                      <td className="py-2.5 font-medium text-espresso flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-gold" />
                        {city.city}
                      </td>
                      <td className="py-2.5 text-muted">{city.country}</td>
                      <td className="py-2.5 text-right tabular-nums text-espresso">
                        {city.visitors.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-muted">{city.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Device & Browser Information */}
        <div className="rounded-lg border border-espresso/10 bg-cream/30 p-6">
          <div className="border-b border-espresso/10 pb-4">
            <h2 className="font-serif text-2xl">Device & Browser Information</h2>
            <p className="text-xs text-muted">Hardware category, browser engine, and operating platform</p>
          </div>

          <div className="mt-5 space-y-6">
            {/* Device Categories bar */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-2">Device Categories</p>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-sand/50">
                {data?.deviceInfo.categories.map((cat, i) => (
                  <div
                    key={cat.category}
                    className={`h-full transition-all duration-500 ${
                      i === 0 ? "bg-espresso" : i === 1 ? "bg-gold" : "bg-pistachio"
                    }`}
                    style={{ width: `${cat.percentage}%` }}
                    title={`${cat.category}: ${cat.percentage}%`}
                  />
                ))}
              </div>

              <div className="mt-3 flex justify-between gap-2 text-xs">
                {data?.deviceInfo.categories.map((cat, i) => (
                  <div key={cat.category} className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-xs ${
                        i === 0 ? "bg-espresso" : i === 1 ? "bg-gold" : "bg-pistachio"
                      }`}
                    />
                    <div className="flex items-center gap-1">
                      {cat.category === "Mobile" && <Smartphone className="h-3 w-3 text-muted" />}
                      {cat.category === "Desktop" && <Monitor className="h-3 w-3 text-muted" />}
                      {cat.category === "Tablet" && <Tablet className="h-3 w-3 text-muted" />}
                      <span className="font-medium text-espresso">{cat.category}</span>
                    </div>
                    <span className="tabular-nums text-muted">({cat.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Browsers & OS side-by-side */}
            <div className="grid grid-cols-2 gap-4 border-t border-espresso/10 pt-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-2.5">Browsers</p>
                <div className="space-y-2">
                  {data?.deviceInfo.browsers.map((b) => (
                    <div key={b.name} className="flex items-center justify-between text-xs">
                      <span className="text-espresso">{b.name}</span>
                      <span className="tabular-nums text-muted font-medium">{b.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted mb-2.5">Operating Systems</p>
                <div className="space-y-2">
                  {data?.deviceInfo.operatingSystems.map((os) => (
                    <div key={os.name} className="flex items-center justify-between text-xs">
                      <span className="text-espresso">{os.name}</span>
                      <span className="tabular-nums text-muted font-medium">{os.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fallback compass icon
function CompassIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
