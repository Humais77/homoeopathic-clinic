import { ConsultationForm } from './ConsultationForm';
import { ConsultationInfo } from './ConsultationInfo';

export function ConsultationSection() {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <ConsultationForm />
          <ConsultationInfo />
        </div>
      </div>
    </section>
  );
}