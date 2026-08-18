import { PageHero } from "@/src/components/sections/PageHero";
import { DoctorSpecialists } from "@/src/components/sections/DoctorsSpecialists";
import { TrustedPharmacies } from "@/src/components/sections/TrustedPharmacies";
import { FounderCeoHome } from "@/src/components/sections/FounderCeoHome";
import { StartJourney } from "@/src/components/sections/StartJourney";

export const metadata = {
  title: "Our Doctors - Homoeopathic Clinic",
  description:
    "Meet our team of highly qualified and experienced homeopathic doctors.",
};

export default function DoctorsPage() {
  return (
    <main>
      <PageHero
        title="Meet Our Specialists"
        subtitle="Doctors & Pharmacies"
        description="From expert consultations to genuine homeopathic medicines, we provide everything you need to support your journey toward better health."
        backgroundImage="/images/DoctorsHero.png"
      />
      <FounderCeoHome/>
      <DoctorSpecialists/>
      <TrustedPharmacies/>
      <StartJourney/>
    </main>
  );
}