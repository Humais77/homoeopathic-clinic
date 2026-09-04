import { prisma } from "@/src/lib/prisma";

import {
  TreatmentsSectionClient,
  type HomeTreatment,
} from "./TreatmentsSectionClient";

export async function TreatmentsSection() {
  const treatments = await prisma.treatment.findMany({
    where: {
      status: "PUBLISHED",
      isActive: true,
    },

    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      category: true,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 6,
  });

  const serializedTreatments: HomeTreatment[] =
    treatments.map((treatment) => ({
      id: treatment.id,
      name: treatment.name,
      slug: treatment.slug,
      description: treatment.description,
      image: treatment.image,
      category: treatment.category,
    }));

  return (
    <TreatmentsSectionClient
      treatments={serializedTreatments}
    />
  );
}