import { strict as assert } from "node:assert";
import { test } from "node:test";
import { hedge, type AttemptFn, type HedgeOutcome } from "./hedge.ts";

type V = { value: string };
const retryable = (s: number | null | undefined) => s === 429 || (typeof s === "number" && s >= 500);

/** An attempt that settles after `ms` with `outcome`, or rejects-to-abort when its signal fires. */
function fake(ms: number, outcome: HedgeOutcome<V>, log: string[], name: string): AttemptFn<V> {
  return (budget, signal) =>
    new Promise((resolve) => {
      log.push(`${name}:start:${budget}`);
      const t = setTimeout(() => resolve(outcome), ms);
      signal.addEventListener("abort", () => {
        clearTimeout(t);
        log.push(`${name}:aborted`);
        resolve({ ok: false, reason: "timeout", status: 503 });
      });
    });
}
const ok = (value: string): HedgeOutcome<V> => ({ ok: true, value });
const fail = (upstream: number | null, reason = "error"): HedgeOutcome<V> => ({ ok: false, reason, status: 503, upstream });
const opts = { budgetMs: 400, hedgeMs: 150, minMs: 50, retryable };

test("hedge: a fast main answer wins, the fallback never starts", async () => {
  const log: string[] = [];
  const r = await hedge(fake(20, ok("main"), log, "p"), fake(10, ok("lite"), log, "f"), opts);
  assert.equal(r.ok && r.value, "main");
  assert.equal(r.by, "primary");
  assert.ok(!log.some((l) => l.startsWith("f:start")));
});

test("hedge: a slow main model — the fallback starts at hedgeMs, wins, and the main one is aborted", async () => {
  const log: string[] = [];
  const r = await hedge(fake(350, ok("main"), log, "p"), fake(30, ok("lite"), log, "f"), opts);
  assert.equal(r.ok && r.value, "lite");
  assert.equal(r.by, "fallback");
  assert.ok(log.includes("p:aborted"));
  const start = log.find((l) => l.startsWith("f:start"))!;
  assert.ok(Number(start.split(":")[2]) <= 400 - 150 + 5, "the fallback only gets what is left of the budget");
});

test("hedge: the main model still wins when it lands before the fallback", async () => {
  const log: string[] = [];
  const r = await hedge(fake(200, ok("main"), log, "p"), fake(150, ok("lite"), log, "f"), opts);
  assert.equal(r.ok && r.value, "main");
  assert.ok(log.includes("f:aborted"));
});

test("hedge: an overloaded main model starts the fallback at once", async () => {
  const log: string[] = [];
  const t0 = Date.now();
  const r = await hedge(fake(10, fail(503), log, "p"), fake(20, ok("lite"), log, "f"), opts);
  assert.equal(r.ok && r.value, "lite");
  assert.ok(Date.now() - t0 < 140, "did not wait for the hedge delay");
});

test("hedge: a non-retryable failure is reported at once, no fallback", async () => {
  const log: string[] = [];
  const r = await hedge(fake(10, fail(400, "refusal"), log, "p"), fake(10, ok("lite"), log, "f"), opts);
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.reason, "refusal");
  assert.ok(!log.some((l) => l.startsWith("f:start")));
});

test("hedge: both fail — the main model's failure is reported", async () => {
  const log: string[] = [];
  const r = await hedge(fake(10, fail(503, "error"), log, "p"), fake(10, fail(503, "rate-limited"), log, "f"), opts);
  assert.equal(!r.ok && r.reason, "error");
  assert.equal(r.by, "primary");
});

test("hedge: no fallback when too little budget is left, nor when hedging is off", async () => {
  const log: string[] = [];
  const late = await hedge(fake(120, ok("main"), log, "p"), fake(5, ok("lite"), log, "f"), { ...opts, budgetMs: 200, hedgeMs: 100, minMs: 150 });
  assert.equal(late.ok && late.value, "main");
  const off = await hedge(fake(120, ok("main"), log, "p"), fake(5, ok("lite"), log, "f"), { ...opts, hedgeMs: null });
  assert.equal(off.ok && off.value, "main");
  assert.ok(!log.some((l) => l.startsWith("f:start")));
});

test("hedge: the caller's abort ends it at once and aborts the attempts", async () => {
  const log: string[] = [];
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 30);
  const r = await hedge(fake(300, ok("main"), log, "p"), null, { ...opts, signal: controller.signal });
  assert.equal(r.ok, false);
  assert.ok(log.includes("p:aborted"));
});
