"use client";

import { useState, useMemo } from "react";
import { Preferences } from "../types";
import { DEFAULT_PREFERENCES } from "../data/defaultPreferences";
import { COLONIAL_MODEL_1 } from "../data/colonialModel1";
import { runTakeoff } from "../lib/takeoff";
import PreferencesForm from "../components/PreferencesForm";
import BomTable from "../components/BomTable";

export default function TakeoffPage() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);

  // Recompute the takeoff whenever preferences change. With ~50 calculators
  // this runs in <1ms — no need to memo aggressively or move to a worker.
  const result = useMemo(
    () => runTakeoff(prefs, COLONIAL_MODEL_1),
    [prefs],
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold">SiteCommand — Takeoff</h1>
          <p className="text-sm text-gray-600">
            Colonial Model 1 · {COLONIAL_MODEL_1.totalSqFt.toLocaleString()} sq ft
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Preferences
          </h2>
          <PreferencesForm value={prefs} onChange={setPrefs} />
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Bill of Materials
          </h2>
          <BomTable result={result} />
        </div>
      </div>
    </main>
  );
}
