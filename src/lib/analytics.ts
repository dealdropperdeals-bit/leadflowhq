type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "true") {
    return;
  }

  console.info("[analytics-placeholder]", eventName, payload);
}
