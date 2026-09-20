export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    ok: true,
    service: "DJAEGER-Vercel-Gateway",
    mode: "SHADOW",
    version: "0.1.0",
    runtime: "vercel",
    timestamp: new Date().toISOString()
  });
}
