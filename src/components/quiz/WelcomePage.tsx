"use client";

interface Props {
  onStart: () => void;
}

export default function WelcomePage({ onStart }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-6">
      <div className="max-w-2xl w-full text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-8">SiteCommand</p>

        <h1 className="text-5xl sm:text-6xl font-light text-stone-800 mb-6 leading-tight tracking-tight">
          Start designing<br />your home.
        </h1>

        <p className="text-lg text-stone-500 mb-4 max-w-md mx-auto leading-relaxed">
          Answer a few questions about your style, priorities, and budget.
        </p>
        <p className="text-sm text-stone-400 mb-14 max-w-md mx-auto">
          Then customize every detail — from the foundation to the landscaping.
        </p>

        <button
          onClick={onStart}
          className="inline-flex items-center gap-3 bg-stone-800 text-white px-10 py-4 text-sm uppercase tracking-[0.15em] hover:bg-stone-700 transition-colors"
        >
          Get Started
          <span className="text-stone-400">→</span>
        </button>

        <p className="mt-10 text-xs text-stone-300 uppercase tracking-widest">
          Federal · Georgian · Greek Revival
        </p>
      </div>
    </div>
  );
}
