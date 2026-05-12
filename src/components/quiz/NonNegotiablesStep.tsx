"use client";

import { useState } from "react";

const OPTIONS = [
  {
    id: "firstFloorPrimary",
    label: "First Floor Primary",
    description: "Primary bedroom and bath on the main level",
  },
  {
    id: "garage",
    label: "Garage",
    description: "At least a two-car garage",
  },
  {
    id: "guestSuite",
    label: "Guest Suite",
    description: "Private bedroom and full bath for guests",
  },
  {
    id: "butlersPantry",
    label: "Butler's Pantry",
    description: "Dedicated pantry/staging space between kitchen and dining",
  },
  {
    id: "bonusRoom",
    label: "Bonus Room",
    description: "Flexible extra space — media room, playroom, or office",
  },
];

interface Props {
  onContinue: (selected: string[]) => void;
  onBack: () => void;
}

export default function NonNegotiablesStep({ onContinue, onBack }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">Must-haves</p>
          <h2 className="text-2xl sm:text-3xl font-light text-stone-800 mb-3">
            What are your non-negotiables?
          </h2>
          <p className="text-stone-400 text-sm mb-8">Select everything that's a must for your home.</p>

          <div className="space-y-3 mb-10">
            {OPTIONS.map((opt) => {
              const checked = selected.has(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggle(opt.id)}
                  className={`w-full text-left border p-5 transition-all flex items-start gap-4 ${
                    checked
                      ? "border-stone-700 bg-stone-800 text-white"
                      : "border-stone-200 bg-white hover:border-stone-400"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      checked ? "border-white bg-white" : "border-stone-300"
                    }`}
                  >
                    {checked && (
                      <svg className="w-3 h-3 text-stone-800" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className={`font-medium mb-0.5 ${checked ? "text-white" : "text-stone-800"}`}>
                      {opt.label}
                    </p>
                    <p className={`text-sm ${checked ? "text-stone-300" : "text-stone-400"}`}>
                      {opt.description}
                    </p>
                  </div>
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
              onClick={() => onContinue(Array.from(selected))}
              className="bg-stone-800 text-white px-8 py-3 text-sm uppercase tracking-[0.15em] hover:bg-stone-700 transition-colors"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
