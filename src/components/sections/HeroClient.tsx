'use client';

import Image from 'next/image';
import Link from 'next/link';

export function HeroClient() {
  return (
    <section className="relative overflow-hidden from-white via-primary-50/30 to-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-12 py-12 lg:py-20">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              <span className="text-gray-900">Natural Healing.</span>
              <br />
              <span className="text-primary-600">Trusted Care.</span>
              <br />
              <span className="text-gray-900">Better Health.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Experience personalized homeopathic treatment tailored to your
              genetic blueprint. We blend traditional wisdom with modern science to
              restore your body's natural balance.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/appointment"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-primary-500/40 hover:scale-105"
              >
                Book Appointment
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3.5 bg-secondary-600 text-white font-semibold rounded-lg hover:bg-secondary-700 transition-all duration-200 shadow-lg hover:shadow-secondary-500/40 hover:scale-105"
              >
                Emergency Contact Us
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-8 justify-center lg:justify-start">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-gray-500 font-medium">Doctors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary-600">10+</div>
                <div className="text-sm text-gray-500 font-medium">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary-600">95%</div>
                <div className="text-sm text-gray-500 font-medium">Satisfaction Rate</div>
              </div>
            </div>

            {/* Badge */}
            <div className="mt-6 inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></span>
              Certified Homeopathic
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {/* Replace src with your image path */}
                <Image
                  src="/images/Hero-bg.png"
                  alt="Homoeopathic Doctor"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                  priority
                />
                
                {/* Decorative overlay */}
                <div className="absolute inset-0  from-black/10 to-transparent"></div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary-500/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl -z-10"></div>
    </section>
  );
}