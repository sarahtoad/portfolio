import fs from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type {
  Certificate,
  Quest,
  JourneyChapter,
  Message,
  Stats,
  AboutContent,
  ArtForm,
  ArtProject,
} from "./types";

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

const DEFAULT_STATS: Stats = {
  totalVisits: 0,
  uniqueVisitors: 0,
  totalPageViews: 0,
  days: {},
  pageViewsByPath: {},
  referrers: {},
  browsers: {},
  devices: {},
};

function redisFromEnv(): Redis | null {
  const url =
    process.env.KV_REST_API_URL ??
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ??
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.REDIS_REST_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

const redis = redisFromEnv();
const onVercel = process.env.VERCEL === "1";

const REDIS_MISSING_ERROR =
  "Persistence is not configured. On Vercel you must add the Upstash Redis integration (env UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, or KV_REST_API_URL + KV_REST_API_TOKEN).";

function redisKey(key: string) {
  return KV_PREFIX + key;
}

async function readJson<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get<string>(redisKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as T;
    return parsed;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown) {
  if (redis) {
    try {
      await redis.set(redisKey(key), JSON.stringify(value));
      return "redis";
    } catch (e) {
      throw new Error(`Redis write failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  if (onVercel) throw new Error(REDIS_MISSING_ERROR);
  return "fs";
}

function fileFor(resource: Resource) {
  return path.join(CONTENT_DIR, FILES[resource]);
}

export async function readStore<T>(resource: Resource, seed: T[]): Promise<T[]> {
  const stored = await readJson<T[]>(FILES[resource]);
  if (Array.isArray(stored)) return stored;
  try {
    const raw = await fs.promises.readFile(fileFor(resource), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : seed;
  } catch {
    return seed;
  }
}

export async function writeStore<T>(resource: Resource, items: T[]) {
  if ((await writeJson(FILES[resource], items)) === "fs") {
    await fs.promises.mkdir(CONTENT_DIR, { recursive: true });
    await fs.promises.writeFile(fileFor(resource), JSON.stringify(items, null, 2), "utf8");
  }
}

export async function readCertificates(): Promise<Certificate[]> {
  const { certificates: seed } = await import("@/data/certificates");
  return readStore<Certificate>("certificates", seed);
}

export async function readQuests(): Promise<Quest[]> {
  const { quests: seed } = await import("@/data/projects");
  return readStore<Quest>("projects", seed);
}

export async function readJourney(): Promise<JourneyChapter[]> {
  const { journeyChapters: seed } = await import("@/data/journey");
  return readStore<JourneyChapter>("experience", seed);
}

export async function readMessages(): Promise<Message[]> {
  return readStore<Message>("messages", []);
}

export async function readArtForms(): Promise<ArtForm[]> {
  const { artForms: seed } = await import("@/data/arts");
  return readStore<ArtForm>("creative", seed);
}

export async function readArtProjects(): Promise<ArtProject[]> {
  return readStore<ArtProject>("artprojects", []);
}

export async function readAbout(): Promise<AboutContent> {
  const seed = (await import("@/data/about")).aboutContent;
  const stored = await readJson<Partial<AboutContent>>("about.json");
  if (stored) {
    return {
      heroTagline: stored.heroTagline ?? seed.heroTagline,
      bio: stored.bio ?? seed.bio,
      interests: Array.isArray(stored.interests) ? stored.interests : seed.interests,
      skillBars: Array.isArray(stored.skillBars) ? stored.skillBars : seed.skillBars,
      skillGroups: Array.isArray(stored.skillGroups) ? stored.skillGroups : seed.skillGroups,
      education: Array.isArray(stored.education) ? stored.education : seed.education,
    };
  }
  try {
    const raw = await fs.promises.readFile(ABOUT_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<AboutContent>;
    return {
      heroTagline: parsed.heroTagline ?? seed.heroTagline,
      bio: parsed.bio ?? seed.bio,
      interests: Array.isArray(parsed.interests) ? parsed.interests : seed.interests,
      skillBars: Array.isArray(parsed.skillBars) ? parsed.skillBars : seed.skillBars,
      skillGroups: Array.isArray(parsed.skillGroups) ? parsed.skillGroups : seed.skillGroups,
      education: Array.isArray(parsed.education) ? parsed.education : seed.education,
    };
  } catch {
    return seed;
  }
}

export async function writeAbout(content: AboutContent) {
  if ((await writeJson("about.json", content)) === "fs") {
    await fs.promises.mkdir(CONTENT_DIR, { recursive: true });
    await fs.promises.writeFile(ABOUT_FILE, JSON.stringify(content, null, 2), "utf8");
  }
}

export async function readStats(): Promise<Stats> {
  const stored = await readJson<Partial<Stats>>("stats.json");
  if (stored) {
    return {
      totalVisits: stored.totalVisits ?? 0,
      uniqueVisitors: stored.uniqueVisitors ?? 0,
      totalPageViews: stored.totalPageViews ?? 0,
      days: stored.days ?? {},
      pageViewsByPath: stored.pageViewsByPath ?? {},
      referrers: stored.referrers ?? {},
      browsers: stored.browsers ?? {},
      devices: stored.devices ?? {},
    };
  }
  try {
    const raw = await fs.promises.readFile(STATS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<Stats>;
    return {
      totalVisits: parsed.totalVisits ?? 0,
      uniqueVisitors: parsed.uniqueVisitors ?? 0,
      totalPageViews: parsed.totalPageViews ?? 0,
      days: parsed.days ?? {},
      pageViewsByPath: parsed.pageViewsByPath ?? {},
      referrers: parsed.referrers ?? {},
      browsers: parsed.browsers ?? {},
      devices: parsed.devices ?? {},
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export async function writeStats(stats: Stats) {
  if ((await writeJson("stats.json", stats)) === "fs") {
    await fs.promises.mkdir(CONTENT_DIR, { recursive: true });
    await fs.promises.writeFile(STATS_FILE, JSON.stringify(stats, null, 2), "utf8");
  }
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
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export { CONTENT_DIR };