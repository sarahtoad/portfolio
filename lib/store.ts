import fs from "node:fs";
import path from "node:path";
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

function fileFor(resource: Resource) {
  return path.join(CONTENT_DIR, FILES[resource]);
}

export async function readStore<T>(resource: Resource, seed: T[]): Promise<T[]> {
  try {
    const raw = await fs.promises.readFile(fileFor(resource), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : seed;
  } catch {
    return seed;
  }
}

export async function writeStore<T>(resource: Resource, items: T[]) {
  await fs.promises.mkdir(CONTENT_DIR, { recursive: true });
  await fs.promises.writeFile(fileFor(resource), JSON.stringify(items, null, 2), "utf8");
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
  await fs.promises.mkdir(CONTENT_DIR, { recursive: true });
  await fs.promises.writeFile(ABOUT_FILE, JSON.stringify(content, null, 2), "utf8");
}

export async function readStats(): Promise<Stats> {
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
  await fs.promises.mkdir(CONTENT_DIR, { recursive: true });
  await fs.promises.writeFile(STATS_FILE, JSON.stringify(stats, null, 2), "utf8");
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