import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import JourneySection from "@/components/experience/JourneySection";
import CertificatesSection from "@/components/experience/CertificatesSection";

export const metadata: Metadata = {
  title: "Experience — Sarah Khodja",
  description: "The expedition so far.",
};

export default function ExperiencePage() {
  return (
    <PageShell title="EXPERIENCE" subtitle="The path traveled and the seals earned">
      <JourneySection />
      <CertificatesSection />
    </PageShell>
  );
}
