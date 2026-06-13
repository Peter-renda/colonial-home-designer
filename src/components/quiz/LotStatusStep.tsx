"use client";

import { useState } from "react";

interface Props {
  initial?: boolean | null;
  onContinue: (hasLot: boolean) => void;
  onBack: () => void;
}

const OPTIONS: { id: "yes" | "no"; value: boolean; label: string; description: string }[] = [
  {
    id: "yes",
    value: true,
    label: "Yes, I've bought my lot",
    description: "We'll analyze your site — orientation, sun path, slope, and drainage — and design the home to fit the land.",
  },
  {
    id: "no",
    value: false,
    label: "Not yet",
    description: "No problem — we'll skip the site questions for now and focus on the home itself. You can add your lot later.",
  },
];

export default function LotStatusStep({ initial = null, onContinue, onBack }: Props) {
  const [selected, setSelected] = useState<boolean | null>(initial);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">Your land</p>
          <h2 className="text-2xl sm:text-3xl font-light text-stone-800 mb-3">
            Have you purchased your lot?
          </h2>
          <p className="text-stone-400 text-sm mb-8">
            If you have land, we&rsquo;ll study how the house should sit on it. If not, we&rsquo;ll
            jump straight to designing the home.
          </p>

          <div className="space-y-3 mb-10">
            {OPTIONS.map((opt) => {
              const active = selected === opt.value;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelected(opt.value)}
                  className={`w-full text-left border p-5 transition-all ${
                    active ? "border-stone-700 bg-stone-800 text-white" : "border-stone-200 bg-white hover:border-stone-400"
                  }`}
                >
                  <p className={`font-medium mb-0.5 ${active ? "text-white" : "text-stone-800"}`}>
                    {opt.label}
                  </p>
                  <p className={`text-sm ${active ? "text-stone-300" : "text-stone-400"}`}>
                    {opt.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => selected !== null && onContinue(selected)}
              disabled={selected === null}
              className="bg-stone-800 text-white px-8 py-3 text-sm uppercase tracking-[0.15em] hover:bg-stone-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
