/**
 * One answer from two models within one time budget. Pure orchestration
 * (the attempts are passed in), node-importable, unit-tested.
 *
 * The main model starts at once. The fallback starts — at most once — when
 * either happens first:
 * - the main model fails with an overload or a rate limit (429/5xx), or
 * - `hedgeMs` pass without an answer (the main model's slow tail: for
 *   gemini-3.7-flash ~1 call in 5 took over 6 s, a few over 12 s), as long
 *   as `minMs` of the budget remains for it.
 * The first valid answer wins and the other attempt is aborted. When both
 * fail, the main model's failure is reported (the fallback's, if the main
 * one never failed). Every attempt is bounded by the deadline.
 */

export type HedgeFailure = { ok: false; reason: string; status: number; upstream?: number | null };
export type HedgeOutcome<T> = ({ ok: true } & T) | HedgeFailure;
export type AttemptFn<T> = (ms: number, signal: AbortSignal) => Promise<HedgeOutcome<T>>;

export type HedgeOptions = {
  budgetMs: number;
  /** Start the fallback after this long without an answer; null: only on overload. */
  hedgeMs: number | null;
  /** Never start the fallback with less than this left. */
  minMs: number;
  /** Whether a main-model failure is worth a fallback (the upstream HTTP status). */
  retryable: (upstream: number | null | undefined) => boolean;
  signal?: AbortSignal;
  now?: () => number;
};

export function hedge<T>(primary: AttemptFn<T>, fallback: AttemptFn<T> | null, options: HedgeOptions): Promise<HedgeOutcome<T> & { by: "primary" | "fallback" }> {
  const now = options.now ?? Date.now;
  const deadline = now() + options.budgetMs;
  const controllers = { primary: new AbortController(), fallback: new AbortController() };
  const abortAll = () => {
    controllers.primary.abort();
    controllers.fallback.abort();
  };

  return new Promise((resolve) => {
    let done = false;
    let pending = 0;
    let fallbackStarted = false;
    let primaryFailure: HedgeFailure | null = null;
    let fallbackFailure: HedgeFailure | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = (outcome: HedgeOutcome<T> & { by: "primary" | "fallback" }) => {
      if (done) return;
      done = true;
      if (timer) clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
      abortAll();
      resolve(outcome);
    };
    const settleIfIdle = () => {
      if (pending > 0 || done) return;
      const failure = primaryFailure ?? fallbackFailure!;
      finish({ ...failure, by: primaryFailure ? "primary" : "fallback" });
    };
    const onAbort = () => finish({ ok: false, reason: "timeout", status: 503, by: "primary" });

    const run = (which: "primary" | "fallback", fn: AttemptFn<T>, ms: number) => {
      pending += 1;
      fn(ms, controllers[which].signal).then(
        (outcome) => {
          pending -= 1;
          if (done) return;
          if (outcome.ok) return finish({ ...outcome, by: which });
          if (which === "primary") {
            primaryFailure = outcome;
            if (options.retryable(outcome.upstream)) startFallback();
          } else {
            fallbackFailure = outcome;
          }
          settleIfIdle();
        },
        () => {
          pending -= 1;
          const failure: HedgeFailure = { ok: false, reason: "error", status: 503 };
          if (which === "primary") primaryFailure = failure;
          else fallbackFailure = failure;
          settleIfIdle();
        },
      );
    };

    const startFallback = () => {
      if (done || fallbackStarted || !fallback) return;
      const left = deadline - now();
      if (left < options.minMs) return;
      fallbackStarted = true;
      run("fallback", fallback, left);
    };

    if (options.signal?.aborted) return onAbort();
    options.signal?.addEventListener("abort", onAbort, { once: true });
    run("primary", primary, options.budgetMs);
    if (fallback && options.hedgeMs !== null && options.hedgeMs < options.budgetMs) {
      timer = setTimeout(startFallback, options.hedgeMs);
    }
  });
}
