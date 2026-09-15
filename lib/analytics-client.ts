// Client-side analytics utilities for NOURA

export interface AnalyticsPayload {
  visitor_id: string;
  session_id: string;
  is_returning: boolean;
  event_type: "page_view" | "engagement" | "heartbeat";
  page_path: string;
  page_title: string;
  referrer: string;
  traffic_source: string;
  traffic_medium: string;
  traffic_campaign?: string;
  device_category: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  screen_resolution: string;
  engagement_time_sec?: number;
  scroll_depth_percent?: number;
  timestamp?: string;
}

const VISITOR_COOKIE_KEY = "noura_vid";
const SESSION_STORAGE_KEY = "noura_sid";
const FIRST_SEEN_KEY = "noura_first_seen";
const LAST_SEEN_KEY = "noura_last_seen";

/**
 * Generates a unique UUIDv4-like identifier
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create persistent visitor ID across visits
 */
export function getOrCreateVisitorId(): { visitorId: string; isReturning: boolean } {
  if (typeof window === "undefined") {
    return { visitorId: "", isReturning: false };
  }

  let vid = localStorage.getItem(VISITOR_COOKIE_KEY);
  let isReturning = false;

  const firstSeen = localStorage.getItem(FIRST_SEEN_KEY);
  const now = Date.now();

  if (vid && firstSeen) {
    // If first visit was more than 30 mins ago, count as returning
    if (now - parseInt(firstSeen, 10) > 30 * 60 * 1000) {
      isReturning = true;
    }
    localStorage.setItem(LAST_SEEN_KEY, now.toString());
  } else {
    vid = generateUUID();
    localStorage.setItem(VISITOR_COOKIE_KEY, vid);
    localStorage.setItem(FIRST_SEEN_KEY, now.toString());
    localStorage.setItem(LAST_SEEN_KEY, now.toString());
  }

  // Also sync cookie for server awareness
  document.cookie = `${VISITOR_COOKIE_KEY}=${vid}; path=/; max-age=31536000; SameSite=Lax`;

  return { visitorId: vid, isReturning };
}

/**
 * Get or create session ID (expires on tab close or session idle)
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  let sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!sid) {
    sid = generateUUID();
    sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
  }
  return sid;
}

/**
 * Detect device category from User Agent and screen size
 */
export function detectDeviceCategory(): "desktop" | "mobile" | "tablet" {
  if (typeof window === "undefined") return "desktop";

  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    ) ||
    width <= 768
  ) {
    return "mobile";
  }
  return "desktop";
}

/**
 * Detect browser name from User Agent
 */
export function detectBrowser(): string {
  if (typeof window === "undefined") return "Unknown";

  const ua = navigator.userAgent;

  if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg/") > -1) return "Edge";
  if (ua.indexOf("Chrome") > -1 && ua.indexOf("Chromium") === -1 && ua.indexOf("Edg") === -1)
    return "Chrome";
  if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) return "Safari";
  if (ua.indexOf("Firefox") > -1) return "Firefox";
  if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) return "Opera";
  if (ua.indexOf("SamsungBrowser") > -1) return "Samsung Internet";

  return "Other";
}

/**
 * Detect Operating System from User Agent
 */
export function detectOS(): string {
  if (typeof window === "undefined") return "Unknown";

  const ua = navigator.userAgent;

  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Linux/i.test(ua)) return "Linux";

  return "Other";
}

/**
 * Detect traffic source and medium from URL and document.referrer
 */
export function detectTrafficSource(): {
  source: string;
  medium: string;
  campaign?: string;
} {
  if (typeof window === "undefined") {
    return { source: "direct", medium: "none" };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source");
  const utmMedium = urlParams.get("utm_medium");
  const utmCampaign = urlParams.get("utm_campaign") || undefined;

  // 1. If UTM params exist, prioritize them
  if (utmSource) {
    return {
      source: utmSource.toLowerCase(),
      medium: utmMedium ? utmMedium.toLowerCase() : "campaign",
      campaign: utmCampaign,
    };
  }

  const referrer = document.referrer;
  if (!referrer) {
    return { source: "direct", medium: "none" };
  }

  try {
    const refUrl = new URL(referrer);
    const refHost = refUrl.hostname.toLowerCase();
    const currentHost = window.location.hostname.toLowerCase();

    // Internal navigation
    if (refHost === currentHost || refHost.endsWith(`.${currentHost}`)) {
      return { source: "internal", medium: "internal" };
    }

    // Search engines
    if (/google\./i.test(refHost)) return { source: "google", medium: "organic" };
    if (/bing\./i.test(refHost)) return { source: "bing", medium: "organic" };
    if (/yahoo\./i.test(refHost)) return { source: "yahoo", medium: "organic" };
    if (/duckduckgo\./i.test(refHost)) return { source: "duckduckgo", medium: "organic" };
    if (/ecosia\./i.test(refHost)) return { source: "ecosia", medium: "organic" };

    // Social media
    if (/instagram\./i.test(refHost)) return { source: "instagram", medium: "social" };
    if (/facebook\.|fb\.me/i.test(refHost)) return { source: "facebook", medium: "social" };
    if (/t\.co|twitter\.|x\.com/i.test(refHost)) return { source: "twitter", medium: "social" };
    if (/pinterest\./i.test(refHost)) return { source: "pinterest", medium: "social" };
    if (/linkedin\./i.test(refHost)) return { source: "linkedin", medium: "social" };
    if (/youtube\./i.test(refHost)) return { source: "youtube", medium: "social" };
    if (/reddit\./i.test(refHost)) return { source: "reddit", medium: "social" };

    // Email providers / webmails
    if (/mail\.google\.|outlook\.|mail\.yahoo\./i.test(refHost)) {
      return { source: "email", medium: "email" };
    }

    // Generic referral
    return { source: refHost, medium: "referral" };
  } catch {
    return { source: "unknown", medium: "referral" };
  }
}

/**
 * Sends an analytics event to our backend /api/analytics/track
 */
export function sendAnalyticsEvent(data: Partial<AnalyticsPayload>) {
  if (typeof window === "undefined") return;

  // Don't track admin pages to avoid polluting storefront stats
  if (window.location.pathname.startsWith("/admin")) {
    return;
  }

  const { visitorId, isReturning } = getOrCreateVisitorId();
  const sessionId = getOrCreateSessionId();
  const traffic = detectTrafficSource();

  const payload: AnalyticsPayload = {
    visitor_id: visitorId,
    session_id: sessionId,
    is_returning: isReturning,
    event_type: data.event_type || "page_view",
    page_path: data.page_path || window.location.pathname + window.location.search,
    page_title: data.page_title || document.title,
    referrer: data.referrer ?? (document.referrer || "direct"),
    traffic_source: data.traffic_source || traffic.source,
    traffic_medium: data.traffic_medium || traffic.medium,
    traffic_campaign: data.traffic_campaign || traffic.campaign,
    device_category: data.device_category || detectDeviceCategory(),
    browser: data.browser || detectBrowser(),
    os: data.os || detectOS(),
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    engagement_time_sec: data.engagement_time_sec,
    scroll_depth_percent: data.scroll_depth_percent,
    timestamp: new Date().toISOString(),
  };

  const body = JSON.stringify(payload);

  // Use sendBeacon if available for reliability on tab close/unload
  if (navigator.sendBeacon && data.event_type === "engagement") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/track", blob);
  } else {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Non-blocking catch
    });
  }
}
