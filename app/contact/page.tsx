import { PageHero } from "@/src/components/sections/PageHero";

export const metadata = {
  title: 'Contact Us - Homoeopathic Clinic',
  description: 'Get in touch with Heal By Nature for appointments, consultations, and inquiries.',
};

export default function ContactPage() {
  return (
    <main>
      {/* Page Hero Section */}
      <PageHero
        title="Get In Touch With Us"
        subtitle="Contact Us Now"
        description="Have questions about our homeopathic treatments? Our expert team is here to guide you with personalized care and natural healing solutions."
        backgroundImage="/images/ContactUsHero.png"
      />

      {/* Contact Content */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Get in Touch
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              We're here to help you on your journey to better health. Whether
              you have questions about our treatments, want to schedule an
              appointment, or need more information about homeopathy.
            </p>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Our friendly team is ready to assist you. You can reach us through
              phone, email, or visit our clinic during working hours.
            </p>

            <p className="text-lg text-gray-600 leading-relaxed">
              We look forward to hearing from you and supporting your health
              and wellness goals through natural homeopathic care.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}