export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  return res.status(200).json({
    ok: true,
    service: "DJAEGER-Vercel-Gateway",
    mode: "SHADOW",
    control_plane: "GITHUB_DURABLE_CONTROL",
    desired_state_url:
      "https://raw.githubusercontent.com/Djaeger1/DJAEGER-Vercel-Gateway/main/control/desired.json",
    worker_repo: "Djaeger1/DJAEGER-WORK",
    worker_branch: "vercel-fallback-shadow",
    worker_activation: "DISABLED",
    allowed_operation: "OBSERVE",
    device_writes_allowed: false,
    production_cutover: false,
    timestamp: new Date().toISOString()
  });
}
