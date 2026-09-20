const TARGETS = [
  {
    name: "djaeger_ai",
    envKey: "DJAEGER_AI_HEALTH_URL",
    fallbackUrl: "https://djaeger-ai-core-production-736f.up.railway.app/ready"
  },
  {
    name: "djaeger_work",
    envKey: "DJAEGER_WORK_HEALTH_URL",
    fallbackUrl: "https://hermes-work-chatgpt-relay-v3-production.up.railway.app/health"
  }
];

async function probe({ name, envKey, fallbackUrl }) {
  const url = process.env[envKey] || fallbackUrl;

  if (!url) {
    return { name, configured: false, state: "NOT_CONFIGURED" };
  }

  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "DJAEGER-Vercel-Gateway/0.1.2" }
    });

    return {
      name,
      configured: true,
      state: response.ok ? "ONLINE" : "DEGRADED",
      http: response.status,
      latency_ms: Date.now() - started
    };
  } catch (error) {
    return {
      name,
      configured: true,
      state: "OFFLINE",
      latency_ms: Date.now() - started,
      error: error?.name === "AbortError" ? "TIMEOUT" : "FETCH_FAILED"
    };
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  const targets = await Promise.all(TARGETS.map(probe));
  const configured = targets.filter((target) => target.configured);
  const healthy = configured.length > 0 && configured.every((target) => target.state === "ONLINE");

  return res.status(healthy ? 200 : 207).json({
    ok: healthy,
    service: "DJAEGER-Vercel-Gateway",
    mode: "SHADOW",
    version: "0.1.2",
    timestamp: new Date().toISOString(),
    targets
  });
}
