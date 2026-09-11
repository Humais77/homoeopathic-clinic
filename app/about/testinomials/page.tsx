import type { Metadata } from "next";
import { PageHero } from "@/src/components/sections/PageHero";
import { TestimonialsClient } from "@/src/components/sections/TestimonialsClient";

export const metadata: Metadata = {
  title: "Testimonials | Heal By Nature",
  description:
    "Read what our clients have to say about their experience with Heal By Nature.",
};

export default function TestimonialsPage() {
  return (
    <main>
      <PageHero
        title="Testimonials"
        subtitle="Patient Experiences"
        description="Discover what our clients have to say about their experience with Heal By Nature."
      />

      <TestimonialsClient />
    </main>
  );
}