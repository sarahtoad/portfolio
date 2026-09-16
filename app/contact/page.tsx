import type { Metadata } from "next";
import PageShell from "@/components/ui/PageShell";
import ContactForm from "@/components/contact/ContactForm";
import Channels from "@/components/contact/Channels";
import Voices from "@/components/contact/Voices";

export const metadata: Metadata = {
  title: "Contact — Sarah Khodja",
  description: "Send a raven.",
};

export default function ContactPage() {
  return (
    <PageShell title="CONTACT" subtitle="A message across the realm">
      <Channels />
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <Voices />
        <ContactForm />
      </section>
    </PageShell>
  );
}
