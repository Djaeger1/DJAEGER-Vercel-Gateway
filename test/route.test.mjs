import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/route.js";

function responseRecorder() {
  const out = { statusCode: null, body: null, headers: {} };
  return {
    out,
    api: {
      setHeader(k, v) { out.headers[k] = v; },
      status(code) {
        out.statusCode = code;
        return {
          json(body) { out.body = body; return body; }
        };
      }
    }
  };
}

test("Railway online keeps HERMES_RAILWAY active", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: true, status: 200 });
  try {
    const { out, api } = responseRecorder();
    await handler({ method: "GET" }, api);
    assert.equal(out.statusCode, 200);
    assert.equal(out.body.route, "HERMES_RAILWAY");
    assert.equal(out.body.commands_allowed, false);
    assert.equal(out.body.self_hosted.state, "PREPARED_DISABLED");
    assert.equal(out.body.self_hosted.device_writes_allowed, false);
  } finally {
    global.fetch = originalFetch;
  }
});

test("Railway offline falls back safely without device commands", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => { throw new Error("offline"); };
  try {
    const { out, api } = responseRecorder();
    await handler({ method: "GET" }, api);
    assert.equal(out.statusCode, 200);
    assert.equal(out.body.route, "VERCEL_SAFE_FALLBACK");
    assert.equal(out.body.commands_allowed, false);
    assert.equal(out.body.active_failover_policy, "RAILWAY_OR_SAFE_ONLY");
    assert.equal(out.body.self_hosted.state, "PREPARED_DISABLED");
  } finally {
    global.fetch = originalFetch;
  }
});

test("non-GET methods are rejected", async () => {
  const { out, api } = responseRecorder();
  await handler({ method: "POST" }, api);
  assert.equal(out.statusCode, 405);
  assert.equal(out.body.error, "METHOD_NOT_ALLOWED");
});
