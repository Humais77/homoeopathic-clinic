import { PageHero } from "@/src/components/sections/PageHero";

export const metadata = {
  title: 'About Us - Homoeopathic Clinic',
  description:
    'Learn about Heal By Nature, our mission, and our commitment to personalized homeopathic care.',
};

export default function AboutPage() {
  return (
    <main>

      {/* Page Hero Section */}
      <PageHero
        title="About Heal By Nature"
        subtitle="About Us"
        description="Heal By Nature is dedicated to providing personalized homeopathic care that focuses on treating the root cause rather than just the symptoms."
        backgroundImage="/images/AboutUsHero.png"
      />

      {/* About Content */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-4xl mx-auto">

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Welcome to Heal By Nature
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              At Heal By Nature, we believe in the power of natural healing.
              Our clinic is dedicated to providing personalized homeopathic
              care that addresses the root cause of health issues, not just
              the symptoms.
            </p>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              With years of experience and a deep understanding of homeopathic
              principles, our team of expert practitioners is committed to
              helping you achieve optimal health and wellness through natural,
              safe, and effective treatments.
            </p>

            <p className="text-lg text-gray-600 leading-relaxed">
              We combine traditional wisdom with modern medical knowledge to
              create personalized treatment plans tailored to your unique
              genetic blueprint and health needs.
            </p>

          </div>
        </div>
      </section>

    </main>
  );
}

