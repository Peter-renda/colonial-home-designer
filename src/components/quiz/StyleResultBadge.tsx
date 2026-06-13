"use client";

import { ArchitecturalStyle } from "../../types/quiz";
import { STYLE_PROFILES } from "../../data/styleProfiles";

interface Props {
  style: ArchitecturalStyle;
  compact?: boolean;
}

export default function StyleResultBadge({ style, compact }: Props) {
  const profile = STYLE_PROFILES[style];
  const info = { tagline: profile.tagline, traits: profile.keyFeatures.slice(0, 4).map((f) => f.title) };

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-stone-500">
        <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
        {style}
      </span>
    );
  }

  return (
    <div className="border border-stone-200 bg-white p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-1">Recommended Style</p>
      <h3 className="text-2xl font-light text-stone-800 mb-2">{style}</h3>
      <p className="text-stone-500 text-sm mb-4">{info.tagline}</p>
      <ul className="space-y-1">
        {info.traits.map((t) => (
          <li key={t} className="text-sm text-stone-400 flex items-center gap-2">
            <span className="text-stone-300">—</span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
