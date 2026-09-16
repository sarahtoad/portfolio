import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import AboutHero from "@/components/about/AboutHero";
import Interests from "@/components/about/Interests";
import SkillTree from "@/components/about/SkillTree";
import Education from "@/components/about/Education";
import { readAbout } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — Sarah Khodja",
  description: "The character behind the code.",
};

export default async function AboutPage() {
  const content = await readAbout();

  return (
    <PageShell title="ABOUT" subtitle="The adventurer behind the code">
      <AboutHero content={content} />
      <Interests interests={content.interests} />
      <SkillTree bars={content.skillBars} groups={content.skillGroups} />
      <Education entries={content.education} />
    </PageShell>
  );
}