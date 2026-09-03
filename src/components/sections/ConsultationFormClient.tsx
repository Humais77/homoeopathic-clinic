'use client';

import { useState, useEffect } from 'react';
import { CONSULTATION } from '@/src/lib/constants';

interface Treatment {
  id: string;
  name: string;
}

export function ConsultationFormClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    treatmentId: '',
    message: '',
  });

  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTreatments = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/treatments', {
          cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Failed to load treatments'
          );
        }

        setTreatments(data.treatments ?? []);
      } catch (error) {
        console.error('Error fetching treatments:', error);
        setError('Unable to load treatments.');
      } finally {
        setLoading(false);
      }
    };

    fetchTreatments();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to submit consultation'
        );
      }

      setSuccess(true);

      setFormData({
        name: '',
        email: '',
        phone: '',
        treatmentId: '',
        message: '',
      });

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Something went wrong'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-[20px] bg-[#43aa48] p-7 shadow-sm sm:rounded-[22px] sm:p-8 md:p-9 lg:p-10">
      <h2 className="text-xl font-medium text-white sm:text-2xl">
        Get Online Consultation
      </h2>

      {success && (
        <div className="mt-4 rounded-lg bg-white/20 p-3 text-sm text-white">
          ✅ Consultation request submitted successfully!
          We&apos;ll contact you soon.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-500/20 p-3 text-sm text-white">
          ❌ {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-7 space-y-5"
      >
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
              disabled={submitting}
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
              disabled={submitting}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-[9px] font-semibold uppercase tracking-wider text-white/90"
          >
            Phone Number
          </label>

          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="h-11 w-full rounded-md border-0 bg-white/20 px-3 text-sm text-white outline-none placeholder:text-white/80 focus:bg-white/25 focus:ring-2 focus:ring-white/40"
            required
            disabled={submitting}
          />
        </div>

        <div>
          <label
            htmlFor="treatmentId"
            className="mb-2 block text-[9px] font-semibold uppercase tracking-wider text-white/90"
          >
            {CONSULTATION.form.treatmentLabel}
          </label>

          <div className="relative">
            <select
              id="treatmentId"
              name="treatmentId"
              value={formData.treatmentId}
              onChange={handleChange}
              className="h-11 w-full appearance-none rounded-md border-0 bg-white/20 px-3 pr-10 text-sm text-white outline-none focus:bg-white/25 focus:ring-2 focus:ring-white/40 disabled:opacity-50"
              required
              disabled={submitting || loading}
            >
              <option
                value=""
                className="text-gray-700"
              >
                {loading
                  ? 'Loading treatments...'
                  : 'Select Treatment'}
              </option>

              {treatments.map((treatment) => (
                <option
                  key={treatment.id}
                  value={treatment.id}
                  className="text-gray-700"
                >
                  {treatment.name}
                </option>
              ))}
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
            className="w-full resize-none rounded-md border-0 bg-white/20 px-3 py-3 text-sm text-white outline-none placeholder:text-white/80 focus:bg-white/25 focus:ring-2 focus:ring-white/40 disabled:opacity-50"
            required
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || loading}
          className="h-11 w-full rounded-full bg-white px-6 text-sm font-bold tracking-wide text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? 'Submitting...'
            : CONSULTATION.form.buttonText}
        </button>
      </form>
    </div>
  );
}