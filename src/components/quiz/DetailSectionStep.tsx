"use client";

import { QuizSection, QuizAnswers } from "../../types/quiz";
import { GROUP_LABELS } from "../../data/quizSections";
import SketchPanel from "./SketchPanel";

interface Props {
  section: QuizSection;
  sectionIndex: number;
  totalSections: number;
  groupIndex: number;
  groupTotal: number;
  answers: QuizAnswers;
  onChange: (id: string, value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function DetailSectionStep({
  section,
  sectionIndex,
  totalSections,
  groupIndex,
  groupTotal,
  answers,
  onChange,
  onNext,
  onBack,
}: Props) {
  const overallPct = Math.round(((sectionIndex + 1) / totalSections) * 100);

  function toggleMulti(id: string, option: string) {
    const current = (answers[id] as string[] | undefined) ?? [];
    const next = current.includes(option)
      ? current.filter((v) => v !== option)
      : [...current, option];
    onChange(id, next);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* sticky header */}
      <div className="sticky top-0 z-10 bg-stone-50 border-b border-stone-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-stone-400">
              {GROUP_LABELS[section.group]} · {groupIndex + 1} of {groupTotal}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-1 bg-stone-200 rounded-full">
              <div
                className="h-1 bg-stone-600 rounded-full transition-all duration-500"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <span className="text-xs text-stone-400">{overallPct}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT: Questions */}
          <div>
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-light text-stone-800">{section.title}</h2>
              {section.subtitle && (
                <p className="text-stone-400 text-sm mt-1">{section.subtitle}</p>
              )}
            </div>

            <div className="space-y-6">
              {section.questions.map((q) => {
                const value = answers[q.id];

                if (q.type === "multiselect") {
                  const selected = (value as string[] | undefined) ?? [];
                  return (
                    <div key={q.id}>
                      <p className="text-sm font-medium text-stone-700 mb-2">{q.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {(q.options ?? []).map((opt) => {
                          const active = selected.includes(opt);
                          return (
                            <button
                              key={opt}
                              onClick={() => toggleMulti(q.id, opt)}
                              className={`px-4 py-2 text-sm border transition-all ${
                                active
                                  ? "border-stone-700 bg-stone-800 text-white"
                                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (q.type === "text") {
                  return (
                    <div key={q.id}>
                      <label className="block text-sm font-medium text-stone-700 mb-1">{q.label}</label>
                      <input
                        type="text"
                        value={(value as string) ?? ""}
                        onChange={(e) => onChange(q.id, e.target.value)}
                        placeholder={q.placeholder ?? ""}
                        className="w-full border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 transition-colors"
                      />
                    </div>
                  );
                }

                // select
                return (
                  <div key={q.id}>
                    <label className="block text-sm font-medium text-stone-700 mb-1">{q.label}</label>
                    <select
                      value={(value as string) ?? ""}
                      onChange={(e) => onChange(q.id, e.target.value)}
                      className="w-full border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-stone-500 transition-colors appearance-none"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a8a29e' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                    >
                      <option value="">— Select —</option>
                      {(q.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-12 pt-6 border-t border-stone-100">
              <button
                onClick={onBack}
                className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={onNext}
                className="bg-stone-800 text-white px-8 py-3 text-sm uppercase tracking-[0.15em] hover:bg-stone-700 transition-colors"
              >
                {sectionIndex === totalSections - 1 ? "Finish →" : "Next →"}
              </button>
            </div>
          </div>

          {/* RIGHT: Sketch panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SketchPanel
              group={section.group}
              sectionId={section.id}
              sketchKey={section.sketchKey}
              answers={answers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
