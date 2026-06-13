"use client";

import { useState } from "react";
import { ArchitecturalStyle, StyleScores } from "../../types/quiz";
import StyleHouseCard from "./StyleHouseCard";

/**
 * Picture-based style finder. The buyer is shown a gallery of colonial homes
 * and simply taps the ones they're drawn to. We tally the styles behind their
 * favorites to recommend a style — no jargon required.
 */

interface GalleryHouse {
  id: string;
  style: ArchitecturalStyle;
  palette: keyof typeof PALETTE_KEYS;
}

// just a typing helper so palette keys stay in sync with StyleHouseCard
const PALETTE_KEYS = { brick: 1, white: 1, cream: 1 } as const;

// Interleaved so styles aren't visually grouped.
const GALLERY: GalleryHouse[] = [
  { id: "g1", style: "Georgian", palette: "brick" },
  { id: "f1", style: "Federal", palette: "white" },
  { id: "k1", style: "Greek Revival", palette: "white" },
  { id: "f2", style: "Federal", palette: "cream" },
  { id: "k2", style: "Greek Revival", palette: "cream" },
  { id: "g2", style: "Georgian", palette: "white" },
];

function computeRecommendation(
  selectedIds: string[]
): { style: ArchitecturalStyle; scores: StyleScores } {
  const scores: StyleScores = { Federal: 0, Georgian: 0, "Greek Revival": 0 };
  const firstSeen: Record<ArchitecturalStyle, number> = {
    Federal: Infinity,
    Georgian: Infinity,
    "Greek Revival": Infinity,
  };
  selectedIds.forEach((id, order) => {
    const house = GALLERY.find((h) => h.id === id);
    if (!house) return;
    scores[house.style]++;
    firstSeen[house.style] = Math.min(firstSeen[house.style], order);
  });

  const styles = Object.keys(scores) as ArchitecturalStyle[];
  let best = styles[0];
  for (const s of styles) {
    if (
      scores[s] > scores[best] ||
      (scores[s] === scores[best] && firstSeen[s] < firstSeen[best])
    ) {
      best = s;
    }
  }
  return { style: best, scores };
}

interface Props {
  onComplete: (recommended: ArchitecturalStyle, scores: StyleScores) => void;
  onBack: () => void;
}

export default function StyleQuizStep({ onComplete, onBack }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function finish() {
    if (selected.length === 0) return;
    const { style, scores } = computeRecommendation(selected);
    onComplete(style, scores);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">Find your style</p>
        <h2 className="text-2xl sm:text-3xl font-light text-stone-800 mb-3">
          Which of these homes draws you in?
        </h2>
        <p className="text-stone-400 text-sm mb-8 max-w-xl">
          Tap every house you find yourself drawn to — pick as many as you like. We&rsquo;ll match
          your favorites to an architectural style.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {GALLERY.map((house) => {
            const active = selected.includes(house.id);
            return (
              <button
                key={house.id}
                onClick={() => toggle(house.id)}
                className={`group relative text-left border-2 bg-white overflow-hidden transition-all ${
                  active
                    ? "border-stone-800 shadow-md"
                    : "border-stone-200 hover:border-stone-400 hover:shadow-sm"
                }`}
              >
                <StyleHouseCard style={house.style} palette={house.palette} className="w-full h-auto block" />
                {/* selection check */}
                <div
                  className={`absolute top-3 right-3 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    active ? "border-stone-800 bg-stone-800" : "border-stone-300 bg-white/80"
                  }`}
                >
                  {active && (
                    <svg className="w-4 h-4 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-stone-100">
                  <p className="text-xs uppercase tracking-[0.15em] text-stone-400 group-hover:text-stone-600 transition-colors">
                    {active ? "Liked ✓" : "Tap if you like it"}
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
          <div className="flex items-center gap-4">
            <span className="text-xs text-stone-400">
              {selected.length === 0
                ? "Select at least one"
                : `${selected.length} selected`}
            </span>
            <button
              onClick={finish}
              disabled={selected.length === 0}
              className="bg-stone-800 text-white px-8 py-3 text-sm uppercase tracking-[0.15em] hover:bg-stone-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              See my style →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
