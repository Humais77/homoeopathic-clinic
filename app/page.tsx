import { AboutHome } from "@/src/components/sections/AboutHome";
import { ConsultationSection } from "@/src/components/sections/ConsultationSection";
import { FounderCeoHome } from "@/src/components/sections/FounderCeoHome";
import { Hero } from "@/src/components/sections/Hero";
import { StartJourney } from "@/src/components/sections/StartJourney";
import { Testimonials } from "@/src/components/sections/Testimonials";
import { TreatmentsSection } from "@/src/components/sections/TreatmentsSection";
import { WhyHealByNature } from "@/src/components/sections/WhyHealByNature";


export default function Home() {
  return (
    <main>
      <Hero />
      <AboutHome/>
      <WhyHealByNature/>
      <TreatmentsSection/>
      <FounderCeoHome/>
      <Testimonials/>
      <ConsultationSection/>
      <StartJourney/>
    </main>
  );
}