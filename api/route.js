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
      headers: { "User-Agent": "DJAEGER-Vercel-Gateway/0.2.1" }
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

  const selfHosted = {
    control_plane: "GITHUB_DURABLE_CONTROL",
    worker_branch: "main",
    release: "v2.5.15-github-shadow-readonly",
    state: "RELEASED_WAITING_DEVICE_CONVERGENCE",
    allowed_operation: "OBSERVE",
    device_writes_allowed: false
  };

  const route = ai.online ? "HERMES_RAILWAY" : "VERCEL_SAFE_FALLBACK";

  return res.status(200).json({
    ok: true,
    service: "DJAEGER-Vercel-Gateway",
    mode: "SHADOW",
    version: "0.2.1",
    route,
    fallback_order: [
      "HERMES_RAILWAY",
      "SELF_HOSTED_DJAEGER_WORK",
      "VERCEL_SAFE_FALLBACK"
    ],
    active_failover_policy: "RAILWAY_OR_SAFE_ONLY",
    commands_allowed: false,
    ai,
    work,
    self_hosted: selfHosted,
    note: ai.online
      ? "Railway remains active. Read-only self-hosted observer release is published and awaiting device convergence."
      : "Railway is unavailable; gateway stays read-only. Self-hosted command failover is not enabled.",
    timestamp: new Date().toISOString()
  });
}
