import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import QuestsSection from "@/components/quests/QuestsSection";

export const metadata: Metadata = {
  title: "Projects — Sarah Khodja",
  description: "Quests forged in code and creativity.",
};

export default function ProjectsPage() {
  return (
    <PageShell title="PROJECTS" subtitle="Quests forged in code and creativity">
      <QuestsSection />
    </PageShell>
  );
}
