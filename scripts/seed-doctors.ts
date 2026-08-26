import "dotenv/config";
import { prisma } from "@/src/lib/prisma";

console.log(
  "DATABASE_URL exists:",
  !!process.env.DATABASE_URL
);

const doctors = [
  {
    name: "Dr. Sarah Ahmed",
    qualification: "BHMS, MD (Homeopathy)",
    specialization: "Chronic Diseases & General Homeopathy",
    experience: "10+ Years Experience",
    description:
      "Experienced homeopathic physician specializing in chronic conditions, general health, and individualized treatment plans.",
    image: null,
  },
  {
    name: "Dr. Muhammad Ali",
    qualification: "BHMS",
    specialization: "Skin & Allergic Conditions",
    experience: "8+ Years Experience",
    description:
      "Specialist in homeopathic treatment for skin disorders, allergies, and long-term health conditions.",
    image: null,
  },
  {
    name: "Dr. Ayesha Khan",
    qualification: "BHMS, DHMS",
    specialization: "Women's & Children's Health",
    experience: "7+ Years Experience",
    description:
      "Focused on women's health, children's health, hormonal concerns, and personalized homeopathic care.",
    image: null,
  },
  {
    name: "Dr. Hassan Raza",
    qualification: "BHMS",
    specialization: "Digestive & Respiratory Disorders",
    experience: "9+ Years Experience",
    description:
      "Provides individualized homeopathic care for digestive problems, respiratory conditions, and chronic illnesses.",
    image: null,
  },
];

async function main() {
  console.log("🌱 Seeding doctors...");

  for (const doctor of doctors) {
    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        name: doctor.name,
      },
    });

    if (existingDoctor) {
      await prisma.doctor.update({
        where: {
          id: existingDoctor.id,
        },
        data: {
          qualification: doctor.qualification,
          specialization: doctor.specialization,
          experience: doctor.experience,
          description: doctor.description,
          image: doctor.image,
          isActive: true,
        },
      });

      console.log(`🔄 Updated: ${doctor.name}`);
    } else {
      await prisma.doctor.create({
        data: {
          name: doctor.name,
          qualification: doctor.qualification,
          specialization: doctor.specialization,
          experience: doctor.experience,
          description: doctor.description,
          image: doctor.image,
          isActive: true,
        },
      });

      console.log(`✅ Created: ${doctor.name}`);
    }
  }

  console.log(
    `\n🎉 ${doctors.length} doctors seeded successfully!`
  );
}

main()
  .catch((error) => {
    console.error("❌ Error seeding doctors:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });