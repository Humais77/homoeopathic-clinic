import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;

  const doctor = await prisma.doctor.findFirst({
    where: {
      id,
      isActive: true,
    },
    select: {
      name: true,
      specialization: true,
      description: true,
    },
  });

  if (!doctor) {
    return {
      title: "Doctor Not Found | Heal By Nature",
    };
  }

  return {
    title: `${doctor.name} | Heal By Nature`,
    description:
      doctor.description ||
      `${doctor.name} - ${doctor.specialization || "Homeopathic Specialist"} at Heal By Nature.`,
  };
}

export default async function DoctorDetailsPage({
  params,
}: Props) {
  const { id } = await params;

  const doctor = await prisma.doctor.findFirst({
    where: {
      id,
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
      isActive: true,
      schedule: {
        select: {
          id: true,
          isActive: true,
        },
      },
    },
  });

  if (!doctor) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-[#11136b] px-4 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/doctors"
            className="inline-flex items-center text-sm text-white/70 transition hover:text-white"
          >
            ← Back to Doctors
          </Link>

          <div className="mt-8 grid items-center gap-8 md:grid-cols-[240px_1fr]">
            {/* Doctor Image */}
            <div className="flex justify-center md:justify-start">
              <div className="relative h-52 w-52 overflow-hidden rounded-full border-4 border-white/20 bg-white/10 shadow-xl sm:h-60 sm:w-60">
                {doctor.image ? (
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    priority
                    sizes="240px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-sm text-white/50">
                      No image
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#45a94a]">
                Heal By Nature
              </p>

              <h1 className="mt-2 text-3xl font-bold sm:text-4xl md:text-5xl">
                {doctor.name}
              </h1>

              <p className="mt-3 text-lg font-medium text-white/90">
                {doctor.qualification}
              </p>

              {doctor.specialization && (
                <p className="mt-2 text-sm text-white/70">
                  {doctor.specialization}
                </p>
              )}

              {doctor.experience && (
                <div className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm">
                  {doctor.experience} experience
                </div>
              )}

              <div className="mt-6">
                <Link
                  href={`/appointment?doctorId=${doctor.id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-[#45a94a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#38903d]"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main */}
          <div className="space-y-8">
            {/* About */}
            <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#11136b] sm:text-2xl">
                About the Doctor
              </h2>

              <div className="mt-4">
                {doctor.description ? (
                  <p className="whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
                    {doctor.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Detailed information about this doctor
                    will be available soon.
                  </p>
                )}
              </div>
            </section>

            {/* Specialization */}
            <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#11136b] sm:text-2xl">
                Specialization
              </h2>

              <div className="mt-5">
                {doctor.specialization ? (
                  <div className="inline-flex rounded-xl bg-[#f0f8f1] px-5 py-3">
                    <span className="text-sm font-semibold text-[#45a94a]">
                      {doctor.specialization}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    General Homeopathic Care
                  </p>
                )}
              </div>
            </section>

            {/* Qualifications */}
            <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#11136b] sm:text-2xl">
                Qualifications & Experience
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Qualification
                  </p>

                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {doctor.qualification}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Experience
                  </p>

                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {doctor.experience ||
                      "Experience information unavailable"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#11136b]">
                Want to consult this doctor?
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Book a clinic visit or online consultation
                with {doctor.name}.
              </p>

              <Link
                href={`/appointment?doctorId=${doctor.id}`}
                className="mt-5 flex w-full items-center justify-center rounded-lg bg-[#11136b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0d0f59]"
              >
                Book Appointment
              </Link>

              <Link
                href="/doctors"
                className="mt-3 flex w-full items-center justify-center rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                View All Doctors
              </Link>
            </div>

            {doctor.schedule?.isActive && (
              <div className="mt-4 rounded-2xl bg-[#f0f8f1] p-6">
                <h3 className="font-semibold text-[#11136b]">
                  Appointments Available
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Check the doctor's available schedule when
                  booking your appointment.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}