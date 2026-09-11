import type { Metadata } from "next";
import { PageHero } from "@/src/components/sections/PageHero";
import { FounderCeoClient } from "@/src/components/sections/FounderCeoClient";

export const metadata: Metadata = {
  title: "Founder Profile | Heal By Nature",
  description:
    "Learn about the founder and vision behind Heal By Nature and our commitment to personalized natural healthcare.",
};

export default function FounderProfilePage() {
  return (
    <main>
      <PageHero
        title="Founder Profile"
        subtitle="Our Founder"
        description="Meet the founder behind Heal By Nature and discover the vision that guides our approach to natural healing."
      />

      <FounderCeoClient />
    </main>
  );
}