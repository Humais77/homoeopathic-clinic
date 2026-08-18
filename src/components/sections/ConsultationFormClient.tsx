'use client';

import { useState } from 'react';
import { CONSULTATION } from '@/src/lib/constants';

export function ConsultationFormClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    treatment: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="w-full rounded-[20px] bg-[#43aa48] p-7 shadow-sm sm:rounded-[22px] sm:p-8 md:p-9 lg:p-10">
      <h2 className="text-xl font-medium text-white sm:text-2xl">
        Get Online Consultation
      </h2>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-[9px] font-semibold uppercase tracking-wider text-white/90"
            >
              {CONSULTATION.form.nameLabel}
            </label>

            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={CONSULTATION.form.namePlaceholder}
              className="h-11 w-full rounded-md border-0 bg-white/20 px-3 text-sm text-white outline-none placeholder:text-white/80 focus:bg-white/25 focus:ring-2 focus:ring-white/40"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[9px] font-semibold uppercase tracking-wider text-white/90"
            >
              {CONSULTATION.form.emailLabel}
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={CONSULTATION.form.emailPlaceholder}
              className="h-11 w-full rounded-md border-0 bg-white/20 px-3 text-sm text-white outline-none placeholder:text-white/80 focus:bg-white/25 focus:ring-2 focus:ring-white/40"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="treatment"
            className="mb-2 block text-[9px] font-semibold uppercase tracking-wider text-white/90"
          >
            {CONSULTATION.form.treatmentLabel}
          </label>

          <div className="relative">
            <select
              id="treatment"
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              className="h-11 w-full appearance-none rounded-md border-0 bg-white/20 px-3 pr-10 text-sm text-white outline-none focus:bg-white/25 focus:ring-2 focus:ring-white/40"
              required
            >
              <option value="" className="text-gray-700">
                Select Treatment
              </option>
              <option value="Hair Fall" className="text-gray-700">
                Hair Fall
              </option>
              <option value="Skin Issues" className="text-gray-700">
                Skin Issues
              </option>
              <option value="Digestive Problems" className="text-gray-700">
                Digestive Problems
              </option>
              <option value="Stress & Anxiety" className="text-gray-700">
                Stress & Anxiety
              </option>
              <option value="Chronic Conditions" className="text-gray-700">
                Chronic Conditions
              </option>
              <option value="Women's Health" className="text-gray-700">
                Women's Health
              </option>
              <option value="General Consultation" className="text-gray-700">
                General Consultation
              </option>
            </select>

            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white">
              ▾
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-[9px] font-semibold uppercase tracking-wider text-white/90"
          >
            {CONSULTATION.form.messageLabel}
          </label>

          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder={CONSULTATION.form.messagePlaceholder}
            rows={4}
            className="w-full resize-none rounded-md border-0 bg-white/20 px-3 py-3 text-sm text-white outline-none placeholder:text-white/80 focus:bg-white/25 focus:ring-2 focus:ring-white/40"
            required
          />
        </div>

        <button
          type="submit"
          className="h-11 w-full rounded-full bg-white px-6 text-sm font-bold tracking-wide text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-100 hover:shadow-md"
        >
          Send Inquiry
        </button>
      </form>
    </div>
  );
}