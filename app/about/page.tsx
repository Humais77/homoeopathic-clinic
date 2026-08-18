import { PageHero } from "@/src/components/sections/PageHero";
import { AboutTrustedCare } from "@/src/components/sections/AboutTrustedCare";
import { AboutMissionVision } from "@/src/components/sections/AboutMissionVision";

export const metadata = {
  title: 'About Us - Homoeopathic Clinic',
  description:
    'Learn about Heal By Nature, our mission, and our commitment to personalized homeopathic care.',
};

export default function AboutPage() {
  return (
    <main>
      {/* Page Hero Section */}
      <PageHero
        title="About Heal By Nature"
        subtitle="About Us"
        description="Heal By Nature is dedicated to providing personalized homeopathic care that focuses on treating the root cause rather than just the symptoms."
        backgroundImage="/images/AboutUsHero.png"
      />

      {/* Trusted Care Section */}
      <AboutTrustedCare />

      {/* Mission & Vision Section */}
      <AboutMissionVision />
    </main>
  );
}