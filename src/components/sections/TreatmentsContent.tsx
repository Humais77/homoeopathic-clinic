import { prisma } from "@/src/lib/prisma";
import { TreatmentsContentClient } from "./TreatmentsContentClient";

export async function TreatmentsContent() {
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
  });

  return (
    <TreatmentsContentClient
      treatments={treatments}
    />
  );
}