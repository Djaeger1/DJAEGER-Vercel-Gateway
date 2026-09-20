const AI_READY = "https://djaeger-ai-core-production-736f.up.railway.app/ready";
const WORK_READY = "https://hermes-work-chatgpt-relay-v3-production.up.railway.app/health";

async function isOnline(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  const started = Date.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "DJAEGER-Vercel-Gateway/0.1.2" }
    });

    return {
      online: response.ok,
      http: response.status,
      latency_ms: Date.now() - started
    };
  } catch (error) {
    return {
      online: false,
      http: null,
      latency_ms: Date.now() - started,
      error: error?.name === "AbortError" ? "TIMEOUT" : "FETCH_FAILED"
    };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  const [ai, work] = await Promise.all([
    isOnline(process.env.DJAEGER_AI_HEALTH_URL || AI_READY),
    isOnline(process.env.DJAEGER_WORK_HEALTH_URL || WORK_READY)
  ]);

  const route = ai.online ? "HERMES_RAILWAY" : "VERCEL_SAFE_FALLBACK";

  return res.status(200).json({
    ok: true,
    service: "DJAEGER-Vercel-Gateway",
    mode: "SHADOW",
    version: "0.1.2",
    route,
    commands_allowed: false,
    ai,
    work,
    note: route === "VERCEL_SAFE_FALLBACK"
      ? "Control-plane fallback only; no device commands are issued."
      : "Railway remains the active AI backend.",
    timestamp: new Date().toISOString()
  });
}
