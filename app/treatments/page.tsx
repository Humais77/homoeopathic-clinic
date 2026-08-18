import { PageHero } from "@/src/components/sections/PageHero";
import { TreatmentsContent } from "@/src/components/sections/TreatmentsContent";
import { StartJourney } from "@/src/components/sections/StartJourney";
import { ConsultationSection } from "@/src/components/sections/ConsultationSection";

export const metadata = {
  title: 'Treatments - Homoeopathic Clinic',
  description: 'Discover our comprehensive range of natural homeopathic treatments for various health conditions.',
};

export default function TreatmentsPage() {
  return (
    <main>
      {/* Page Hero Section */}
      <PageHero
        title="Discover Our Treatments"
        subtitle="Our Treatments"
        description="Explore our comprehensive range of personalized homeopathic treatments designed to address the root cause of illness, restore natural balance, and support long-term wellness."
        backgroundImage="/images/TreatmentHero.png"
      />
      <TreatmentsContent />
      <ConsultationSection/>
      <StartJourney />
    </main>
  );
}