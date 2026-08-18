import { PageHero } from "@/src/components/sections/PageHero";

export const metadata = {
  title: 'Our Doctors - Homoeopathic Clinic',
  description: 'Meet our team of highly qualified and experienced homeopathic doctors.',
};

export default function DoctorsPage() {
  return (
    <main>
      {/* Page Hero Section */}
      <PageHero
        title="Meet Our Specialists"
        subtitle="Doctors & Pharmacies"
        description="From expert consultations to genuine homeopathic medicines, we provide everything you need to support your journey toward better health."
        backgroundImage="/images/DoctorsHero.png"
      />

      {/* Doctors Content */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Expert Homeopathic Practitioners
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Our team of doctors brings together decades of clinical experience
              and deep expertise in homeopathic medicine. Each practitioner is
              dedicated to providing personalized care that addresses your
              unique health needs.
            </p>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              We believe in a collaborative approach to healthcare. Our doctors
              work closely with you to understand your health concerns, medical
              history, and lifestyle to create effective treatment plans.
            </p>

            <p className="text-lg text-gray-600 leading-relaxed">
              Committed to continuous learning and staying updated with the latest
              developments in homeopathy, our practitioners ensure you receive
              the highest quality care.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}