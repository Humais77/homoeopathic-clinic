import { PageHero } from "@/src/components/sections/PageHero";

export const metadata = {
  title: 'Treatments - Homoeopathic Clinic',
  description: 'Discover our comprehensive range of natural homeopathic treatments for various health conditions.',
};

export default function TreatmentsPage() {
  return (
    <main>
      {/* Page Hero Section */}
      <PageHero
        title="Discover Our Treatments"
        subtitle="Our Treatments"
        description="Explore our comprehensive range of personalized homeopathic treatments designed to address the root cause of illness, restore natural balance, and support long-term wellness."
        backgroundImage="/images/TreatmentHero.png"
      />

      {/* Treatments Content */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Our Homeopathic Treatments
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              At Heal By Nature, we offer a wide range of homeopathic treatments
              tailored to address various health conditions. Our approach focuses
              on treating the root cause of illness, not just the symptoms.
            </p>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Each treatment plan is customized to your unique constitutional type,
              genetic blueprint, and specific health needs. We combine traditional
              homeopathic wisdom with modern medical understanding.
            </p>

            <p className="text-lg text-gray-600 leading-relaxed">
              From acute conditions to chronic diseases, our experienced practitioners
              are here to guide you on your journey to better health through natural,
              safe, and effective homeopathic medicine.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}