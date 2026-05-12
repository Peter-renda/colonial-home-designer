"use client";

import { useState } from "react";

const BUDGET_OPTIONS = [
  { id: "under-400k", label: "Under $400K", description: "Builder grade finishes, efficient layout" },
  { id: "400k-600k", label: "$400K – $600K", description: "Quality finishes, selected upgrades" },
  { id: "600k-800k", label: "$600K – $800K", description: "Premium finishes throughout" },
  { id: "800k-1m", label: "$800K – $1M", description: "High-end materials and custom details" },
  { id: "over-1m", label: "Over $1M", description: "No compromises — fully custom" },
];

interface Props {
  onContinue: (budget: string) => void;
  onBack: () => void;
}

export default function BudgetStep({ onContinue, onBack }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">Budget</p>
          <h2 className="text-2xl sm:text-3xl font-light text-stone-800 mb-3">
            What's your total construction budget?
          </h2>
          <p className="text-stone-400 text-sm mb-8">
            This helps us flag tradeoffs as you make selections.
          </p>

          <div className="space-y-3 mb-10">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={`w-full text-left border p-5 transition-all ${
                  selected === opt.id
                    ? "border-stone-700 bg-stone-800 text-white"
                    : "border-stone-200 bg-white hover:border-stone-400"
                }`}
              >
                <p
                  className={`font-medium mb-0.5 ${
                    selected === opt.id ? "text-white" : "text-stone-800"
                  }`}
                >
                  {opt.label}
                </p>
                <p
                  className={`text-sm ${
                    selected === opt.id ? "text-stone-300" : "text-stone-400"
                  }`}
                >
                  {opt.description}
                </p>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => selected && onContinue(selected)}
              disabled={!selected}
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
