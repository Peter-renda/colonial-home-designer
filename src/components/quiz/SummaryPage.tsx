"use client";

import { ArchitecturalStyle, QuizAnswers } from "../../types/quiz";
import { QUIZ_SECTIONS } from "../../data/quizSections";
import StyleResultBadge from "./StyleResultBadge";

interface Props {
  recommendedStyle: ArchitecturalStyle;
  nonNegotiables: string[];
  budget: string;
  answers: QuizAnswers;
  onEdit: (sectionIndex: number) => void;
  onViewBOM: () => void;
}

const BUDGET_LABELS: Record<string, string> = {
  "under-400k": "Under $400K",
  "400k-600k": "$400K – $600K",
  "600k-800k": "$600K – $800K",
  "800k-1m": "$800K – $1M",
  "over-1m": "Over $1M",
};

const NON_NEG_LABELS: Record<string, string> = {
  firstFloorPrimary: "First Floor Primary",
  garage: "Garage",
  guestSuite: "Guest Suite",
  butlersPantry: "Butler's Pantry",
  bonusRoom: "Bonus Room",
};

export default function SummaryPage({
  recommendedStyle,
  nonNegotiables,
  budget,
  answers,
  onEdit,
  onViewBOM,
}: Props) {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">Summary</p>
        <h2 className="text-3xl font-light text-stone-800 mb-8">Your home, by the numbers.</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <StyleResultBadge style={recommendedStyle} />

          <div className="border border-stone-200 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-3">Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Budget</span>
                <span className="text-stone-800 font-medium">{BUDGET_LABELS[budget] ?? budget}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-stone-500 flex-shrink-0">Must-haves</span>
                <span className="text-stone-800 text-right">
                  {nonNegotiables.length === 0
                    ? "None selected"
                    : nonNegotiables.map((id) => NON_NEG_LABELS[id] ?? id).join(", ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          {QUIZ_SECTIONS.map((section, i) => {
            const sectionAnswers = section.questions
              .map((q) => ({ q, value: answers[q.id] }))
              .filter(({ value }) => value !== undefined && value !== "" && (Array.isArray(value) ? value.length > 0 : true));

            return (
              <div key={section.id} className="border border-stone-200 bg-white">
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                  <div>
                    <h3 className="font-medium text-stone-800 text-sm">{section.title}</h3>
                    {section.subtitle && (
                      <p className="text-xs text-stone-400">{section.subtitle}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onEdit(i)}
                    className="text-xs text-stone-400 hover:text-stone-600 uppercase tracking-wider transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="px-5 py-4">
                  {sectionAnswers.length === 0 ? (
                    <p className="text-xs text-stone-300 italic">No selections made</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                      {sectionAnswers.map(({ q, value }) => (
                        <div key={q.id} className="flex justify-between gap-2 text-xs">
                          <span className="text-stone-400 truncate max-w-[140px]">{q.label}</span>
                          <span className="text-stone-700 text-right">
                            {Array.isArray(value) ? value.join(", ") : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onViewBOM}
            className="bg-stone-800 text-white px-10 py-4 text-sm uppercase tracking-[0.15em] hover:bg-stone-700 transition-colors"
          >
            View Bill of Materials →
          </button>
        </div>
      </div>
    </div>
  );
}
