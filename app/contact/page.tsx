import { PageHero } from "@/src/components/sections/PageHero";
import { ContactInfo } from "@/src/components/sections/contact/ContactInfo";
import { CONTACT_INFO } from "@/src/lib/constants";

export const metadata = {
  title: "Contact Us - Heal By Nature",
  description:
    "Contact Heal By Nature for clinic information, directions, phone, WhatsApp and email.",
};

export default function ContactPage() {
  return (
    <main>
      <PageHero
        title="Get In Touch With Us"
        subtitle="Contact Us"
        description="Have questions about our homeopathic treatments? Our team is here to guide you with personalized care and natural healing solutions."
        backgroundImage="/images/ContactUsHero.png"
      />

      <ContactInfo />

      <section className="bg-white px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">

          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#10105c] md:text-4xl">
              Visit Our Clinic
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              Our clinic is available for personalized
              in-person consultations with our specialists.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl bg-[#f8f8f7] p-6">
              <h3 className="font-bold text-[#10105c]">
                Clinic Address
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {CONTACT_INFO.location.details}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8f8f7] p-6">
              <h3 className="font-bold text-[#10105c]">
                WhatsApp
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {CONTACT_INFO.whatsapp.details}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8f8f7] p-6">
              <h3 className="font-bold text-[#10105c]">
                Email
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {CONTACT_INFO.email.details}
              </p>
            </div>

          </div>

        </div>
      </section>
    </main>
  );
}