import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import AboutHero from "@/components/about/AboutHero";
import Interests from "@/components/about/Interests";
import SkillTree from "@/components/about/SkillTree";
import Education from "@/components/about/Education";
import { aboutContent } from "@/data/about";

export const metadata: Metadata = {
  title: "About — Sarah Khodja",
  description: "The character behind the code.",
};

export default async function AboutPage() {
  let content = aboutContent;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/content/about`, { cache: "no-store" });
    if (res.ok) content = await res.json();
  } catch { /* use seed */ }

  return (
    <PageShell title="ABOUT" subtitle="The adventurer behind the code">
      <AboutHero content={content} />
      <Interests interests={content.interests} />
      <SkillTree bars={content.skillBars} groups={content.skillGroups} />
      <Education entries={content.education} />
    </PageShell>
  );
}
