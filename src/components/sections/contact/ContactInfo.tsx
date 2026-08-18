import { CONTACT_INFO } from "@/src/lib/constants";

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function ContactInfo() {
  return (
    <section className="bg-white py-6">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 md:grid-cols-3">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3faf3] text-[#3da449]">
            <LocationIcon />
          </div>

          <div>
            <p className="text-xs font-medium text-[#3da449]">
              {CONTACT_INFO.location.label}
            </p>

            <p className="text-xs font-bold text-gray-700">
              {CONTACT_INFO.location.details}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3faf3] text-[#3da449]">
            <MessageIcon />
          </div>

          <div>
            <p className="text-xs font-medium text-[#3da449]">
              {CONTACT_INFO.whatsapp.label}
            </p>

            <p className="text-xs font-bold text-gray-700">
              {CONTACT_INFO.whatsapp.details}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3faf3] text-[#3da449]">
            <EmailIcon />
          </div>

          <div>
            <p className="text-xs font-medium text-[#3da449]">
              {CONTACT_INFO.email.label}
            </p>

            <p className="text-xs font-bold text-gray-700">
              {CONTACT_INFO.email.details}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}