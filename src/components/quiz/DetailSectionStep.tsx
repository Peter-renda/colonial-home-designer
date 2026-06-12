"use client";

import { useEffect, useRef, useState } from "react";
import { QuizSection, QuizAnswers, QuizQuestion } from "../../types/quiz";
import { GROUP_LABELS, isQuestionVisible } from "../../data/quizSections";
import { QUESTION_INFO } from "../../data/questionInfo";
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

/** "i" icon + popover with a short educational blurb about the item. */
function InfoTip({ questionId, label }: { questionId: string; label: string }) {
  const blurb = QUESTION_INFO[questionId];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  if (!blurb) return null;

  return (
    <span ref={ref} className="relative inline-block align-middle">
      <button
        type="button"
        aria-label={`About ${label}`}
        onClick={() => setOpen(true)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-serif italic leading-none transition-colors ${
          open
            ? "border-stone-600 bg-stone-700 text-white"
            : "border-stone-300 text-stone-400 hover:border-stone-500 hover:text-stone-600"
        }`}
      >
        i
      </button>
      {open && (
        <span className="absolute left-1/2 top-full z-30 mt-2 block w-72 -translate-x-1/2 border border-stone-200 bg-white p-3 text-xs font-normal normal-case leading-relaxed text-stone-600 shadow-lg">
          <span className="block mb-1 text-[10px] uppercase tracking-[0.15em] text-stone-400">
            {label}
          </span>
          {blurb}
        </span>
      )}
    </span>
  );
}

function FileUpload({
  q,
  value,
  onChange,
}: {
  q: QuizQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={q.accept ?? "image/*"}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value ? (
        <div className="border border-stone-200 bg-white p-3 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded topo map"
            className="h-20 w-20 object-cover border border-stone-100"
          />
          <div className="flex-1 text-xs text-stone-500">
            Map uploaded — it&rsquo;s draped over the 3D terrain on the right.
          </div>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-stone-500 hover:text-stone-700 underline underline-offset-2"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border border-dashed border-stone-300 bg-white px-4 py-6 text-sm text-stone-400 hover:border-stone-500 hover:text-stone-600 transition-colors"
        >
          <span className="block text-2xl mb-1">⛰</span>
          Click to upload a topo map, plat, or survey image
          <span className="block text-xs text-stone-300 mt-1">PNG or JPG — county GIS screenshots work great</span>
        </button>
      )}
    </div>
  );
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
  const visibleQuestions = section.questions.filter((q) => isQuestionVisible(q, answers));
  const hiddenCount = section.questions.length - visibleQuestions.length;

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
              {visibleQuestions.map((q) => {
                const value = answers[q.id];

                if (q.type === "file") {
                  return (
                    <div key={q.id}>
                      <p className="text-sm font-medium text-stone-700 mb-2">
                        {q.label}
                        <InfoTip questionId={q.id} label={q.label} />
                      </p>
                      <FileUpload
                        q={q}
                        value={(value as string) ?? ""}
                        onChange={(v) => onChange(q.id, v)}
                      />
                    </div>
                  );
                }

                if (q.type === "multiselect") {
                  const selected = (value as string[] | undefined) ?? [];
                  return (
                    <div key={q.id}>
                      <p className="text-sm font-medium text-stone-700 mb-2">
                        {q.label}
                        <InfoTip questionId={q.id} label={q.label} />
                      </p>
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
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        {q.label}
                        <InfoTip questionId={q.id} label={q.label} />
                      </label>
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
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      {q.label}
                      <InfoTip questionId={q.id} label={q.label} />
                    </label>
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

            {hiddenCount > 0 && (
              <p className="mt-6 text-xs text-stone-300 italic">
                {hiddenCount} question{hiddenCount > 1 ? "s" : ""} hidden — not applicable to your
                selections.
              </p>
            )}

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
