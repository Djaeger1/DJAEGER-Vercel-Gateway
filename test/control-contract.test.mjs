import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("durable desired state is read-only shadow", async () => {
  const desired = JSON.parse(await readFile(new URL("../control/desired.json", import.meta.url), "utf8"));
  assert.equal(desired.schema, 1);
  assert.equal(desired.mode, "SHADOW");
  assert.equal(desired.command, "OBSERVE");
  assert.equal(desired.allow_device_writes, false);
  assert.equal(desired.target, "DJAEGER_WORK_SELF_HOSTED");
});
