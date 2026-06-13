"use client";

import { useState } from "react";
import { ArchitecturalStyle, StyleScores } from "../../types/quiz";
import { ALL_STYLES, STYLE_PROFILES } from "../../data/styleProfiles";
import StyleHouseCard from "./StyleHouseCard";

interface Props {
  recommendedStyle: ArchitecturalStyle;
  scores: StyleScores;
  onContinue: () => void;
  onBack: () => void;
}

const HERO_PALETTE: Record<ArchitecturalStyle, "brick" | "white" | "cream"> = {
  Federal: "cream",
  Georgian: "brick",
  "Greek Revival": "white",
};

export default function StyleResultPage({ recommendedStyle, scores, onContinue, onBack }: Props) {
  const [active, setActive] = useState<ArchitecturalStyle>(recommendedStyle);
  const profile = STYLE_PROFILES[active];
  const isMatch = active === recommendedStyle;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* result headline */}
        <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">Your style</p>
        <h2 className="text-3xl sm:text-4xl font-light text-stone-800 mb-3 leading-tight">
          The homes you liked are <span className="font-normal">{recommendedStyle}</span>.
        </h2>
        <p className="text-stone-500 text-sm mb-8 max-w-2xl leading-relaxed">
          Based on the houses you were drawn to, your taste lines up most closely with the{" "}
          <strong className="text-stone-700">{recommendedStyle}</strong> style. Here&rsquo;s what
          defines it — and below, you can read about the other colonial styles too.
        </p>

        {/* explorer tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ALL_STYLES.map((s) => {
            const selected = s === active;
            return (
              <button
                key={s}
                onClick={() => setActive(s)}
                className={`px-4 py-2 text-sm border transition-colors flex items-center gap-2 ${
                  selected
                    ? "border-stone-800 bg-stone-800 text-white"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
                }`}
              >
                {s}
                {s === recommendedStyle && (
                  <span
                    className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                      selected ? "bg-white text-stone-800" : "bg-stone-800 text-white"
                    }`}
                  >
                    Your match
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* active style detail */}
        <div className="border border-stone-200 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="bg-[#eef2f5] border-b sm:border-b-0 sm:border-r border-stone-100">
              <StyleHouseCard style={active} palette={HERO_PALETTE[active]} className="w-full h-auto" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-2xl font-light text-stone-800">{profile.style}</h3>
                {isMatch && (
                  <span className="text-[10px] uppercase tracking-wider bg-stone-800 text-white px-2 py-1">
                    Your match
                  </span>
                )}
              </div>
              <p className="text-xs uppercase tracking-[0.15em] text-stone-400 mb-3">{profile.era}</p>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">{profile.summary}</p>
              <div className="border-l-2 border-stone-200 pl-3">
                <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">
                  How it feels to arrive
                </p>
                <p className="text-stone-600 text-sm leading-relaxed">{profile.approach}</p>
              </div>
            </div>
          </div>

          {/* key features */}
          <div className="border-t border-stone-100 p-6">
            <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-4">Key features</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {profile.keyFeatures.map((f) => (
                <div key={f.title} className="flex gap-3">
                  <span className="text-stone-300 mt-0.5">—</span>
                  <div>
                    <p className="text-sm font-medium text-stone-800">{f.title}</p>
                    <p className="text-xs text-stone-500 leading-relaxed">{f.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isMatch && (
          <p className="text-xs text-stone-400 mt-4">
            Prefer this one? You can keep exploring — your design will follow the{" "}
            <strong className="text-stone-600">{recommendedStyle}</strong> match, and you can change
            any individual detail as you go.
          </p>
        )}

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-stone-100">
          <button
            onClick={onBack}
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← Back to the houses
          </button>
          <button
            onClick={onContinue}
            className="bg-stone-800 text-white px-8 py-3 text-sm uppercase tracking-[0.15em] hover:bg-stone-700 transition-colors"
          >
            Continue with {recommendedStyle} →
          </button>
        </div>
      </div>
    </div>
  );
}
