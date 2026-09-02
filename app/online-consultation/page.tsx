import Link from "next/link";
import { PageHero } from "@/src/components/sections/PageHero";
import { ONLINE_CONSULTATION } from "@/src/lib/constants";

function VideoIcon() {
  return (
    <svg
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M15 10l4.5-2.5v9L15 14m-9 4h9a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

const steps = [
  {
    number: "01",
    title: "Choose Online Consultation",
    description:
      "Select online consultation as your preferred way to meet with our specialist.",
  },
  {
    number: "02",
    title: "Book Your Appointment",
    description:
      "Choose your specialist, preferred date and available time.",
  },
  {
    number: "03",
    title: "Choose Your Platform",
    description:
      "Select LiveKit, Zoom or Google Meet for your consultation.",
  },
  {
    number: "04",
    title: "Meet Your Specialist",
    description:
      "Once your appointment is confirmed, you will receive the required consultation details.",
  },
];

export const metadata = {
  title: "Online Consultation - Heal By Nature",
  description:
    "Learn about online consultations with Heal By Nature and choose your preferred video consultation platform.",
};

export default function OnlineConsultationPage() {
  return (
    <main>
      <PageHero
        title={ONLINE_CONSULTATION.title}
        subtitle={ONLINE_CONSULTATION.subtitle}
        description={ONLINE_CONSULTATION.description}
        backgroundImage="/images/ContactUsHero.png"
      />

      {/* Platforms */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-[#10105c] md:text-4xl">
              Choose Your Online Platform
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500 md:text-base">
              We offer several convenient options for
              online video consultations. Choose the
              platform that works best for you when
              booking your appointment.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ONLINE_CONSULTATION.methods.map(
              (method) => (
                <div
                  key={method.id}
                  className="rounded-[22px] border border-gray-200 bg-[#fafafa] p-6 text-center transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4f0] text-[#151568]">
                    <VideoIcon />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#10105c]">
                    {method.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {method.description}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#f8f8f7] py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#3da449]">
                Convenient & Flexible
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#10105c] md:text-4xl">
                Professional Care From Anywhere
              </h2>

              <p className="mt-5 text-sm leading-7 text-gray-600 md:text-base">
                Online consultation allows you to speak
                with our specialists without needing to
                travel to the clinic. Whether you are at
                home, at work, or somewhere else, you can
                connect with your specialist through a
                secure video consultation.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  "Convenient consultation from anywhere",
                  "Choose your preferred video platform",
                  "Personalized consultation with a specialist",
                  "Flexible appointment scheduling",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e8f4e9] text-[#3da449]">
                      <CheckIcon />
                    </span>

                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] bg-[#151568] p-7 text-white md:p-10">
              <h3 className="text-2xl font-bold">
                Ready to book your consultation?
              </h3>

              <p className="mt-4 text-sm leading-6 text-white/75">
                Continue to our appointment page to
                choose your specialist, date, time and
                preferred online platform.
              </p>

              <Link
                href="/appointment?type=online"
                className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#151568] transition hover:bg-gray-100"
              >
                Book Online Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-[#10105c] md:text-4xl">
              How Online Consultation Works
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              A simple process from booking to consultation.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <span className="text-sm font-bold text-[#3da449]">
                  {step.number}
                </span>

                <h3 className="mt-3 font-bold text-[#10105c]">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}