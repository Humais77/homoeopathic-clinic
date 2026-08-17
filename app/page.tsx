import { Hero } from "@/src/components/sections/Hero";
import { StartJourney } from "@/src/components/sections/StartJourney";
import { WhyHealByNature } from "@/src/components/sections/WhyHealByNature";


export default function Home() {
  return (
    <main>
      <Hero />
      <WhyHealByNature/>
      <StartJourney/>
    </main>
  );
}