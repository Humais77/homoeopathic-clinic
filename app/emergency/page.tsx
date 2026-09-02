import Link from "next/link";
import { PageHero } from "@/src/components/sections/PageHero";
import { EMERGENCY_CONTACT } from "@/src/lib/constants";

export const metadata = {
  title: "Emergency Contact - Heal By Nature",
  description:
    "Contact Heal By Nature directly for urgent assistance.",
};

export default function EmergencyPage() {
  return (
    <main>
      <PageHero
        title={EMERGENCY_CONTACT.title}
        subtitle={EMERGENCY_CONTACT.subtitle}
        description={EMERGENCY_CONTACT.description}
        backgroundImage="/images/ContactUsHero.png"
      />

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4">

          <div className="grid gap-6 md:grid-cols-2">

            <a
              href={`tel:${EMERGENCY_CONTACT.phone.number}`}
              className="rounded-[24px] border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-[#3da449]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
                </svg>
              </div>

              <h2 className="mt-5 text-xl font-bold text-[#10105c]">
                {EMERGENCY_CONTACT.phone.label}
              </h2>

              <p className="mt-2 text-gray-500">
                {EMERGENCY_CONTACT.phone.display}
              </p>

              <span className="mt-5 inline-flex rounded-xl bg-[#3da449] px-6 py-3 text-sm font-bold text-white">
                Call Now
              </span>
            </a>

            <a
              href={`https://wa.me/${EMERGENCY_CONTACT.whatsapp.number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[24px] border border-gray-200 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-[#3da449]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.4 8.4 0 0 1-4.1-1.06L4 20l1.1-4.1A8.4 8.4 0 1 1 21 11.5Z" />
                  <path d="M8.5 8.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.2.1.4-.1.6l-.5.6c.6 1.1 1.5 2 2.6 2.6l.6-.5c.2-.2.4-.2.6-.1l1.4.6c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.4.2-1.4.4-2.5-.1-1.1-.5-2.3-1.3-3.3-2.3-1-1-1.8-2.2-2.3-3.3-.5-1.1-.3-2.1-.1-2.5Z" />
                </svg>
              </div>

              <h2 className="mt-5 text-xl font-bold text-[#10105c]">
                {EMERGENCY_CONTACT.whatsapp.label}
              </h2>

              <p className="mt-2 text-gray-500">
                {EMERGENCY_CONTACT.whatsapp.display}
              </p>

              <span className="mt-5 inline-flex rounded-xl bg-[#3da449] px-6 py-3 text-sm font-bold text-white">
                WhatsApp Now
              </span>
            </a>

          </div>

          <div className="mt-10 rounded-2xl bg-amber-50 p-6 text-center">
            <h3 className="font-bold text-gray-800">
              Important
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              For life-threatening emergencies, please contact
              your local emergency medical services immediately.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/appointment"
              className="text-sm font-semibold text-[#151568] hover:underline"
            >
              Need a regular consultation? Book an appointment →
            </Link>
          </div>

        </div>
      </section>
    </main>
  );
}