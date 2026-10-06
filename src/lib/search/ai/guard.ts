/**
 * The route's guardrails, in memory (one process; a serverless instance keeps
 * its own — enough to stop a runaway client, not a distributed quota).
 * Pure classes with an injectable clock, so they test under node.
 * (No constructor parameter properties: `node --experimental-strip-types`
 * cannot erase them.)
 */

export type Clock = () => number;

/** Sliding windows per key: e.g. 20 per minute AND 300 per day. */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();
  private readonly windows: Array<{ ms: number; max: number }>;
  private readonly now: Clock;
  private readonly maxKeys: number;

  constructor(windows: Array<{ ms: number; max: number }>, now: Clock = Date.now, maxKeys = 5000) {
    this.windows = windows;
    this.now = now;
    this.maxKeys = maxKeys;
  }

  /** Records a hit and says whether it is allowed. A refused hit is not recorded. */
  take(key: string): boolean {
    const t = this.now();
    const longest = Math.max(...this.windows.map((w) => w.ms));
    const list = (this.hits.get(key) ?? []).filter((h) => t - h < longest);
    for (const w of this.windows) {
      if (list.filter((h) => t - h < w.ms).length >= w.max) {
        this.hits.set(key, list);
        return false;
      }
    }
    list.push(t);
    this.hits.delete(key);
    this.hits.set(key, list);
    // Bound memory: forget the least recently seen visitors.
    while (this.hits.size > this.maxKeys) this.hits.delete(this.hits.keys().next().value as string);
    return true;
  }
}

/** Least-recently-used cache with a time to live. */
export class LruCache<V> {
  private readonly entries = new Map<string, { value: V; at: number }>();
  private readonly max: number;
  private readonly ttlMs: number;
  private readonly now: Clock;

  constructor(max: number, ttlMs: number, now: Clock = Date.now) {
    this.max = max;
    this.ttlMs = ttlMs;
    this.now = now;
  }

  get(key: string): V | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (this.now() - entry.at > this.ttlMs) {
      this.entries.delete(key);
      return undefined;
    }
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value;
  }

  set(key: string, value: V): void {
    this.entries.delete(key);
    this.entries.set(key, { value, at: this.now() });
    while (this.entries.size > this.max) this.entries.delete(this.entries.keys().next().value as string);
  }

  get size(): number {
    return this.entries.size;
  }
}
