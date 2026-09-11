import { prisma } from "@/src/lib/prisma";
import { PageHero } from "@/src/components/sections/PageHero";
import { DoctorsSpecialistsClient } from "@/src/components/sections/DoctorsSpecialistsClient";

export const metadata = {
  title: "Our Team | Heal By Nature",
  description:
    "Meet the qualified doctors and specialists at Heal By Nature.",
};

export default async function OurTeamPage() {
  const doctors = await prisma.doctor.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      qualification: true,
      specialization: true,
      experience: true,
      description: true,
      image: true,
    },
  });

  return (
    <main>
      <PageHero
        title="Our Team"
        subtitle="Meet our qualified doctors and specialists dedicated to your health and well-being."
        backgroundImage="/images/DoctorsHero.png"
      />

      <DoctorsSpecialistsClient doctors={doctors} />
    </main>
  );
}