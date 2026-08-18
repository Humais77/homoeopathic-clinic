"use client";

import { useState } from "react";

type ConnectionMethod = {
  id: string;
  title: string;
  description: string;
  type: string;
};

type Props = {
  methods: ConnectionMethod[];
};

function MethodIcon({ type }: { type: string }) {
  if (type === "phone") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.08 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
      </svg>
    );
  }

  if (type === "message") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    );
  }

  if (type === "users") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="14" height="14" rx="2" />
      <path d="m17 9 4-2v10l-4-2" />
    </svg>
  );
}

export function ContactConnectionClient({ methods }: Props) {
  const [selected, setSelected] = useState("zoom");

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-2">
      {methods.map((method) => {
        const isSelected = selected === method.id;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => setSelected(method.id)}
            className={`min-h-[142px] rounded-xl border px-3 py-4 text-center transition-all duration-200 md:min-h-[146px] ${
              isSelected
                ? "border-[#151568] bg-[#151568] text-white shadow-sm"
                : "border-gray-300 bg-white text-[#123c31] hover:border-[#151568]"
            }`}
          >
            <div
              className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                isSelected
                  ? "bg-white text-[#151568]"
                  : "bg-[#f6f6f9] text-[#151568]"
              }`}
            >
              <MethodIcon type={method.type} />
            </div>

            <h3 className="text-base font-semibold md:text-lg">
              {method.title}
            </h3>

            <p
              className={`mt-1 text-[10px] leading-4 md:text-xs ${
                isSelected ? "text-white/75" : "text-gray-500"
              }`}
            >
              {method.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}