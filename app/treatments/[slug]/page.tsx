import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { PageHero } from "@/src/components/sections/PageHero";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: Props) {
  const { slug } = await params;

  const treatment =
    await prisma.treatment.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        isActive: true,
      },
      select: {
        name: true,
        description: true,
      },
    });

  if (!treatment) {
    return {
      title: "Treatment Not Found",
    };
  }

  return {
    title: `${treatment.name} - Heal By Nature`,
    description:
      treatment.description ||
      `Learn more about ${treatment.name} at Heal By Nature.`,
  };
}

export default async function TreatmentDetailPage({
  params,
}: Props) {
  const { slug } = await params;

  const treatment =
    await prisma.treatment.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        isActive: true,
      },
    });

  if (!treatment) {
    notFound();
  }

  return (
    <main>
      <PageHero
        title={treatment.name}
        subtitle={
          treatment.category ||
          "Our Treatment"
        }
        description={
          treatment.description ||
          "Personalized homeopathic care designed to support your health and wellbeing."
        }
        backgroundImage={
          treatment.image ||
          "/images/TreatmentHero.png"
        }
      />

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4">
          {/* Featured Image */}
          {treatment.image && (
            <div className="relative mb-10 h-[280px] overflow-hidden rounded-3xl md:h-[450px]">
              <Image
                src={treatment.image}
                alt={treatment.name}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}

          {/* Category */}
          {treatment.category && (
            <div className="mb-4">
              <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                {treatment.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-[#151568] md:text-4xl">
            {treatment.name}
          </h1>

          {/* Description */}
          {treatment.description && (
            <p className="mt-5 text-lg leading-8 text-gray-600">
              {treatment.description}
            </p>
          )}

          {/* Content */}
          {treatment.content && (
            <div className="mt-10 whitespace-pre-line text-base leading-8 text-gray-700">
              {treatment.content}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-[#f5f7ff] p-7 text-center">
            <h2 className="text-2xl font-bold text-[#151568]">
              Ready to Start Your Journey?
            </h2>

            <p className="mx-auto mt-2 max-w-2xl text-gray-600">
              Book an appointment with our
              doctors for personalized
              consultation and care.
            </p>

            <Link
              href="/appointment"
              className="mt-5 inline-flex rounded-xl bg-[#3da449] px-7 py-3 font-semibold text-white transition hover:bg-[#328d3e]"
            >
              Book an Appointment
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}