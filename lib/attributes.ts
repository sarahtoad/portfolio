import type { AboutContent } from "./types";

const KEYWORDS: Record<string, string[]> = {
  creativity: ["photography", "blender", "design", "cinema", "violin", "art", "storytelling", "creative"],
  logic: ["programming", "math", "algorithm", "problem", "debug", "code", "python", "typescript"],
  communication: ["writing", "presentation", "team", "leadership", "public speaking", "blog"],
  resilience: ["challenge", "persistence", "hard work", "dedication", "overcome"],
};

export function computeAttributes(content: AboutContent | null) {
  const attrs = { creativity: 20, logic: 20, communication: 20, resilience: 20 };
  if (!content) return attrs;

  const allText = [
    content.bio,
    ...content.interests.map((i) => `${i.name} ${i.description}`),
    ...content.skillBars.map((s) => s.name),
    ...content.skillGroups.flatMap((g) => g.skills),
  ]
    .join(" ")
    .toLowerCase();

  for (const [attr, keywords] of Object.entries(KEYWORDS)) {
    let score = 10;
    for (const kw of keywords) {
      if (allText.includes(kw)) score += 8;
    }
    attrs[attr as keyof typeof attrs] = Math.min(score, 100);
  }

  return attrs;
}