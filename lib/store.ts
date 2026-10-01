import fs from "node:fs";
import path from "node:path";
import type {
  Certificate,
  Quest,
  JourneyChapter,
  Message,
  Stats,
  DayStat,
  AboutContent,
  ArtForm,
  ArtProject,
} from "./types";
import { getRedis, withLock } from "./redis";
import { isServerless, storeConfigError } from "./env";

export type Resource = "certificates" | "projects" | "experience" | "messages" | "creative" | "artprojects";

const CONTENT_DIR = path.join(process.cwd(), "content");

const FILES: Record<Resource, string> = {
  certificates: "certificates.json",
  projects: "projects.json",
  experience: "experience.json",
  messages: "messages.json",
  creative: "creative.json",
  artprojects: "artprojects.json",
};

const ABOUT_FILE = path.join(CONTENT_DIR, "about.json");
const STATS_FILE = path.join(CONTENT_DIR, "stats.json");

const KV_PREFIX = "portfolio:";
const STATS_PREFIX = `${KV_PREFIX}stats:`;

const STATS_KEYS = {
  counters: `${STATS_PREFIX}counters`,
  days: `${STATS_PREFIX}days`,
  paths: `${STATS_PREFIX}paths`,
  referrers: `${STATS_PREFIX}referrers`,
  browsers: `${STATS_PREFIX}browsers`,
  devices: `${STATS_PREFIX}devices`,
} as const;

/** Caps on the client-influenced counters, so a bot cannot grow Redis forever. */
const CARDINALITY_LIMITS = { paths: 200, referrers: 150, browsers: 24, devices: 12 } as const;

const EMPTY_STATS: Stats = {
  totalVisits: 0,
  uniqueVisitors: 0,
  totalPageViews: 0,
  days: {},
  pageViewsByPath: {},
  referrers: {},
  browsers: {},
  devices: {},
};

export class StoreUnavailableError extends Error {}

function unavailable(): never {
  throw new StoreUnavailableError(storeConfigError() ?? "Storage is not available.");
}

function key(name: string) {
  return KV_PREFIX + name;
}

function fileFor(resource: Resource) {
  return path.join(CONTENT_DIR, FILES[resource]);
}

async function readJson<T>(name: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get<string>(key(name));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(name: string, value: unknown) {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(key(name), JSON.stringify(value));
    } catch (e) {
      throw new Error(`Redis write failed: ${e instanceof Error ? e.message : String(e)}`);
    }
    return "redis";
  }
  if (isServerless) unavailable();
  return "fs";
}

async function writeFile(file: string, value: unknown) {
  await fs.promises.mkdir(CONTENT_DIR, { recursive: true });
  await fs.promises.writeFile(file, JSON.stringify(value, null, 2), "utf8");
}

/**
 * Fallback content used until something is stored in Redis. Resolved centrally
 * so the public site and the admin panel always agree on the starting data —
 * they previously diverged, which made the first admin save on a fresh Vercel
 * deployment wipe the seeded entries.
 */
async function seedFor<T>(resource: Resource): Promise<T[]> {
  switch (resource) {
    case "certificates":
      return (await import("@/data/certificates")).certificates as T[];
    case "projects":
      return (await import("@/data/projects")).quests as T[];
    case "experience":
      return (await import("@/data/journey")).journeyChapters as T[];
    case "creative":
      return (await import("@/data/arts")).artForms as T[];
    default:
      return [];
  }
}

export async function readStore<T>(resource: Resource): Promise<T[]> {
  const stored = await readJson<T[]>(FILES[resource]);
  if (Array.isArray(stored)) return stored;

  try {
    const raw = await fs.promises.readFile(fileFor(resource), "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as T[];
  } catch {
    /* not bundled or not readable — fall through to the compiled seed */
  }
  return seedFor<T>(resource);
}

export async function writeStore<T>(resource: Resource, items: T[]) {
  if ((await writeJson(FILES[resource], items)) === "fs") {
    await writeFile(fileFor(resource), items);
  }
}

/**
 * Read-modify-write under a lock. Every admin mutation and every contact
 * message goes through here: two parallel serverless invocations would
 * otherwise overwrite each other's changes.
 */
export async function mutateStore<T, R>(resource: Resource, mutate: (items: T[]) => R | Promise<R>): Promise<R> {
  if (!getRedis() && isServerless) unavailable();
  return withLock(`store:${resource}`, async () => {
    const items = await readStore<T>(resource);
    const result = await mutate(items);
    await writeStore(resource, items);
    return result;
  });
}

export async function readCertificates(): Promise<Certificate[]> {
  return readStore<Certificate>("certificates");
}

export async function readQuests(): Promise<Quest[]> {
  return readStore<Quest>("projects");
}

export async function readJourney(): Promise<JourneyChapter[]> {
  return readStore<JourneyChapter>("experience");
}

export async function readMessages(): Promise<Message[]> {
  return readStore<Message>("messages");
}

export async function readArtForms(): Promise<ArtForm[]> {
  return readStore<ArtForm>("creative");
}

export async function readArtProjects(): Promise<ArtProject[]> {
  return readStore<ArtProject>("artprojects");
}

function mergeAbout(base: AboutContent, patch: Partial<AboutContent> | null): AboutContent {
  if (!patch) return base;
  return {
    heroTagline: patch.heroTagline ?? base.heroTagline,
    bio: patch.bio ?? base.bio,
    interests: Array.isArray(patch.interests) ? patch.interests : base.interests,
    skillBars: Array.isArray(patch.skillBars) ? patch.skillBars : base.skillBars,
    skillGroups: Array.isArray(patch.skillGroups) ? patch.skillGroups : base.skillGroups,
    education: Array.isArray(patch.education) ? patch.education : base.education,
  };
}

export async function readAbout(): Promise<AboutContent> {
  const seed = (await import("@/data/about")).aboutContent;
  const stored = await readJson<Partial<AboutContent>>("about.json");
  if (stored) return mergeAbout(seed, stored);
  try {
    const raw = await fs.promises.readFile(ABOUT_FILE, "utf8");
    return mergeAbout(seed, JSON.parse(raw) as Partial<AboutContent>);
  } catch {
    return seed;
  }
}

export async function writeAbout(content: AboutContent) {
  if (!getRedis() && isServerless) unavailable();
  await withLock("store:about", async () => {
    if ((await writeJson("about.json", content)) === "fs") {
      await writeFile(ABOUT_FILE, content);
    }
  });
}

export async function updateAbout(patch: Partial<AboutContent>): Promise<AboutContent> {
  if (!getRedis() && isServerless) unavailable();
  return withLock("store:about", async () => {
    const updated = mergeAbout(await readAbout(), patch);
    if ((await writeJson("about.json", updated)) === "fs") {
      await writeFile(ABOUT_FILE, updated);
    }
    return updated;
  });
}

/* ------------------------------------------------------------------ */
/* Analytics — atomic counters so parallel visitors cannot clobber data */
/* ------------------------------------------------------------------ */

function toCounter(hash: Record<string, unknown> | null | undefined) {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(hash ?? {})) {
    const n = Number(v);
    if (Number.isFinite(n)) out[k] = n;
  }
  return out;
}

function readStatsFromFile(): Stats {
  try {
    const raw = require("node:fs").promises;
    void raw;
  } catch {
    /* noop */
  }
  return EMPTY_STATS;
}

async function readStatsFromDisk(): Promise<Stats> {
  try {
    const raw = await fs.promises.readFile(STATS_FILE, "utf8");
    return { ...EMPTY_STATS, ...(JSON.parse(raw) as Partial<Stats>) };
  } catch {
    return EMPTY_STATS;
  }
}

export type VisitInput = {
  day: string;
  referrer: string;
  browser: string;
  device: string;
  unique: boolean;
};

export async function recordVisit(input: VisitInput) {
  const redis = getRedis();
  if (!redis) {
    await withLock("stats", async () => {
      const stats = await readStatsFromDisk();
      stats.totalVisits += 1;
      const day = (stats.days[input.day] ??= { visits: 0, unique: 0, pageViews: 0 });
      day.visits += 1;
      if (input.unique) {
        stats.uniqueVisitors += 1;
        day.unique += 1;
      }
      stats.referrers[input.referrer] = (stats.referrers[input.referrer] ?? 0) + 1;
      stats.browsers[input.browser] = (stats.browsers[input.browser] ?? 0) + 1;
      stats.devices[input.device] = (stats.devices[input.device] ?? 0) + 1;
      await writeFile(STATS_FILE, stats);
    });
    return;
  }

  const pipe = redis.pipeline();
  pipe.hincrby(STATS_KEYS.counters, "totalVisits", 1);
  pipe.hincrby(STATS_KEYS.days, `${input.day}:visits`, 1);
  if (input.unique) {
    pipe.hincrby(STATS_KEYS.counters, "uniqueVisitors", 1);
    pipe.hincrby(STATS_KEYS.days, `${input.day}:unique`, 1);
  }
  pipe.hincrby(STATS_KEYS.referrers, input.referrer, 1);
  pipe.hincrby(STATS_KEYS.browsers, input.browser, 1);
  pipe.hincrby(STATS_KEYS.devices, input.device, 1);
  pipe.hlen(STATS_KEYS.referrers);
  pipe.hlen(STATS_KEYS.browsers);
  pipe.hlen(STATS_KEYS.devices);

  const results = await pipe.exec<any>();
  const referrerLen = results[5] as number | undefined;
  const browserLen = results[6] as number | undefined;
  const deviceLen = results[7] as number | undefined;

  if ((referrerLen ?? 0) > CARDINALITY_LIMITS.referrers) {
    await redis.hdel(STATS_KEYS.referrers, input.referrer).catch(() => undefined);
  }
  if ((browserLen ?? 0) > CARDINALITY_LIMITS.browsers) {
    await redis.hdel(STATS_KEYS.browsers, input.browser).catch(() => undefined);
  }
  if ((deviceLen ?? 0) > CARDINALITY_LIMITS.devices) {
    await redis.hdel(STATS_KEYS.devices, input.device).catch(() => undefined);
  }
}

export async function recordPageView(day: string, pathname: string) {
  const redis = getRedis();
  if (!redis) {
    await withLock("stats", async () => {
      const stats = await readStatsFromDisk();
      stats.totalPageViews += 1;
      const bucket = (stats.days[day] ??= { visits: 0, unique: 0, pageViews: 0 });
      bucket.pageViews += 1;
      stats.pageViewsByPath[pathname] = (stats.pageViewsByPath[pathname] ?? 0) + 1;
      await writeFile(STATS_FILE, stats);
    });
    return;
  }

  const pipe = redis.pipeline();
  pipe.hincrby(STATS_KEYS.counters, "totalPageViews", 1);
  pipe.hincrby(STATS_KEYS.days, `${day}:pageViews`, 1);
  pipe.hincrby(STATS_KEYS.paths, pathname, 1);
  pipe.hlen(STATS_KEYS.paths);

  const results = await pipe.exec<[number, number, number, number]>();
  const pathsLen = results[3] as number | undefined;

  if ((pathsLen ?? 0) > CARDINALITY_LIMITS.paths) {
    await redis.hdel(STATS_KEYS.paths, pathname).catch(() => undefined);
  }
}

export async function readStats(): Promise<Stats> {
  const redis = getRedis();
  if (!redis) return readStatsFromDisk();

  const pipe = redis.pipeline();
  pipe.hgetall<Record<string, number>>(STATS_KEYS.counters);
  pipe.hgetall<Record<string, number>>(STATS_KEYS.days);
  pipe.hgetall<Record<string, number>>(STATS_KEYS.paths);
  pipe.hgetall<Record<string, number>>(STATS_KEYS.referrers);
  pipe.hgetall<Record<string, number>>(STATS_KEYS.browsers);
  pipe.hgetall<Record<string, number>>(STATS_KEYS.devices);

  const [counters, days, paths, referrers, browsers, devices] = await pipe.exec<
    [Record<string, number>, Record<string, number>, Record<string, number>, Record<string, number>, Record<string, number>, Record<string, number>]
  >();

  const bucket: Record<string, DayStat> = {};
  for (const [field, value] of Object.entries(toCounter(days))) {
    const [day, metric] = field.split(":");
    if (!day || !metric) continue;
    const entry = (bucket[day] ??= { visits: 0, unique: 0, pageViews: 0 });
    if (metric === "visits") entry.visits = value;
    else if (metric === "unique") entry.unique = value;
    else if (metric === "pageViews") entry.pageViews = value;
  }

  return {
    totalVisits: counters?.totalVisits ?? 0,
    uniqueVisitors: counters?.uniqueVisitors ?? 0,
    totalPageViews: counters?.totalPageViews ?? 0,
    days: bucket,
    pageViewsByPath: toCounter(paths),
    referrers: toCounter(referrers),
    browsers: toCounter(browsers),
    devices: toCounter(devices),
  };
}

export async function resetStats() {
  const redis = getRedis();
  if (redis) {
    await redis.del(...Object.values(STATS_KEYS));
    return;
  }
  if (isServerless) unavailable();
  await withLock("stats", () => writeFile(STATS_FILE, EMPTY_STATS));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function generateId(seed: string) {
  const base = slugify(seed) || "item";
  const suffix = crypto.randomUUID().slice(0, 6);
  return `${base}-${suffix}`;
}

export { CONTENT_DIR };
