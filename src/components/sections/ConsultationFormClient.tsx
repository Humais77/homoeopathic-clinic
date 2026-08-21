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
    treatment: '',
    message: '',
  });
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch treatments from database
  useEffect(() => {
    const fetchTreatments = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/treatments');
        const data = await response.json();
        if (response.ok) {
          setTreatments(data.treatments);
        } else {
          console.error('Failed to fetch treatments:', data.error);
        }
      } catch (error) {
        console.error('Error fetching treatments:', error);
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        treatment: '',
        message: '',
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-[20px] bg-[#43aa48] p-7 shadow-sm sm:rounded-[22px] sm:p-8 md:p-9 lg:p-10">
      <h2 className="text-xl font-medium text-white sm:text-2xl">
        Get Online Consultation
      </h2>

      {/* Success Message */}
      {success && (
        <div className="mt-4 rounded-lg bg-white/20 p-3 text-sm text-white">
          ✅ Consultation request submitted successfully! We'll contact you soon.
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-500/20 p-3 text-sm text-white">
          ❌ {error}
        </div>
      )}

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
              className="h-11 w-full appearance-none rounded-md border-0 bg-white/20 px-3 pr-10 text-sm text-white outline-none focus:bg-white/25 focus:ring-2 focus:ring-white/40 disabled:opacity-50"
              required
              disabled={submitting || loading}
            >
              <option value="" className="text-gray-700">
                {loading ? 'Loading treatments...' : 'Select Treatment'}
              </option>
              {treatments.map((treatment) => (
                <option key={treatment.id} value={treatment.name} className="text-gray-700">
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
          className="h-11 w-full rounded-full bg-white px-6 text-sm font-bold tracking-wide text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-100 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : CONSULTATION.form.buttonText}
        </button>
      </form>
    </div>
  );
}