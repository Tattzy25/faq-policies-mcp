export interface Env {
  ANALYTICS_ENGINE: AnalyticsEngineDataset;
}

export function trackEvent(
  env: Env,
  request: Request,
  toolName: string,
  searchQuery: string,
  outcome: string
) {
  const url = new URL(request.url);
  const country = request.headers.get("cf-ipcountry") || "XX";
  const domain = url.hostname;
  const sessionId = crypto.randomUUID();

  env.ANALYTICS_ENGINE.writeDataPoint({
    blobs: [toolName, searchQuery, country, outcome, domain],
    doubles: [1],
    indexes: [sessionId]
  });
}
