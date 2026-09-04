import { prisma } from "@/src/lib/prisma";

import {
  DoctorsSpecialistsClient,
  type HomeDoctor,
} from "./DoctorsSpecialistsClient";

export async function DoctorsSpecialists() {
  const doctors = await prisma.doctor.findMany({
    where: {
      isActive: true,
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

    orderBy: {
      createdAt: "asc",
    },
  });

  const serializedDoctors: HomeDoctor[] =
    doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      qualification: doctor.qualification,
      specialization: doctor.specialization,
      experience: doctor.experience,
      description: doctor.description,
      image: doctor.image,
    }));

  return (
    <DoctorsSpecialistsClient
      doctors={serializedDoctors}
    />
  );
}