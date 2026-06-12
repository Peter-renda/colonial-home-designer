"use client";

import { useState, useMemo } from "react";
import { ArchitecturalStyle, QuizAnswers, StyleScores } from "../../types/quiz";
import { QUIZ_SECTIONS } from "../../data/quizSections";
import { Preferences } from "../../types";
import { DEFAULT_PREFERENCES } from "../../data/defaultPreferences";
import { COLONIAL_MODEL_1 } from "../../data/colonialModel1";
import { runTakeoff } from "../../lib/takeoff";
import BomTable from "../BomTable";

import WelcomePage from "./WelcomePage";
import StyleQuizStep from "./StyleQuizStep";
import NonNegotiablesStep from "./NonNegotiablesStep";
import BudgetStep from "./BudgetStep";
import DetailSectionStep from "./DetailSectionStep";
import SummaryPage from "./SummaryPage";
import ConstructionDocsPage from "./ConstructionDocsPage";

type Phase =
  | "welcome"
  | "style-quiz"
  | "non-negotiables"
  | "budget"
  | { type: "detail"; index: number }
  | "summary"
  | "docs"
  | "bom";

function quizAnswersToPreferences(answers: QuizAnswers): Preferences {
  const get = (id: string): string => (answers[id] as string | undefined) ?? "";

  function pick<T extends string>(id: string, fallback: T): T {
    const v = get(id);
    return (v || fallback) as T;
  }

  return {
    foundationType: pick("foundationType", DEFAULT_PREFERENCES.foundationType),
    slabDepth: pick("slabDepth", DEFAULT_PREFERENCES.slabDepth),
    stoneBase: pick("stoneBase", DEFAULT_PREFERENCES.stoneBase),
    foundationSideInsulation: pick("foundationSideInsulation", DEFAULT_PREFERENCES.foundationSideInsulation),
    foundationBottomInsulation: pick("foundationBottomInsulation", DEFAULT_PREFERENCES.foundationBottomInsulation),
    crawlspace: pick("crawlspaceHeight", DEFAULT_PREFERENCES.crawlspace) === "No" ? "No" : "Yes",

    firstFloorCeilingHeight: pick("firstFloorCeilingHeight", DEFAULT_PREFERENCES.firstFloorCeilingHeight),
    secondFloorCeilingHeight: pick("secondFloorCeilingHeight", DEFAULT_PREFERENCES.secondFloorCeilingHeight),
    sheathing: pick("sheathing", DEFAULT_PREFERENCES.sheathing),
    exteriorWall: pick("exteriorWall", DEFAULT_PREFERENCES.exteriorWall),
    floorSystem: pick("floorSystem", DEFAULT_PREFERENCES.floorSystem),

    roofShape: (() => {
      const v = get("roofShape");
      if (v === "Hip") return "Hip";
      return "Gable";
    })(),
    dormers: (() => {
      const v = get("dormers");
      if (["Gable", "Shed", "Hip"].includes(v)) return v as "Gable" | "Shed" | "Hip";
      return "None";
    })(),
    gutters: pick("gutters", DEFAULT_PREFERENCES.gutters),
    shingleStyle: pick("shingleStyle", DEFAULT_PREFERENCES.shingleStyle),
    snowguards: (() => {
      const v = get("snowguards");
      if (v === "Snowbird - black") return "Snowbird - black";
      if (v === "Snowbirds - copper") return "Snowbird - copper";
      return "None";
    })(),
    rafterTails: pick("rafterTails", DEFAULT_PREFERENCES.rafterTails),

    facade: (() => {
      const v = get("facade");
      if (v === "Hardiplank - Beaded") return "Hardiplank - beaded";
      if (v === "Hardiplank - flat") return "Hardiplank - flat";
      if (v === "Cedar lap") return "Cedar lap";
      return "Brick";
    })(),
    exteriorPaint: get("exteriorPaint") !== "None" && get("exteriorPaint") !== "" ? "Yes" : "No",
    cornice: DEFAULT_PREFERENCES.cornice,

    windowStyle: "Single hung with grid",
    windowLevel: (() => {
      const v = get("windowLevel");
      if (v === "Aluminum (Brown)" || v === "Metal") return "Aluminum-clad";
      if (v === "Vinyl") return "Vinyl";
      return DEFAULT_PREFERENCES.windowLevel;
    })(),
    shutters: (() => {
      const v = get("shutters");
      if (v === "Louvered") return "Yes - Louvered";
      if (v === "Raised panel") return "Yes - Raised panel";
      return "No";
    })(),
    windowSillsFirstFloor: (() => {
      const v = get("windowSillsFirstFloor");
      if (v === "Brick - straight") return "Brick - straight";
      return "Brick - rowlock";
    })(),
    windowSillsSecondFloor: (() => {
      const v = get("windowSillsSecondFloor");
      if (v === "Brick - straight") return "Brick - straight";
      return "Brick - rowlock";
    })(),

    frontPorch: (() => {
      const v = get("frontPorch");
      if (v === "8' x 6' concrete") return "8' x 6' concrete";
      if (v === "38' x 10' concrete") return "35' x 8' concrete";
      if (v === "5' x 4'") return "5' x 4' concrete";
      if (v === "8' x 6' brick herringbone") return "8' x 6' brick herringbone";
      return "None";
    })(),
    porticoSlabBasement: (() => {
      const v = get("portico");
      if (v.startsWith("Gable Portico")) return "Gable Portico (with 8' x 6' front porch)";
      if (v.startsWith("Hip")) return "Hip Portico";
      return "N/A";
    })(),
    rearPorch: (() => {
      const v = get("rearPorchSlabBasement");
      if (v === "10' x 20' concrete") return "10' x 20' concrete";
      if (v === "10' x 20' stamped concrete") return "10' x 20' stamped concrete";
      if (v === "10' x 20' brick") return "10' x 20' brick";
      return "None";
    })(),
    rearDoorAwning: (() => {
      const v = get("rearDoorAwningSlabBasement");
      if (v === "Juliet awning") return "Juliet awning";
      if (v === "Shed roof") return "Shed roof";
      return "N/A";
    })(),
    rearDoorAwningCorbel: "Knee brace",

    garage: (() => {
      const v = get("garage");
      if (v === "2 car front load") return "2 car front load";
      if (v.startsWith("2 car side")) return "2 car side load";
      if (v.startsWith("3 car")) return "3 car side load";
      return "None";
    })(),
    garageDoorLevel: (() => {
      const v = get("garageDoorLevel");
      if (v === "wood" || v === "custom - wood") return "wood";
      return "steel";
    })(),
    sideEntrance: pick("sideEntrance", DEFAULT_PREFERENCES.sideEntrance),
    raftersOverGarageDoors: DEFAULT_PREFERENCES.raftersOverGarageDoors,

    finishedThirdFloor: (() => {
      const v = get("finishedThirdFloor");
      return v !== "None" && v !== "" ? "Yes" : "No";
    })(),
    roomOverCoveredPorch: DEFAULT_PREFERENCES.roomOverCoveredPorch,
    bonusRoomOverGarage: (() => {
      const v = get("finishedSpaceOverGarage");
      return v !== "None" && v !== "" ? "Yes" : "No";
    })(),
    finishedBasement: pick("finishedBasement", DEFAULT_PREFERENCES.finishedBasement),
    sunRoom: (() => {
      const v = get("sunroom");
      return v !== "No" && v !== "" ? "Yes" : "No";
    })(),
    additionalBathThirdFloor: DEFAULT_PREFERENCES.additionalBathThirdFloor,
    additionalBathOverGarage: DEFAULT_PREFERENCES.additionalBathOverGarage,
    breezeway: (() => {
      const v = get("breezeway");
      return v !== "No" && v !== "" ? "Yes" : "No";
    })(),
  };
}

export default function QuizWizard() {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [recommendedStyle, setRecommendedStyle] = useState<ArchitecturalStyle>("Georgian");
  const [styleScores, setStyleScores] = useState<StyleScores>({ Federal: 0, Georgian: 0, "Greek Revival": 0 });
  const [nonNegotiables, setNonNegotiables] = useState<string[]>([]);
  const [budget, setBudget] = useState<string>("");
  const [answers, setAnswers] = useState<QuizAnswers>({});

  function updateAnswer(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  const prefs = useMemo(() => quizAnswersToPreferences(answers), [answers]);
  const takeoffResult = useMemo(() => runTakeoff(prefs, COLONIAL_MODEL_1), [prefs]);

  // ── Phase rendering ──────────────────────────────────────────

  if (phase === "welcome") {
    return <WelcomePage onStart={() => setPhase("style-quiz")} />;
  }

  if (phase === "style-quiz") {
    return (
      <StyleQuizStep
        onComplete={(style, scores) => {
          setRecommendedStyle(style);
          setStyleScores(scores);
          setPhase("non-negotiables");
        }}
        onBack={() => setPhase("welcome")}
      />
    );
  }

  if (phase === "non-negotiables") {
    return (
      <NonNegotiablesStep
        onContinue={(selected) => {
          setNonNegotiables(selected);
          setPhase("budget");
        }}
        onBack={() => setPhase("style-quiz")}
      />
    );
  }

  if (phase === "budget") {
    return (
      <BudgetStep
        onContinue={(b) => {
          setBudget(b);
          setPhase({ type: "detail", index: 0 });
        }}
        onBack={() => setPhase("non-negotiables")}
      />
    );
  }

  if (typeof phase === "object" && phase.type === "detail") {
    const { index } = phase;
    const section = QUIZ_SECTIONS[index];
    const sameGroupSections = QUIZ_SECTIONS.filter((s) => s.group === section.group);
    const groupIndex = sameGroupSections.findIndex((s) => s.id === section.id);

    return (
      <DetailSectionStep
        section={section}
        sectionIndex={index}
        totalSections={QUIZ_SECTIONS.length}
        groupIndex={groupIndex}
        groupTotal={sameGroupSections.length}
        answers={answers}
        onChange={updateAnswer}
        onNext={() => {
          if (index < QUIZ_SECTIONS.length - 1) {
            setPhase({ type: "detail", index: index + 1 });
          } else {
            setPhase("summary");
          }
        }}
        onBack={() => {
          if (index === 0) {
            setPhase("budget");
          } else {
            setPhase({ type: "detail", index: index - 1 });
          }
        }}
      />
    );
  }

  if (phase === "summary") {
    return (
      <SummaryPage
        recommendedStyle={recommendedStyle}
        nonNegotiables={nonNegotiables}
        budget={budget}
        answers={answers}
        onEdit={(i) => setPhase({ type: "detail", index: i })}
        onViewBOM={() => setPhase("bom")}
        onGenerateDocs={() => setPhase("docs")}
      />
    );
  }

  if (phase === "docs") {
    return (
      <ConstructionDocsPage
        recommendedStyle={recommendedStyle}
        budget={budget}
        answers={answers}
        onBack={() => setPhase("summary")}
        onViewBOM={() => setPhase("bom")}
      />
    );
  }

  // BOM phase
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-medium text-stone-800">SiteCommand — Bill of Materials</h1>
            <p className="text-xs text-stone-400">
              Colonial Model 1 · {COLONIAL_MODEL_1.totalSqFt.toLocaleString()} sq ft ·{" "}
              <span className="uppercase tracking-wider">{recommendedStyle}</span>
            </p>
          </div>
          <button
            onClick={() => setPhase("summary")}
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← Back to Summary
          </button>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <BomTable result={takeoffResult} />
      </div>
    </div>
  );
}
