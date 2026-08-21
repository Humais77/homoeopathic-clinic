import "dotenv/config";
import { prisma } from "@/src/lib/prisma";

console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

const treatments = [
  'Hair Fall',
  'Skin Issues',
  'Digestive Problems',
  'Stress & Anxiety',
  'Chronic Conditions',
  "Women's Health",
  'General Consultation',
  'Diabetes',
  'Blood Pressure',
  'Psoriasis',
  'Migraine',
  'Allergy',
  'Thyroid',
  'Kidney Problems',
  'Liver Diseases',
  'Male Infertility',
  'Female Infertility',
  'PCOS',
  'Joint Pain',
  'Arthritis',
  "Children's Diseases",
  'Asthma',
  'Weight Loss',
];

async function main() {
  console.log('🌱 Seeding treatments...');

  for (const name of treatments) {
    await prisma.treatment.upsert({
      where: { name },
      update: {},
      create: { name, isActive: true },
    });
  }

  console.log(`✅ ${treatments.length} treatments seeded successfully!`);
}

main()
  .catch((error) => {
    console.error('❌ Error seeding treatments:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });