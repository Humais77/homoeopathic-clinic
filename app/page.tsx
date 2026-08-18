import { AboutHome } from "@/src/components/sections/AboutHome";
import { FounderCeoHome } from "@/src/components/sections/FounderCeoHome";
import { Hero } from "@/src/components/sections/Hero";
import { StartJourney } from "@/src/components/sections/StartJourney";
import { WhyHealByNature } from "@/src/components/sections/WhyHealByNature";


export default function Home() {
  return (
    <main>
      <Hero />
      <AboutHome/>
      <WhyHealByNature/>
      <FounderCeoHome/>
      <StartJourney/>
    </main>
  );
}