import Link from "next/link";
import { PageHero } from "@/src/components/sections/PageHero";
import { ONLINE_CONSULTATION } from "@/src/lib/constants";

function VideoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="5"
        width="14"
        height="14"
        rx="2"
      />
      <path d="m17 9 4-2v10l-4-2" />
    </svg>
  );
}

export const metadata = {
  title: "Online Consultation - Heal By Nature",
  description:
    "Book a secure online homeopathic consultation with Heal By Nature.",
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

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">

          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-[#10105c] md:text-4xl">
              How would you like to connect?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500 md:text-base">
              Choose your preferred platform for your online
              consultation. Your doctor will provide the
              required meeting details after your appointment
              is confirmed.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ONLINE_CONSULTATION.methods.map((method) => (
              <div
                key={method.id}
                className="rounded-[22px] border border-gray-200 bg-[#fafafa] p-6 text-center transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f7f1] text-[#3da449]">
                  <VideoIcon />
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#10105c]">
                  {method.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {method.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-[24px] bg-[#151568] px-6 py-10 text-center md:px-10">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Ready to speak with a specialist?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/70">
              Select your doctor, preferred date and time,
              and online consultation platform.
            </p>

            <Link
              href="/appointment?type=online"
              className="mt-6 inline-flex rounded-xl bg-[#3da449] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#328d3e]"
            >
              Book Online Consultation
            </Link>
          </div>

        </div>
      </section>

      <section className="bg-[#f8f8f7] py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4">

          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#10105c]">
              How Online Consultation Works
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              {
                number: "01",
                title: "Choose a Doctor",
                description:
                  "Select the specialist you would like to consult.",
              },
              {
                number: "02",
                title: "Choose Date & Time",
                description:
                  "Select an available appointment slot.",
              },
              {
                number: "03",
                title: "Choose Platform",
                description:
                  "Select LiveKit, Zoom or Google Meet.",
              },
              {
                number: "04",
                title: "Join Consultation",
                description:
                  "Use the meeting details provided after confirmation.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-2xl bg-white p-6"
              >
                <div className="text-sm font-bold text-[#3da449]">
                  {step.number}
                </div>

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