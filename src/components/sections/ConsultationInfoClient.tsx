'use client';

import { CONSULTATION } from '@/src/lib/constants';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

export function ConsultationInfoClient() {
  return (
    <div className="w-full">
      <h3 className="text-3xl font-bold leading-tight text-[#43a94b] sm:text-4xl">
        Reach Us Now
      </h3>

      <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
        {CONSULTATION.info.description}
      </p>

      <div className="mt-8 space-y-6 sm:mt-9 sm:space-y-7">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f9f3] text-[#43a94b]">
            <MapPin className="h-5 w-5" strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#43a94b]">
              {CONSULTATION.info.address.label}
            </p>

            <p className="mt-0.5 text-sm font-semibold leading-relaxed text-gray-700 sm:text-[15px]">
              {CONSULTATION.info.address.details}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f9f3] text-[#43a94b]">
            <Phone className="h-5 w-5" strokeWidth={2} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#43a94b]">
              {CONSULTATION.info.phone.label}
            </p>

            <div className="mt-0.5 space-y-0.5">
              {CONSULTATION.info.phone.numbers.map((number, index) => (
                <p
                  key={index}
                  className="text-sm font-semibold leading-relaxed text-gray-700 sm:text-[15px]"
                >
                  {number}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f9f3] text-[#43a94b]">
            <Mail className="h-5 w-5" strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#43a94b]">
              {CONSULTATION.info.email.label}
            </p>

            <p className="mt-0.5 break-words text-sm font-semibold text-gray-700 sm:text-[15px]">
              {CONSULTATION.info.email.address}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f9f3] text-[#43a94b]">
            <MessageCircle className="h-5 w-5" strokeWidth={2} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#43a94b]">
              {CONSULTATION.info.whatsapp.label}
            </p>

            <p className="mt-0.5 text-sm font-semibold text-gray-700 sm:text-[15px]">
              {CONSULTATION.info.whatsapp.number}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}