import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import AboutHero from "@/components/about/AboutHero";
import Interests from "@/components/about/Interests";
import SkillTree from "@/components/about/SkillTree";
import Education from "@/components/about/Education";
import type { AboutContent } from "@/lib/types";
import { apiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — Sarah Khodja",
  description: "The character behind the code.",
};

export default async function AboutPage() {
  let content: AboutContent;
  try {
    const res = await fetch(apiUrl("/api/content/about"), { cache: "no-store" });
    content = res.ok ? await res.json() : await import("@/data/about").then((m) => m.aboutContent);
  } catch {
    content = await import("@/data/about").then((m) => m.aboutContent);
  }

  return (
    <PageShell title="ABOUT" subtitle="The adventurer behind the code">
      <AboutHero content={content} />
      <Interests interests={content.interests} />
      <SkillTree bars={content.skillBars} groups={content.skillGroups} />
      <Education entries={content.education} />
    </PageShell>
  );
}