import { PageHero } from "@/src/components/sections/PageHero";
import { ContactConnection } from "@/src/components/sections/contact/ContactConnection";
import { ContactAppointment } from "@/src/components/sections/contact/ContactAppointment";
import { ContactInfo } from "@/src/components/sections/contact/ContactInfo";
import { ContactBookingProvider } from "@/src/components/sections/contact/ContactBookingProvider";

export const metadata = {
  title: "Contact Us - Heal By Nature",
  description:
    "Get in touch with Heal By Nature for appointments, consultations, and inquiries.",
};

export default function ContactPage() {
  return (
    <main>
      <PageHero
        title="Get In Touch With Us"
        subtitle="Contact Us Now"
        description="Have questions about our homeopathic treatments? Our expert team is here to guide you with personalized care and natural healing solutions."
        backgroundImage="/images/ContactUsHero.png"
      />

      <ContactBookingProvider>
        <ContactConnection />

        <ContactAppointment />
      </ContactBookingProvider>

      <ContactInfo />
    </main>
  );
}