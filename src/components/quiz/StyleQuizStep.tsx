"use client";

import { useState } from "react";
import { ArchitecturalStyle, StyleScores } from "../../types/quiz";

interface StyleQuestion {
  question: string;
  options: { label: string; description: string; style: ArchitecturalStyle }[];
}

const STYLE_QUESTIONS: StyleQuestion[] = [
  {
    question: "How do you want guests to feel when they approach your home?",
    options: [
      {
        label: "Refined elegance",
        description: "Understated, sophisticated, and quietly impressive",
        style: "Federal",
      },
      {
        label: "Classic formality",
        description: "Proper, symmetrical, and timelessly traditional",
        style: "Georgian",
      },
      {
        label: "Grand presence",
        description: "Dramatic, imposing, and inspired by ancient temples",
        style: "Greek Revival",
      },
    ],
  },
  {
    question: "Which exterior features draw you most?",
    options: [
      {
        label: "Elliptical fanlights & delicate moldings",
        description: "Graceful Adam-style details and slender proportions",
        style: "Federal",
      },
      {
        label: "Keystones & paired chimneys",
        description: "Bold brick facades with symmetrical, formal composition",
        style: "Georgian",
      },
      {
        label: "Columned portico & wide pediment",
        description: "Full columns across the front with a classical frieze",
        style: "Greek Revival",
      },
    ],
  },
  {
    question: "How would you describe your ideal interior aesthetic?",
    options: [
      {
        label: "Light & airy with plasterwork accents",
        description: "Oval rooms, delicate cornices, and pale color palettes",
        style: "Federal",
      },
      {
        label: "Rich woodwork & formal rooms",
        description: "Mahogany paneling, traditional symmetry, and bold fireplaces",
        style: "Georgian",
      },
      {
        label: "Columned halls & classical proportions",
        description: "Bold friezes, wide doorways, and monumental scale",
        style: "Greek Revival",
      },
    ],
  },
  {
    question: "Choose your ideal front door treatment:",
    options: [
      {
        label: "Slender sidelights with an elliptical fanlight",
        description: "Graceful, balanced, and quietly distinctive",
        style: "Federal",
      },
      {
        label: "Formal paneled door flanked by pilasters",
        description: "Classical columns with a broken pediment above",
        style: "Georgian",
      },
      {
        label: "Massive door under a broad entablature",
        description: "Tall columns on either side, pediment crowning the entry",
        style: "Greek Revival",
      },
    ],
  },
  {
    question: "Which exterior color palette resonates most?",
    options: [
      {
        label: "Soft whites & warm creams",
        description: "Pale, refined tones with subtle contrast",
        style: "Federal",
      },
      {
        label: "Warm brick with crisp white trim",
        description: "Classic American colonial warmth",
        style: "Georgian",
      },
      {
        label: "Bold white with strong shadow lines",
        description: "Striking contrast that emphasizes monumental form",
        style: "Greek Revival",
      },
    ],
  },
];

function computeRecommendation(scores: StyleScores): ArchitecturalStyle {
  const entries = Object.entries(scores) as [ArchitecturalStyle, number][];
  return entries.reduce((best, curr) => (curr[1] > best[1] ? curr : best))[0];
}

interface Props {
  onComplete: (recommended: ArchitecturalStyle, scores: StyleScores) => void;
  onBack: () => void;
}

export default function StyleQuizStep({ onComplete, onBack }: Props) {
  const [answers, setAnswers] = useState<Record<number, ArchitecturalStyle>>({});
  const currentIndex = Object.keys(answers).length;
  const isComplete = currentIndex >= STYLE_QUESTIONS.length;

  function selectOption(style: ArchitecturalStyle) {
    const next = { ...answers, [currentIndex]: style };
    setAnswers(next);

    if (currentIndex === STYLE_QUESTIONS.length - 1) {
      const scores: StyleScores = { Federal: 0, Georgian: 0, "Greek Revival": 0 };
      Object.values(next).forEach((s) => { scores[s]++; });
      setTimeout(() => onComplete(computeRecommendation(scores), scores), 300);
    }
  }

  function goBack() {
    if (currentIndex === 0) {
      onBack();
    } else {
      const prev = { ...answers };
      delete prev[currentIndex - 1];
      setAnswers(prev);
    }
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-500">Analyzing your style...</p>
      </div>
    );
  }

  const q = STYLE_QUESTIONS[currentIndex];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">
              Style · {currentIndex + 1} of {STYLE_QUESTIONS.length}
            </p>
            <div className="h-1 bg-stone-200 rounded-full">
              <div
                className="h-1 bg-stone-700 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex) / STYLE_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-light text-stone-800 mb-8">{q.question}</h2>

          <div className="space-y-3">
            {q.options.map((opt) => (
              <button
                key={opt.style}
                onClick={() => selectOption(opt.style)}
                className="w-full text-left border border-stone-200 bg-white hover:border-stone-700 hover:shadow-sm transition-all p-5 group"
              >
                <p className="font-medium text-stone-800 mb-1 group-hover:text-stone-900">
                  {opt.label}
                </p>
                <p className="text-sm text-stone-400">{opt.description}</p>
              </button>
            ))}
          </div>

          <button
            onClick={goBack}
            className="mt-8 text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
