"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getFirebaseAnalytics, logAnalyticsEvent } from "@/lib/firebase";
import {
  sendAnalyticsEvent,
  detectDeviceCategory,
  detectBrowser,
  detectOS,
  detectTrafficSource,
  getOrCreateVisitorId,
} from "@/lib/analytics-client";

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Engagement state refs
  const sessionStartTimeRef = useRef<number>(Date.now());
  const activeSecondsRef = useRef<number>(0);
  const lastActiveTimestampRef = useRef<number>(Date.now());
  const isVisibleRef = useRef<boolean>(true);
  const maxScrollDepthRef = useRef<number>(0);
  const currentPathRef = useRef<string>("");

  // Initialize Firebase Analytics on mount
  useEffect(() => {
    getFirebaseAnalytics();
  }, []);

  // Flush engagement metrics for current page
  const flushEngagement = () => {
    if (typeof window === "undefined" || !currentPathRef.current) return;
    if (currentPathRef.current.startsWith("/admin")) return;

    // Update active seconds before flushing
    if (isVisibleRef.current) {
      const now = Date.now();
      const elapsed = Math.round((now - lastActiveTimestampRef.current) / 1000);
      if (elapsed > 0 && elapsed < 600) {
        activeSecondsRef.current += elapsed;
      }
      lastActiveTimestampRef.current = now;
    }

    const engagementTime = Math.min(Math.round(activeSecondsRef.current), 3600);
    const scrollDepth = Math.round(maxScrollDepthRef.current);

    if (engagementTime > 1 || scrollDepth > 10) {
      sendAnalyticsEvent({
        event_type: "engagement",
        page_path: currentPathRef.current,
        engagement_time_sec: engagementTime,
        scroll_depth_percent: scrollDepth,
      });

      logAnalyticsEvent("user_engagement", {
        engagement_time_msec: engagementTime * 1000,
        page_path: currentPathRef.current,
        scroll_depth: scrollDepth,
      });
    }

    // Reset counters for next page or session
    activeSecondsRef.current = 0;
    lastActiveTimestampRef.current = Date.now();
    maxScrollDepthRef.current = 0;
  };

  // Scroll listener to track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        const percent = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
        if (percent > maxScrollDepthRef.current) {
          maxScrollDepthRef.current = percent;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Visibility change listener to pause/resume engagement timer and flush on hide
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        isVisibleRef.current = false;
        flushEngagement();
      } else {
        isVisibleRef.current = true;
        lastActiveTimestampRef.current = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      flushEngagement();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Track page views on route / query param changes
  useEffect(() => {
    if (!pathname) return;

    const fullUrl = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    // Flush previous page engagement before tracking new one
    if (currentPathRef.current && currentPathRef.current !== fullUrl) {
      flushEngagement();
    }

    currentPathRef.current = fullUrl;
    sessionStartTimeRef.current = Date.now();
    lastActiveTimestampRef.current = Date.now();
    activeSecondsRef.current = 0;
    maxScrollDepthRef.current = 0;

    // Skip tracking for admin console
    if (pathname.startsWith("/admin")) return;

    // Detect visitor & traffic context
    const { isReturning } = getOrCreateVisitorId();
    const traffic = detectTrafficSource();
    const device = detectDeviceCategory();
    const browser = detectBrowser();
    const os = detectOS();

    // 1. Send first-party analytics event to backend API
    sendAnalyticsEvent({
      event_type: "page_view",
      page_path: fullUrl,
      page_title: document.title,
      traffic_source: traffic.source,
      traffic_medium: traffic.medium,
      traffic_campaign: traffic.campaign,
      device_category: device,
      browser,
      os,
    });

    // 2. Forward to Firebase / GA4
    logAnalyticsEvent("page_view", {
      page_path: fullUrl,
      page_location: window.location.href,
      page_title: document.title,
      device_category: device,
      browser,
      os,
      traffic_source: traffic.source,
      traffic_medium: traffic.medium,
      is_returning: isReturning ? 1 : 0,
    });
  }, [pathname, searchParams]);

  return null;
}

export default function FirebaseAnalytics() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTracker />
    </Suspense>
  );
}
