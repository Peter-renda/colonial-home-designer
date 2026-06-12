"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { ArchitecturalStyle, QuizAnswers } from "../../types/quiz";
import { paramsFromAnswers } from "../../lib/houseParams";
import { houseParamsJson, pyRevitScript } from "../../lib/revitExport";
import { blenderScript } from "../../lib/blenderExport";
import CoverSheet from "../docs/CoverSheet";
import FloorPlanSheet from "../docs/FloorPlanSheet";
import ElevationSheet from "../docs/ElevationSheet";

const HouseViewer = dynamic(() => import("../three/HouseViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
      Loading 3D model…
    </div>
  ),
});

interface Props {
  recommendedStyle: ArchitecturalStyle;
  budget: string;
  answers: QuizAnswers;
  onBack: () => void;
  onViewBOM: () => void;
}

const BUDGET_LABELS: Record<string, string> = {
  "under-400k": "Under $400K",
  "400k-600k": "$400K – $600K",
  "600k-800k": "$600K – $800K",
  "800k-1m": "$800K – $1M",
  "over-1m": "Over $1M",
};

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ConstructionDocsPage({
  recommendedStyle,
  budget,
  answers,
  onBack,
  onViewBOM,
}: Props) {
  const params = useMemo(() => paramsFromAnswers(answers), [answers]);
  const budgetLabel = BUDGET_LABELS[budget] ?? budget;

  return (
    <div className="min-h-screen bg-stone-100">
      {/* header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10 no-print">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-medium text-stone-800">
              SiteCommand — Construction Documents
            </h1>
            <p className="text-xs text-stone-400">
              Colonial Model 1 · <span className="uppercase tracking-wider">{recommendedStyle}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="text-sm border border-stone-300 px-4 py-2 text-stone-600 hover:border-stone-500 transition-colors"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onViewBOM}
              className="text-sm border border-stone-300 px-4 py-2 text-stone-600 hover:border-stone-500 transition-colors"
            >
              Bill of Materials
            </button>
            <button onClick={onBack} className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
              ← Summary
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* hero: final 3D model + export package */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 no-print">
          <div className="bg-white border border-stone-200">
            <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">
                Final design — 3D model
              </p>
              <p className="text-xs text-stone-300">drag to orbit · scroll to zoom</p>
            </div>
            <div className="w-full aspect-[16/10] bg-[#e9ece3]">
              <HouseViewer params={params} />
            </div>
          </div>

          <div className="bg-white border border-stone-200 flex flex-col">
            <div className="px-5 py-3 border-b border-stone-100">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Revit package</p>
            </div>
            <div className="px-5 py-4 text-sm text-stone-600 leading-relaxed flex-1">
              <p className="mb-3">
                Your selections compiled into a <span className="font-medium text-stone-800">pyRevit
                build script</span>. Run it in Revit and it generates the model as native, editable
                geometry — levels, walls, floors, the {params.roofShape === "hip" ? "hip" : "gable"}{" "}
                roof at {params.roofPitch}/12, and the door/window grid — giving you a real{" "}
                <span className="font-medium text-stone-800">.rvt</span> to sheet and detail from.
              </p>
              <ol className="list-decimal list-inside text-xs text-stone-500 space-y-1 mb-4">
                <li>Open Revit (2022+) with a new project from your architectural template</li>
                <li>Install pyRevit, then choose &ldquo;Run pyRevit script&rdquo;</li>
                <li>Pick the downloaded .py — the model builds in one transaction</li>
              </ol>
            </div>
            <div className="px-5 pb-5 space-y-2">
              <button
                onClick={() =>
                  downloadText("colonial_model_1_pyrevit.py", pyRevitScript(params, recommendedStyle))
                }
                className="w-full bg-stone-800 text-white px-4 py-3 text-xs uppercase tracking-[0.15em] hover:bg-stone-700 transition-colors"
              >
                ↓ pyRevit build script (.py)
              </button>
              <button
                onClick={() =>
                  downloadText(
                    "colonial_model_1_parameters.json",
                    houseParamsJson(params, answers, recommendedStyle, budgetLabel)
                  )
                }
                className="w-full border border-stone-300 px-4 py-3 text-xs uppercase tracking-[0.15em] text-stone-600 hover:border-stone-500 transition-colors"
              >
                ↓ Parameters (.json)
              </button>
              <button
                onClick={() =>
                  downloadText("colonial_model_1_blender.py", blenderScript(params, recommendedStyle))
                }
                className="w-full border border-stone-300 px-4 py-3 text-xs uppercase tracking-[0.15em] text-stone-600 hover:border-stone-500 transition-colors"
              >
                ↓ Blender render script (.py)
              </button>
              <p className="text-[10px] text-stone-400 leading-relaxed pt-1">
                The Blender script rebuilds the massing with materials, sun, and camera for a Cycles
                render — it pairs with the MCP workflow in blender-setup/. The JSON drives schedules,
                tagging, and any downstream automation.
              </p>
            </div>
          </div>
        </div>

        {/* drawing set */}
        <div className="space-y-8">
          <div className="flex items-end justify-between no-print">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-1">Drawing set</p>
              <h2 className="text-2xl font-light text-stone-800">
                Design development documents
              </h2>
            </div>
            <p className="text-xs text-stone-400">
              4 sheets · generated from your {Object.keys(answers).length} selections
            </p>
          </div>

          <CoverSheet params={params} answers={answers} style={recommendedStyle} budget={budgetLabel} />
          <FloorPlanSheet floor="first" params={params} answers={answers} style={recommendedStyle} />
          <FloorPlanSheet floor="second" params={params} answers={answers} style={recommendedStyle} />
          <ElevationSheet params={params} style={recommendedStyle} />
        </div>

        <p className="text-xs text-stone-400 leading-relaxed max-w-3xl no-print">
          These documents are generated for pricing and design review. Permit-ready construction
          documents require review, completion, and sealing by a licensed design professional in
          your jurisdiction.
        </p>
      </div>
    </div>
  );
}
