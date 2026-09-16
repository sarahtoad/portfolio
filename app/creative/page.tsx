import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import ArtsSection from "@/components/arts/ArtsSection";

export const metadata: Metadata = {
  title: "Creative — Sarah Khodja",
  description: "Beyond the forge: photography, violin, 3D worlds, design, cinema, and visual storytelling.",
};

export default function CreativePage() {
  return (
    <PageShell title="CREATIVE" subtitle="My hobbies & crafts beyond the forge">
      <ArtsSection />
    </PageShell>
  );
}
