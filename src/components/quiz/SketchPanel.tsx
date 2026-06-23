"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { QuizAnswers, QuizGroup } from "../../types/quiz";
import {
  BuildStage,
  paramsFromAnswers,
  foundationViewFromAnswers,
  framingViewFromAnswers,
} from "../../lib/houseParams";
import {
  StandaloneFrontElevationSideGable,
  StandaloneAssembly,
} from "./PencilExterior";

const HouseViewer = dynamic(() => import("../three/HouseViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
      Loading 3D model…
    </div>
  ),
});

const FramingDetails3D = dynamic(
  () => import("../three/DetailModels").then((m) => m.FramingDetails3D),
  { ssr: false }
);

const InsulationDetails3D = dynamic(
  () => import("../three/DetailModels").then((m) => m.InsulationDetails3D),
  { ssr: false }
);

const RoomViewer = dynamic(() => import("../three/RoomModel"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
      Loading room…
    </div>
  ),
});

interface Props {
  group: QuizGroup;
  sectionId: string;
  sketchKey?: string;
  answers: QuizAnswers;
}

export default function SketchPanel({ group, sectionId, sketchKey, answers }: Props) {
  const [view, setView] = useState<"model" | "sketch" | "simulation">("model");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 border-b border-stone-200">
        {(
          [
            ["model", "3D Model"],
            ["sketch", "Detail Sketch"],
            ["simulation", "Project Simulation"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border-b-2 -mb-px transition-colors ${
              view === key
                ? "border-stone-700 text-stone-800"
                : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {view === "model" ? (
        <LiveModelPanel answers={answers} sectionId={sectionId} group={group} sketchKey={sketchKey} />
      ) : view === "sketch" ? (
        <LegacySketch group={group} sectionId={sectionId} sketchKey={sketchKey} answers={answers} />
      ) : (
        <ProjectSimulationPanel />
      )}
    </div>
  );
}

const SIMULATION_ROLES = [
  {
    title: "Owner / Client",
    status: "Available",
    description: "Review the current selections from the homeowner perspective.",
    available: true,
  },
  {
    title: "Estimator",
    status: "Available",
    description: "Translate design choices into budget and material considerations.",
    available: true,
  },
  {
    title: "Superintendent",
    status: "Coming soon",
    description: "Site sequencing, field coordination, and buildability checks are coming soon.",
    available: false,
  },
  {
    title: "Project Accountant",
    status: "Coming soon",
    description: "Cost-code tracking, commitments, and draw reporting are coming soon.",
    available: false,
  },
  {
    title: "Preconstruction Manager",
    status: "Coming soon",
    description: "Early trade buyout, value engineering, and procurement planning are coming soon.",
    available: false,
  },
];

function ProjectSimulationPanel() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Project simulation</p>
        <p className="text-xs text-stone-400 leading-relaxed mt-2">
          Choose a project role to review this home from that point of view. Roles marked coming
          soon are visible for planning, but they are not selectable yet.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SIMULATION_ROLES.map((role) => (
          <div key={role.title} className="relative group">
            <button
              type="button"
              disabled={!role.available}
              title={!role.available ? `${role.title} coming soon` : undefined}
              className={`w-full h-full text-left border bg-white p-4 transition-colors ${
                role.available
                  ? "border-stone-200 hover:border-stone-500 cursor-pointer"
                  : "border-stone-200 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-medium text-stone-800">{role.title}</h3>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-1 ${
                    role.available ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {role.status}
                </span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed mt-3">{role.description}</p>
            </button>
            {!role.available && (
              <div className="pointer-events-none absolute left-4 right-4 top-3 -translate-y-full bg-stone-800 px-3 py-2 text-[11px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                {role.title} is coming soon.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function stageForSection(sectionId: string): BuildStage {
  if (sectionId === "site-analysis") return "site";
  if (sectionId === "foundation") return "foundation";
  if (sectionId === "framing") return "framing";
  return "complete";
}

// ─── LIVE 3D MODEL — rebuilds as every answer changes ───────────
function LiveModelPanel({
  answers,
  sectionId,
  group,
  sketchKey,
}: {
  answers: QuizAnswers;
  sectionId: string;
  group: QuizGroup;
  sketchKey?: string;
}) {
  const params = useMemo(() => paramsFromAnswers(answers), [answers]);
  const stage = stageForSection(sectionId);

  // Room sections show an interior of the room being configured, rather than
  // the finished exterior. (whole-house keeps the full massing.)
  const roomKey = group === "rooms" && sketchKey && sketchKey !== "whole-house" ? sketchKey : null;
  if (roomKey) {
    return <RoomModelPanel sketchKey={roomKey} answers={answers} />;
  }

  // foundation/framing reveal state — drives which elements appear as the
  // user makes selections (the model builds itself up, not on a timer)
  const foundationView = useMemo(() => foundationViewFromAnswers(answers), [answers]);
  const framingView = useMemo(() => framingViewFromAnswers(answers), [answers]);

  const specLine = [
    params.facade === "brick" ? "Brick" : params.facade === "cedar" ? "Cedar lap" : "Hardiplank",
    params.roofShape === "hip"
      ? "hip roof"
      : params.roofShape === "gableFrontGable"
        ? "gable roof with front gable"
        : "side-gable roof",
    params.dormers !== "none" ? `${params.dormers} dormers` : null,
    params.shutters ? "shutters" : null,
    params.portico !== "none" ? `${params.portico} portico` : null,
    params.garage === "none"
      ? null
      : params.garage === "front2"
        ? "2-car front-load garage"
        : params.garage === "side3"
          ? "3-car side-load garage"
          : "2-car garage",
    params.chimney ? "chimney" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const foundationChosen = ans(answers, "foundationType") !== "";
  const heading =
    stage === "site"
      ? "Your lot — live 3D site model"
      : stage === "foundation"
        ? foundationChosen
          ? "Your foundation — built from your selections"
          : "Your lot — choose a foundation to begin"
        : stage === "framing"
          ? "Your framing — live 3D model"
          : "Your home — live 3D model";

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">{heading}</p>
      <div className="bg-[#e9ece3] border border-stone-200 w-full aspect-[4/3] overflow-hidden">
        <HouseViewer
          params={params}
          stage={stage}
          foundation={foundationView}
          framing={framingView}
        />
      </div>

      {stage === "foundation" && (
        <p className="text-xs text-stone-400 leading-relaxed">
          {foundationCaption(answers, params)}
          <span className="block mt-1 text-stone-300">
            Drag to orbit · scroll to zoom · each foundation choice is added to the model as you
            make it.
          </span>
        </p>
      )}

      {stage === "site" && <SiteAnalysisReport answers={answers} />}

      {stage === "framing" && (
        <p className="text-xs text-stone-400 leading-relaxed">
          {params.framingDetail.studLabel} studs at 16&Prime; o.c. · first floor{" "}
          {params.firstFloorFt}&prime;, second floor {params.secondFloorFt}&prime; — stud lengths
          update as you change ceiling heights.
          {framingView.sheathingChosen && (
            <>
              {" "}
              Walls are sheathed in{" "}
              {params.framingDetail.sheathing === "zip" ? "green 7/16″ Zip System" : "brown 7/16″ OSB"}{" "}
              panels.
            </>
          )}
          <span className="block mt-1 text-stone-300">
            Drag to orbit · scroll to zoom · the skeleton rebuilds as you make selections.
          </span>
        </p>
      )}

      {sectionId === "framing" && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.15em] text-stone-400">3D details</p>
          <FramingDetails3D params={params} sheathingChosen={framingView.sheathingChosen} />
          <p className="text-xs text-stone-300 leading-relaxed">
            The same wall and floor details as the sketch tab, in 3D — drag to orbit each one.
          </p>
        </div>
      )}

      {sectionId === "insulation" && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.15em] text-stone-400">3D details</p>
          <InsulationDetails3D
            params={params}
            insulated={ans(answers, "interiorWallInsulation") !== ""}
            exteriorFoam={ans(answers, "exteriorInsulation") === "Yes"}
            rAttic={ans(answers, "atticInsulation")}
            sheathingChosen={framingView.sheathingChosen}
          />
          <p className="text-xs text-stone-300 leading-relaxed">
            Stud cavities fill with batt as you pick an R-value, a foam layer wraps the OSB when
            exterior insulation is on, and the attic deepens with its R-value — drag to orbit each.
          </p>
        </div>
      )}

      {stage === "complete" && (
        <p className="text-xs text-stone-400 leading-relaxed">
          {params.widthFt}&prime; &times; {params.depthFt}&prime; two-story colonial · {specLine}.
          <span className="block mt-1 text-stone-300">
            Drag to orbit · scroll to zoom · the model rebuilds as you make selections.
          </span>
        </p>
      )}
    </div>
  );
}

const ROOM_LABELS: Record<string, string> = {
  "first-floor": "First-floor flooring",
  "second-floor": "Second-floor flooring",
  staircase: "Staircase",
  trim: "Trim",
  "trim-by-room": "Trim",
  "interior-door": "Interior doors",
  kitchen: "Kitchen",
  bath: "Bathroom",
  "built-ins": "Built-ins",
  lighting: "Lighting",
};

/** Interior room view shown for the "rooms" sections. */
function RoomModelPanel({ sketchKey, answers }: { sketchKey: string; answers: QuizAnswers }) {
  const label = ROOM_LABELS[sketchKey] ?? "Room";
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">
        Your {label.toLowerCase()} — live 3D interior
      </p>
      <div className="bg-[#eceee8] border border-stone-200 w-full aspect-[4/3] overflow-hidden">
        <RoomViewer sketchKey={sketchKey} answers={answers} />
      </div>
      <p className="text-xs text-stone-400 leading-relaxed">
        A 3D view of your {label.toLowerCase()} — it updates as you make selections for this room.
        <span className="block mt-1 text-stone-300">Drag to orbit · scroll to zoom.</span>
      </p>
    </div>
  );
}

/** Plain-language caption describing the foundation as it's been selected. */
function foundationCaption(answers: QuizAnswers, params: ReturnType<typeof paramsFromAnswers>): string {
  const type = ans(answers, "foundationType");
  if (type === "") {
    return "This is your lot, graded and staked. Pick a foundation type and it appears here.";
  }
  const parts: string[] = [];
  if (type === "Basement") {
    parts.push("Full concrete basement walls on poured footings, with the floor slab inside.");
  } else if (type === "Crawlspace") {
    parts.push(
      `Block stem walls raise the floor ${params.foundationDetail.crawlHeightFt}′ above grade, with foundation vents.`
    );
  } else {
    parts.push(
      `${params.foundationDetail.slabDepthIn}″ slab on a ${params.foundationDetail.stoneBaseIn}″ compacted stone bed — shown partially poured so the stone reads underneath.`
    );
  }
  if (ans(answers, "foundationSideInsulation") === "Yes") {
    parts.push("Rigid foam wraps the perimeter (side insulation).");
  }
  if (ans(answers, "foundationBottomInsulation").startsWith("Yes")) {
    parts.push("Rigid foam runs under the slab (bottom insulation).");
  }
  return parts.join(" ");
}

// ─── SITE ANALYSIS — derived insights from the lot answers ──────
function SiteAnalysisReport({ answers }: { answers: QuizAnswers }) {
  const slope = ans(answers, "lotSlope");
  const slopeDir = ans(answers, "slopeDirection");
  const soil = ans(answers, "soilType");
  const drainage = ans(answers, "drainage");
  const flood = ans(answers, "floodZone");
  const trees = ans(answers, "treeCoverage");
  const facing = ans(answers, "streetFacing");
  const utilities = multiAns(answers, "utilities");

  const insights: string[] = [];

  if (slope.startsWith("Flat")) {
    insights.push("Flat lot — a slab-on-grade foundation is the most economical fit, with minimal grading.");
  } else if (slope.startsWith("Gentle")) {
    insights.push("Gentle slope — a crawlspace absorbs the grade change with a few block courses instead of costly fill.");
  } else if (slope.startsWith("Moderate")) {
    insights.push("Moderate slope — a crawlspace or walkout basement works with the grade; budget for stepped footings.");
  } else if (slope.startsWith("Steep")) {
    insights.push("Steep lot — plan on an engineered foundation, retaining walls, and a walkout basement on the downhill side.");
  }

  // slopeDir is a compass bearing (N/E/S/W); read it relative to the front.
  const rel = relativeSlopeDir(facing, slopeDir);
  if (rel === "rear") {
    insights.push("Falling toward the rear is ideal for a walkout basement and keeps water moving away from the entry.");
  } else if (rel === "front") {
    insights.push("Falling toward the street drains well, but check the driveway grade — keep it under ~10%.");
  } else if (rel === "left" || rel === "right") {
    insights.push(`Cross-slope falling to the ${rel} — grade water around the house toward the low corner and keep the foundation drained.`);
  }

  if (soil.startsWith("Clay")) {
    insights.push("Expansive clay swells when wet — footings need engineering and gutters must discharge well away from the house.");
  } else if (soil.startsWith("Rock")) {
    insights.push("Rock near the surface makes basement excavation expensive — slab or crawlspace will save real money.");
  } else if (soil.startsWith("Fill")) {
    insights.push("Fill soil must be compacted, tested, or excavated to undisturbed ground before footings are poured.");
  } else if (soil.startsWith("Unknown")) {
    insights.push("Order a geotechnical (soils) report before finalizing the foundation — it's a few hundred dollars that prevents five-figure surprises.");
  } else if (soil.startsWith("Sandy")) {
    insights.push("Sandy, well-draining soil is friendly to any foundation type, including a basement.");
  }

  if (drainage.startsWith("High water") || drainage.startsWith("Wet")) {
    insights.push("With poor drainage, avoid a basement or invest in serious waterproofing — plan perimeter drains and swales either way.");
  }

  if (flood.startsWith("Yes")) {
    insights.push("In a FEMA flood zone: expect flood insurance, an elevated foundation (stemwall with flood vents), and a survey of the base flood elevation.");
  } else if (flood.startsWith("Not sure")) {
    insights.push("Look up your parcel on the FEMA flood map — flood-zone status changes insurance and foundation design.");
  }

  if (trees.startsWith("Heavily")) {
    insights.push("Heavy tree cover means real clearing costs — flag the specimens worth saving before the excavator arrives.");
  } else if (trees.startsWith("Partially")) {
    insights.push("Keep mature trees on the south and west where their shade cuts summer cooling loads.");
  }

  if (facing === "South") {
    insights.push("South-facing front: the facade gets all-day sun; the rear porch stays comfortably shaded.");
  } else if (facing === "North") {
    insights.push("North-facing front: the rear of the home gets the southern sun — perfect for the kitchen, living room, and porch.");
  } else if (facing === "West") {
    insights.push("West-facing front: strong afternoon sun on the facade — the portico and shutters earn their keep.");
  } else if (facing === "East") {
    insights.push("East-facing front: gentle morning light in the front rooms, sunsets over the back yard.");
  }

  if (utilities.includes("Septic required")) {
    insights.push("Septic requires a perc test — the drain field location can dictate where the house sits, so test before siting.");
  }
  if (utilities.includes("Well required")) {
    insights.push("A well must keep code distance from the septic field (often 50–100') — plan both locations together.");
  }
  if (!utilities.includes("Natural gas at street") && utilities.length > 0) {
    insights.push("No natural gas at the street — consider electric/induction cooking, heat-pump HVAC, and a heat-pump or electric water heater.");
  }

  return (
    <div className="space-y-3">
      <div className="border border-stone-200 bg-white">
        <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-stone-400 border-b border-stone-100">
          Site analysis
        </div>
        <div className="px-3 py-3">
          {insights.length === 0 ? (
            <p className="text-xs text-stone-300 italic">
              Answer the questions on the left and the site analysis will build itself here.
            </p>
          ) : (
            <ul className="space-y-2">
              {insights.map((s, i) => (
                <li key={i} className="text-xs text-stone-600 leading-relaxed flex gap-2">
                  <span className="text-stone-300 flex-shrink-0">▸</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="text-xs text-stone-300 leading-relaxed">
        For a complete site analysis, also gather: a boundary survey/plat, geotechnical soils
        report, perc test (if septic), FEMA flood certificate, utility locates, and any HOA or
        deed restrictions.
      </p>
    </div>
  );
}

function LegacySketch({ group, sectionId, sketchKey, answers }: Props) {
  if (group === "site") {
    return <SitePlanSketch answers={answers} />;
  }
  if (group === "structural" || group === "systems") {
    if (sectionId === "framing") return <FramingDetailSketch answers={answers} />;
    if (sectionId === "insulation") return <InsulationDetailSketch answers={answers} />;
    return <StructuralSketch sectionId={sectionId} answers={answers} />;
  }
  if (group === "exterior") {
    return <ExteriorPencilSketch sectionId={sectionId} />;
  }
  const prompt = buildSketchPrompt(group, sectionId, sketchKey, answers);
  const label = (sketchKey ?? sectionId).replace(/-/g, " ");
  return <SketchedImage prompt={prompt} label={label} />;
}

// ─── SITE — uploaded topo or schematic site plan ────────────────
function SitePlanSketch({ answers }: { answers: QuizAnswers }) {
  const topo = ans(answers, "topoMap");
  const slope = ans(answers, "lotSlope");
  const sloped = !!slope && !slope.startsWith("Flat");

  if (topo.startsWith("data:")) {
    return (
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Your topo map</p>
        <div className="bg-white border border-stone-200 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={topo} alt="Uploaded topographic map" className="w-full h-auto" />
        </div>
        <p className="text-xs text-stone-400 leading-relaxed">
          Uploaded survey/topo — also draped over the 3D terrain in the model view.
        </p>
      </div>
    );
  }

  // schematic site plan: lot, footprint, setbacks, contours
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Schematic site plan</p>
      <svg viewBox="0 0 360 300" className="w-full h-auto bg-stone-50 border border-stone-200">
        <rect x="0" y="0" width="360" height="300" fill="#f3f4ee" />
        {/* street */}
        <rect x="0" y="262" width="360" height="38" fill="#d8d4c8" />
        <line x1="0" y1="281" x2="360" y2="281" stroke="#fafaf7" strokeWidth="2" strokeDasharray="14 10" />
        {/* lot */}
        <rect x="50" y="20" width="260" height="230" fill="#e3e8d8" stroke="#7c7259" strokeWidth="1.5" />
        {/* contour lines if sloped */}
        {sloped &&
          [0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M 50 ${60 + i * 40} C 140 ${48 + i * 40}, 230 ${72 + i * 40}, 310 ${56 + i * 40}`}
              fill="none"
              stroke="#a59a78"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />
          ))}
        {/* setback dashed envelope */}
        <rect x="80" y="50" width="200" height="160" fill="none" stroke="#b08968" strokeWidth="1" strokeDasharray="6 4" />
        {/* footprint */}
        <rect x="130" y="120" width="100" height="68" fill="#fffdf4" stroke="#4a4543" strokeWidth="1.4" />
        <text x="180" y="157" textAnchor="middle" fontSize="9" fill="#7a7158">
          House
        </text>
        {/* driveway */}
        <rect x="216" y="188" width="22" height="74" fill="#cfcabc" stroke="#9b9286" strokeWidth="0.6" />
        {/* walkway */}
        <rect x="176" y="188" width="8" height="74" fill="#e6e1d2" stroke="#9b9286" strokeWidth="0.5" />
        {/* north arrow */}
        <g transform="translate(330, 42)">
          <circle r="13" fill="#fffdf4" stroke="#7c7259" strokeWidth="0.8" />
          <polygon points="0,-9 4,5 0,2 -4,5" fill="#4a4543" />
          <text y="24" textAnchor="middle" fontSize="8" fill="#7a7158">
            N
          </text>
        </g>
        <text x="180" y="294" textAnchor="middle" fontSize="8" fill="#8a8270">
          Street
        </text>
        <text x="86" y="62" fontSize="7" fill="#b08968">
          setback line
        </text>
      </svg>
      <p className="text-xs text-stone-400 leading-relaxed">
        Schematic only — upload a topo map or survey for a site plan based on your actual lot.
      </p>
    </div>
  );
}

// ─── EXTERIOR — pencil sketch from the House Design handoff ─────
function ExteriorPencilSketch({ sectionId }: { sectionId: string }) {
  const label = sketchPanelLabel(sectionId) ?? "Front elevation";
  // For the window section, also surface the close-up window+shutter
  // assembly alongside the full elevation so users can see the detail.
  const showDetail = sectionId === "windows";
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">
        {label} — pencil sketch
      </p>
      <div className="bg-[#f7f3e8] border border-stone-200 w-full aspect-[516/402] overflow-hidden flex items-center justify-center p-3">
        <StandaloneFrontElevationSideGable
          key={`sg-${sectionId}`}
          widthFt={39.4}
          wallHeightFt={20}
          pitch={9 / 12}
          buildingDepthFt={28}
        />
      </div>
      {showDetail && (
        <div className="bg-[#f7f3e8] border border-stone-200 w-full overflow-hidden">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-stone-400 border-b border-stone-200">
            3&prime;&times;6&prime; double-hung with louvered shutters
          </div>
          <div className="w-full aspect-square flex items-center justify-center p-3">
            <StandaloneAssembly widthFt={3} heightFt={6} shutterWidthIn={16} />
          </div>
        </div>
      )}
      <p className="text-xs text-stone-400 leading-relaxed">
        39&prime;-5&Prime; &times; 20&prime; wall, 9/12 side-gable, architectural asphalt shingles.
        Centered 6-panel door with four 3&prime;&times;6&prime; double-hungs flanking on the first
        floor and five 3&prime;&times;5&prime; double-hungs aligned above, all carrying louvered
        shutters.
      </p>
    </div>
  );
}

function sketchPanelLabel(sectionId: string): string | null {
  const map: Record<string, string> = {
    facade: "Facade",
    roof: "Roof",
    windows: "Windows",
    "exterior-doors": "Front entrance",
    "front-porch": "Front porch",
    portico: "Portico",
    "rear-porch": "Rear porch",
    "rear-door-awning": "Rear door awning",
    "side-door-awning": "Side door awning",
    garage: "Garage",
    chimney: "Chimney",
    hardscaping: "Hardscaping",
  };
  return map[sectionId] ?? null;
}

function buildSketchPrompt(
  group: QuizGroup,
  sectionId: string,
  sketchKey: string | undefined,
  answers: QuizAnswers
): string {
  const facade = ans(answers, "facade") || "brick";
  const paint = ans(answers, "exteriorPaint");
  const fascia = ans(answers, "fasciaMoulding");
  const roofShape = ans(answers, "roofShape") || "gable";
  const dormers = ans(answers, "dormers");
  const shingle = ans(answers, "shingleStyle");
  const gutters = ans(answers, "gutters");
  const windowStyle = ans(answers, "windowStyle");
  const shutters = ans(answers, "shutters");
  const headers = ans(answers, "windowHeadersFirstFloor");
  const sills = ans(answers, "windowSillsFirstFloor");
  const frontDoor = ans(answers, "frontDoorLevel");
  const sidelights = ans(answers, "sidelights") === "Yes";
  const transom = ans(answers, "transom");
  const frontPorch = ans(answers, "frontPorch");
  const portico = ans(answers, "portico");
  const rearPorch = ans(answers, "rearPorchSlabBasement");
  const garage = ans(answers, "garage");
  const garageDoor = ans(answers, "garageDoorLevel");
  const chimney = ans(answers, "chimneyFireplace") === "Yes";
  const fireplaceSurround = ans(answers, "fireplaceSurround");
  const driveway = ans(answers, "driveway");
  const walkway = ans(answers, "walkwayFromCurb");

  // Common exterior subject (used as scene base for exterior sections)
  const facadeDesc = paint && paint !== "None" ? `${facade} facade painted ${paint}` : `${facade} facade`;
  const exteriorScene = [
    `American colonial two-story house`,
    facadeDesc,
    `${roofShape} roof`,
    shingle ? `${shingle} shingles` : "",
    dormers && dormers !== "None" ? `${dormers} dormers` : "",
    fascia && fascia !== "None" ? `${fascia} fascia moulding` : "",
  ]
    .filter(Boolean)
    .join(", ");

  if (group === "exterior") {
    switch (sectionId) {
      case "facade":
        return `front elevation of an ${exteriorScene}, focused on facade details`;
      case "roof":
        return `${exteriorScene}, emphasizing ${roofShape} roof${
          dormers && dormers !== "None" ? ` with ${dormers} dormers` : ""
        }${gutters ? `, ${gutters} gutters` : ""}`;
      case "windows":
        return `${exteriorScene}, with ${windowStyle || "single hung"} windows${
          shutters && shutters !== "No" ? `, ${shutters} shutters` : ""
        }${headers ? `, ${headers} window headers` : ""}${sills ? `, ${sills} window sills` : ""}`;
      case "exterior-doors":
        return `close-up of a colonial front entrance, ${facadeDesc}, ${
          frontDoor || "wood"
        } six-panel front door${sidelights ? ", with sidelights" : ""}${
          transom && transom !== "None" ? `, ${transom} transom` : ""
        }`;
      case "front-porch":
        return `${exteriorScene}, with ${frontPorch || "concrete front porch"}`;
      case "portico":
        return `${exteriorScene}, with ${portico || "gable portico"} above front door`;
      case "rear-porch":
        return `rear elevation of an ${exteriorScene}, with ${rearPorch || "concrete rear porch"}`;
      case "rear-door-awning":
        return `rear elevation of an ${exteriorScene}, with ${
          ans(answers, "rearDoorAwningSlabBasement") || "shed roof"
        } awning over rear door`;
      case "side-door-awning":
        return `side elevation of an ${exteriorScene}, with ${
          ans(answers, "sideDoorAwningSlabBasement") || "shed roof"
        } awning over side door`;
      case "garage":
        return `${exteriorScene}, with ${garage || "two car attached garage"}, ${
          garageDoor || "wood"
        } garage doors`;
      case "chimney":
        return `${exteriorScene}${chimney ? ", with brick chimney" : ""}, interior fireplace with ${
          fireplaceSurround || "wood"
        } surround`;
      case "hardscaping":
        return `${exteriorScene}, ${driveway || "concrete driveway"}, ${
          walkway || "brick walkway"
        } from the curb, sod lawn, landscaped flowerbeds`;
      default:
        return `front elevation of an ${exteriorScene}`;
    }
  }

  // ── rooms ──
  const key = sketchKey ?? sectionId;
  const kitchenCabinet = ans(answers, "kitchenCabinetStyle");
  const kitchenMat = ans(answers, "kitchenCabinetMaterial");
  const kitchenCountertop = ans(answers, "kitchenCountertopMaterial");
  const backsplash = ans(answers, "kitchenBacksplash");
  const firstFloorFloor = ans(answers, "firstFloorFlooring");
  const bedroomFloor = ans(answers, "bedroomFlooring");
  const baluster = ans(answers, "balusters");
  const newel = ans(answers, "newels");
  const baseboard = ans(answers, "baseboard");
  const crown = ans(answers, "crownMolding");
  const doorQ = ans(answers, "doorQuality");

  switch (key) {
    case "whole-house":
      return `floor plan layout of a colonial two-story house, top-down view, room labels, including ${[
        ans(answers, "finishedThirdFloor") !== "None" ? "finished third floor" : "",
        ans(answers, "finishedBasement") === "Yes" ? "finished basement" : "",
        ans(answers, "sunroom") && ans(answers, "sunroom") !== "No" ? "sunroom" : "",
      ]
        .filter(Boolean)
        .join(", ") || "standard layout"}`;
    case "first-floor":
      return `first floor plan of a colonial house, top-down architectural drawing, ${
        firstFloorFloor || "oak"
      } hardwood floors, foyer, living room, dining room, kitchen, mudroom, powder bath`;
    case "second-floor":
      return `second floor plan of a colonial house, top-down architectural drawing, ${
        bedroomFloor || "oak"
      } bedroom floors, primary bedroom and bath, three bedrooms, hallway`;
    case "kitchen":
      return `interior view of a colonial kitchen, ${kitchenCabinet || "shaker"} ${
        kitchenMat || "wood"
      } cabinets, ${kitchenCountertop || "marble"} countertops, ${backsplash || "subway"} backsplash, island`;
    case "bath":
      return `interior view of a colonial bathroom, marble countertop vanity, mirror, toilet, tub and shower`;
    case "staircase":
      return `colonial interior staircase, ${baluster || "vase and column"} balusters, ${
        newel || "Federal"
      } newel post, oak handrail${
        ans(answers, "roundedStartingStep") === "Yes" ? ", rounded starting step" : ""
      }`;
    case "trim":
    case "trim-by-room":
      return `interior trim details, ${baseboard || "Federal"} baseboard, ${
        crown || "Federal"
      } crown molding, casing details, wainscoting`;
    case "interior-door":
      return `interior six-panel door, ${doorQ || "solidcore"}, ${
        ans(answers, "doorHardware") || "brass"
      } hardware, traditional colonial style`;
    case "built-ins":
      return `colonial built-in cabinetry and shelving in a living room, painted wood, flanking a fireplace`;
    case "lighting":
      return `interior colonial lighting fixtures: foyer chandelier, kitchen pendants, sconces, recessed lights`;
    default:
      return `colonial home interior detail`;
  }
}

function SketchedImage({ prompt, label }: { prompt: string; label: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const lastRequestedPrompt = useRef<string>("");

  useEffect(() => {
    const cached = cacheRef.current.get(prompt);
    if (cached) {
      setImageUrl(cached);
      setError(null);
      setLoading(false);
      lastRequestedPrompt.current = prompt;
      return;
    }

    const handle = setTimeout(() => {
      let cancelled = false;
      lastRequestedPrompt.current = prompt;
      setLoading(true);
      setError(null);
      fetch("/api/sketch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (cancelled) return;
          if (!res.ok || !data.imageUrl) {
            setError(data.error ?? "Failed to generate sketch");
            return;
          }
          cacheRef.current.set(prompt, data.imageUrl);
          if (lastRequestedPrompt.current === prompt) {
            setImageUrl(data.imageUrl);
          }
        })
        .catch((e) => {
          if (cancelled) return;
          setError(e instanceof Error ? e.message : "Failed to generate sketch");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, 900);

    return () => clearTimeout(handle);
  }, [prompt]);

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">
        {label} — hand sketch
      </p>
      <div className="relative bg-stone-50 border border-stone-200 aspect-square w-full overflow-hidden">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`${label} hand sketch`}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              loading ? "opacity-60" : "opacity-100"
            }`}
          />
        )}
        {!imageUrl && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-400">
            {loading ? "Sketching…" : "Preparing sketch…"}
          </div>
        )}
        {error && !imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-xs text-stone-500">
            Couldn&rsquo;t generate sketch: {error}
          </div>
        )}
        {loading && imageUrl && (
          <div className="absolute top-2 right-2 text-[10px] uppercase tracking-wider bg-white/80 px-2 py-1 text-stone-500 border border-stone-200">
            Updating…
          </div>
        )}
      </div>
      <p className="text-xs text-stone-400 leading-relaxed">
        AI-generated pencil sketch · regenerates as you change selections.
      </p>
    </div>
  );
}

// ─── helpers ───────────────────────────────────────────────────
function ans(answers: QuizAnswers, id: string): string {
  const v = answers[id];
  if (Array.isArray(v)) return v.join(",");
  return (v as string) ?? "";
}

function multiAns(answers: QuizAnswers, id: string): string[] {
  const v = answers[id];
  if (Array.isArray(v)) return v;
  return [];
}

/** Compass slope bearing → direction relative to the house front. */
function relativeSlopeDir(facing: string, slopeCompass: string): "front" | "rear" | "left" | "right" | "" {
  const order = ["North", "East", "South", "West"];
  const fi = order.indexOf(facing);
  const si = order.indexOf(slopeCompass);
  if (fi < 0 || si < 0) return "";
  const rel = (si - fi + 4) % 4;
  if (rel === 0) return "front";
  if (rel === 2) return "rear";
  if (rel === 1) return "right";
  return "left";
}

function facadeColor(answers: QuizAnswers): string {
  const f = ans(answers, "facade");
  const paint = ans(answers, "exteriorPaint");
  if (paint === "White") return "#f5f3ee";
  if (paint === "Cream") return "#ece2cf";
  if (paint === "Limewash") return "#d8cdb8";
  if (f === "Brick") return "#a8553f";
  if (f === "Cedar lap") return "#b7956a";
  if (f.startsWith("Hardiplank")) return "#cfc7b8";
  return "#bca887";
}

function roofColor(answers: QuizAnswers): string {
  const s = ans(answers, "shingleStyle");
  if (s === "Brava - composite slate") return "#3d3a3a";
  if (s === "Brava - cedar shake") return "#7a5a3a";
  if (s === "GAF - architectural") return "#4a4543";
  return "#5a5350";
}

// ─── STRUCTURAL ─────────────────────────────────────────────────
function StructuralSketch({ sectionId, answers }: { sectionId: string; answers: QuizAnswers }) {
  const foundationType = ans(answers, "foundationType");
  const slabDepth = ans(answers, "slabDepth");
  const stoneBase = ans(answers, "stoneBase");
  const crawl = ans(answers, "crawlspaceHeight");
  const firstFloorH = ans(answers, "firstFloorCeilingHeight");
  const secondFloorH = ans(answers, "secondFloorCeilingHeight");
  const extWall = ans(answers, "exteriorWall");
  const floorSystem = ans(answers, "floorSystem");
  const atticIns = ans(answers, "atticInsulation");

  // Height scaling
  const ch1 = firstFloorH.includes("10") ? 100 : firstFloorH.includes("9") ? 90 : 80;
  const ch2 = secondFloorH.includes("10") ? 100 : secondFloorH.includes("9") ? 90 : 80;

  // Foundation depth
  let foundationH = 30;
  if (foundationType === "Basement") foundationH = 90;
  else if (foundationType === "Crawlspace") foundationH = crawl === "3'" ? 36 : crawl === "2'" ? 24 : 20;
  else foundationH = slabDepth === "6 in" ? 12 : 8;

  const stoneH = stoneBase === "6in" ? 12 : 6;

  const wallThickness = extWall === "2x6" ? 8 : 5;

  // Drawing coordinates
  const totalH = 50 + ch2 + ch1 + foundationH + stoneH + 20;
  const W = 360;
  const cx = W / 2;

  const groundY = totalH - 40;
  const foundationTop = groundY - foundationH;
  const firstFloorBottom = foundationTop;
  const firstFloorTop = firstFloorBottom - ch1;
  const secondFloorTop = firstFloorTop - ch2;
  const roofPeakY = secondFloorTop - 50;

  const showFoundation = sectionId === "foundation";
  const showFraming = sectionId === "framing" || sectionId === "insulation";
  const showHVAC = sectionId === "hvac";

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Section view</p>
      <svg viewBox={`0 0 ${W} ${totalH}`} className="w-full h-auto bg-stone-50 border border-stone-200">
        {/* sky */}
        <rect x="0" y="0" width={W} height={groundY} fill="#fafaf7" />
        {/* ground */}
        <rect x="0" y={groundY} width={W} height={totalH - groundY} fill="#d8cfb6" />
        <line x1="0" y1={groundY} x2={W} y2={groundY} stroke="#7c7259" strokeWidth="1" />

        {/* roof */}
        <polygon
          points={`60,${secondFloorTop} ${cx},${roofPeakY} ${W - 60},${secondFloorTop}`}
          fill="#e8e2d2"
          stroke="#4a4543"
          strokeWidth="1"
        />
        {/* attic insulation */}
        {showFraming && atticIns && (
          <polygon
            points={`70,${secondFloorTop - 4} ${cx},${roofPeakY + 12} ${W - 70},${secondFloorTop - 4}`}
            fill="#f4d27a"
            opacity="0.55"
          />
        )}
        {showFraming && atticIns && (
          <text x={cx} y={secondFloorTop - 14} textAnchor="middle" fontSize="9" fill="#7a5a1a">
            Attic insul. {atticIns}
          </text>
        )}

        {/* second floor */}
        <rect x="60" y={secondFloorTop} width={W - 120} height={ch2} fill="#ffffff" stroke="#4a4543" />
        {/* wall thickness left/right */}
        <rect x="60" y={secondFloorTop} width={wallThickness} height={ch2} fill="#c8bda4" />
        <rect x={W - 60 - wallThickness} y={secondFloorTop} width={wallThickness} height={ch2} fill="#c8bda4" />
        <text x={cx} y={secondFloorTop + ch2 / 2 + 3} textAnchor="middle" fontSize="10" fill="#7a7158">
          2nd floor · {secondFloorH || "—"}
        </text>

        {/* floor system between */}
        <rect x="60" y={firstFloorTop} width={W - 120} height="8" fill="#a8956a" stroke="#4a4543" />
        {showFraming && floorSystem && (
          <text x={cx} y={firstFloorTop + 6} textAnchor="middle" fontSize="7" fill="#fff">
            {floorSystem}
          </text>
        )}

        {/* first floor */}
        <rect x="60" y={firstFloorTop + 8} width={W - 120} height={ch1 - 8} fill="#ffffff" stroke="#4a4543" />
        <rect x="60" y={firstFloorTop + 8} width={wallThickness} height={ch1 - 8} fill="#c8bda4" />
        <rect
          x={W - 60 - wallThickness}
          y={firstFloorTop + 8}
          width={wallThickness}
          height={ch1 - 8}
          fill="#c8bda4"
        />
        <text x={cx} y={firstFloorTop + 8 + (ch1 - 8) / 2 + 3} textAnchor="middle" fontSize="10" fill="#7a7158">
          1st floor · {firstFloorH || "—"}
        </text>

        {/* HVAC ducts */}
        {showHVAC && (
          <>
            <rect x={cx - 30} y={firstFloorTop + 12} width="60" height="6" fill="#9bb4d4" stroke="#4a4543" />
            <rect x={cx - 4} y={firstFloorTop + 18} width="8" height="20" fill="#9bb4d4" />
            <text x={cx} y={firstFloorTop + 32} textAnchor="middle" fontSize="8" fill="#3a4a6a">
              {ans(answers, "hvacSystem") || "HVAC"}
            </text>
          </>
        )}

        {/* foundation */}
        {foundationType === "Basement" ? (
          <>
            <rect
              x="55"
              y={foundationTop}
              width={W - 110}
              height={foundationH}
              fill="#cfc4ac"
              stroke="#4a4543"
            />
            <text x={cx} y={foundationTop + foundationH / 2 + 3} textAnchor="middle" fontSize="10" fill="#4a4543">
              Basement
            </text>
          </>
        ) : foundationType === "Crawlspace" ? (
          <>
            <rect x="55" y={foundationTop} width="10" height={foundationH} fill="#9d8e6a" stroke="#4a4543" />
            <rect
              x={W - 65}
              y={foundationTop}
              width="10"
              height={foundationH}
              fill="#9d8e6a"
              stroke="#4a4543"
            />
            <rect x="65" y={groundY - 6} width={W - 130} height="6" fill="#a8956a" />
            <text x={cx} y={foundationTop + foundationH / 2 + 3} textAnchor="middle" fontSize="9" fill="#4a4543">
              Crawlspace {crawl}
            </text>
          </>
        ) : (
          <>
            <rect
              x="55"
              y={foundationTop}
              width={W - 110}
              height={foundationH}
              fill="#bcb09a"
              stroke="#4a4543"
            />
            <text x={cx} y={foundationTop + foundationH / 2 + 3} textAnchor="middle" fontSize="9" fill="#4a4543">
              Slab {slabDepth}
            </text>
          </>
        )}

        {/* stone base */}
        {showFoundation && (
          <>
            <rect
              x="50"
              y={groundY}
              width={W - 100}
              height={stoneH}
              fill="#b4a98a"
              stroke="#4a4543"
              strokeDasharray="2 2"
            />
            <text x={cx} y={groundY + stoneH + 9} textAnchor="middle" fontSize="8" fill="#4a4543">
              Stone base {stoneBase}
            </text>
          </>
        )}

        {/* Wall thickness label */}
        {showFraming && (
          <text x={W - 70} y={firstFloorTop + 22} fontSize="9" fill="#7a7158" textAnchor="end">
            Wall: {extWall}
          </text>
        )}

        {/* Sheathing label */}
        {showFraming && ans(answers, "sheathing") && (
          <text x="70" y={firstFloorTop + 22} fontSize="9" fill="#7a7158">
            {ans(answers, "sheathing")}
          </text>
        )}
      </svg>
      <p className="text-xs text-stone-400 leading-relaxed">
        Cross-section updates as you change foundation, framing, insulation, and HVAC.
      </p>
    </div>
  );
}

// ─── STRUCTURAL DETAILS — architect-style detail drawings ───────
const DETAIL_OSB = "#b88a55";
const DETAIL_ZIP = "#3f7d4f";
const DETAIL_FOAM = "#e0938f";

function sheathingColor(sheath: string): string {
  if (sheath.includes("Zip")) return DETAIL_ZIP;
  if (sheath.includes("OSB")) return DETAIL_OSB;
  return "#d8cdb8";
}

/** Fiberglass-batt insulation fill: tinted block + squiggle — wall & attic. */
function Batt({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const lines: React.ReactNode[] = [];
  for (let yy = y + 4; yy < y + h - 1; yy += 6) {
    const pts: string[] = [];
    let up = true;
    for (let xx = x; xx <= x + w + 0.01; xx += 5) {
      pts.push(`${xx.toFixed(1)},${(up ? yy - 1.8 : yy + 1.8).toFixed(1)}`);
      up = !up;
    }
    lines.push(
      <polyline key={yy} points={pts.join(" ")} fill="none" stroke="#cf8d87" strokeWidth="0.5" />
    );
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#f4d8d4" />
      {lines}
    </g>
  );
}

/**
 * Horizontal "looking-down" plan cut through the exterior wall. Used on the
 * framing page (to show the 4″/6″ wall) and on the insulation page (with
 * cavities filled and an optional continuous exterior-foam layer).
 */
function WallPlanDetail({
  wall,
  sheath,
  insulated,
  exteriorFoam,
}: {
  wall: string;
  sheath: string;
  insulated: boolean;
  exteriorFoam: boolean;
}) {
  const chosen = wall === "2x4" || wall === "2x6";
  const studIn = wall === "2x6" ? 5.5 : 3.5;
  const PX = 7;
  const studPx = studIn * PX;
  const y0 = 42;
  const y1 = 132;
  const h = y1 - y0;

  let x = 38;
  const claddingX = x;
  const claddingW = 7;
  x += claddingW;
  const foamX = x;
  const foamW = exteriorFoam ? 9 : 0;
  x += foamW;
  const sheathX = x;
  const sheathW = 5;
  x += sheathW;
  const studX = x;
  x += studPx;
  const dryX = x;
  const dryW = 4;
  x += dryW;

  const studYs = [y0 + 5, (y0 + y1) / 2 - 5.5, y1 - 16];
  const caption = [
    chosen ? `${wall} @ 16″ o.c.` : "2x4 / 2x6",
    sheath || null,
    exteriorFoam ? "+ ext. foam" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <svg viewBox="0 0 200 160" className="w-full h-auto">
      <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
      <text x={claddingX} y={y0 - 16} fontSize="6" fill="#9b9286">
        exterior →
      </text>
      <text x={dryX + dryW} y={y0 - 16} fontSize="6" fill="#9b9286" textAnchor="end">
        ← interior
      </text>

      {/* cladding */}
      <rect x={claddingX} y={y0} width={claddingW} height={h} fill="#cdbfa6" stroke="#4a4543" strokeWidth="0.4" />
      {/* continuous exterior rigid foam */}
      {exteriorFoam && (
        <rect x={foamX} y={y0} width={foamW} height={h} fill={DETAIL_FOAM} stroke="#4a4543" strokeWidth="0.4" />
      )}
      {/* sheathing */}
      <rect x={sheathX} y={y0} width={sheathW} height={h} fill={sheathingColor(sheath)} stroke="#4a4543" strokeWidth="0.4" />
      {/* stud cavity (filled with batt on the insulation page) */}
      {insulated && <Batt x={studX} y={y0} w={studPx} h={h} />}
      <rect x={studX} y={y0} width={studPx} height={h} fill="none" stroke="#4a4543" strokeWidth="0.4" />
      {/* studs, cut */}
      {chosen &&
        studYs.map((sy) => (
          <rect key={sy} x={studX} y={sy} width={studPx} height={11} fill="#d9b886" stroke="#4a4543" strokeWidth="0.4" />
        ))}
      {/* drywall */}
      <rect x={dryX} y={y0} width={dryW} height={h} fill="#f0ece3" stroke="#4a4543" strokeWidth="0.4" />

      {/* stud-depth dimension */}
      <line x1={studX} y1={y0 - 9} x2={dryX} y2={y0 - 9} stroke="#7a7158" strokeWidth="0.4" />
      <line x1={studX} y1={y0 - 12} x2={studX} y2={y0 - 6} stroke="#7a7158" strokeWidth="0.4" />
      <line x1={dryX} y1={y0 - 12} x2={dryX} y2={y0 - 6} stroke="#7a7158" strokeWidth="0.4" />
      <text x={(studX + dryX) / 2} y={y0 - 11} fontSize="6.5" fill="#4a4543" textAnchor="middle">
        {chosen ? `${studIn}″` : "?"}
      </text>

      <text x="100" y="150" fontSize="7.5" fill="#7a7158" textAnchor="middle">
        {caption}
      </text>
    </svg>
  );
}

/** Panelized sheathing elevation: brown OSB or green Zip 4×8 sheets. */
function SheathingPanelDetail({ sheath }: { sheath: string }) {
  const isZip = sheath.includes("Zip");
  const chosen = isZip || sheath.includes("OSB");
  const color = sheathingColor(sheath);
  const x0 = 20;
  const y0 = 28;
  const cols = 4;
  const rows = 2;
  const cw = 160 / cols;
  const rh = 104 / rows;
  const panels: React.ReactNode[] = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const px = x0 + c * cw;
      const py = y0 + r * rh;
      panels.push(
        <g key={`${c}-${r}`}>
          <rect x={px + 1} y={py + 1} width={cw - 2} height={rh - 2} fill={chosen ? color : "#e7e2d6"} stroke="#4a4543" strokeWidth="0.4" />
          {isZip && <rect x={px + 1} y={py + 1} width={cw - 2} height="2.5" fill="#d8b13f" />}
          {!isZip &&
            chosen &&
            Array.from({ length: 5 }).map((_, i) => (
              <line key={i} x1={px + 3} y1={py + 8 + i * 8} x2={px + cw - 3} y2={py + 8 + i * 8} stroke="#9c6f3f" strokeWidth="0.3" />
            ))}
        </g>
      );
    }
  }
  return (
    <svg viewBox="0 0 200 160" className="w-full h-auto">
      <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
      <text x="100" y="20" fontSize="6" fill="#9b9286" textAnchor="middle">
        4′ × 8′ panels
      </text>
      {panels}
      <text x="100" y="150" fontSize="7.5" fill="#7a7158" textAnchor="middle">
        {chosen ? (isZip ? "7/16″ Zip System · taped seams" : "7/16″ OSB") : "select sheathing"}
      </text>
    </svg>
  );
}

/** Floor framing detail: engineered I-joists or open-web floor trusses. */
function FloorSystemDetail({ floorSystem }: { floorSystem: string }) {
  const isIJoist = floorSystem === "I-joists";
  const isTruss = floorSystem === "Engineered trusses";
  return (
    <svg viewBox="0 0 200 160" className="w-full h-auto">
      <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
      {/* subfloor */}
      <rect x="18" y="34" width="164" height="9" fill="#cba36b" stroke="#4a4543" strokeWidth="0.5" />
      <text x="100" y="29" fontSize="6" fill="#9b9286" textAnchor="middle">
        ¾″ subfloor
      </text>

      {isIJoist &&
        [40, 80, 120, 160].map((cx) => (
          <g key={cx}>
            <rect x={cx - 9} y="43" width="18" height="5" fill="#d9b886" stroke="#4a4543" strokeWidth="0.4" />
            <rect x={cx - 1.5} y="48" width="3" height="62" fill="#b88a55" stroke="#4a4543" strokeWidth="0.3" />
            <rect x={cx - 9} y="110" width="18" height="5" fill="#d9b886" stroke="#4a4543" strokeWidth="0.4" />
          </g>
        ))}

      {isTruss && (
        <g>
          <rect x="18" y="48" width="164" height="5" fill="#d9b886" stroke="#4a4543" strokeWidth="0.4" />
          <rect x="18" y="105" width="164" height="5" fill="#d9b886" stroke="#4a4543" strokeWidth="0.4" />
          {Array.from({ length: 8 }).map((_, i) => {
            const x = 22 + i * 20;
            return (
              <g key={i}>
                <line x1={x} y1="53" x2={x + 10} y2="105" stroke="#c5a06b" strokeWidth="2.4" />
                <line x1={x + 10} y1="105" x2={x + 20} y2="53" stroke="#c5a06b" strokeWidth="2.4" />
              </g>
            );
          })}
          <line x1="20" y1="50" x2="20" y2="108" stroke="#c5a06b" strokeWidth="2.4" />
          <line x1="180" y1="50" x2="180" y2="108" stroke="#c5a06b" strokeWidth="2.4" />
        </g>
      )}

      {!isIJoist && !isTruss && (
        <text x="100" y="82" fontSize="7" fill="#9b9286" textAnchor="middle">
          select a floor system
        </text>
      )}

      <text x="100" y="150" fontSize="7.5" fill="#7a7158" textAnchor="middle">
        {isIJoist ? "Engineered I-joists" : isTruss ? "Open-web floor trusses" : "I-joists / trusses"}
      </text>
    </svg>
  );
}

function FramingDetailSketch({ answers }: { answers: QuizAnswers }) {
  const wall = ans(answers, "exteriorWall");
  const sheath = ans(answers, "sheathing");
  const floorSystem = ans(answers, "floorSystem");
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Framing details</p>
      <ViewCard title="Exterior wall — plan detail (looking down)">
        <WallPlanDetail wall={wall} sheath={sheath} insulated={false} exteriorFoam={false} />
      </ViewCard>
      <div className="grid grid-cols-2 gap-3">
        <ViewCard title="Sheathing">
          <SheathingPanelDetail sheath={sheath} />
        </ViewCard>
        <ViewCard title="Floor system">
          <FloorSystemDetail floorSystem={floorSystem} />
        </ViewCard>
      </div>
      <p className="text-xs text-stone-400 leading-relaxed">
        Architect-style details — the wall thickness, sheathing panels, and floor system update as
        you make each selection.
      </p>
    </div>
  );
}

/** Interior elevation of a stud bay — drywall removed, cavities battable. */
function WallInteriorInsulationDetail({ insulated, rValue }: { insulated: boolean; rValue: string }) {
  const studs = [30, 72, 114, 156];
  const sw = 10;
  const studTop = 34;
  const studBot = 126;
  const bays: React.ReactNode[] = [];
  for (let i = 0; i < studs.length - 1; i++) {
    const bx = studs[i] + sw;
    const bw = studs[i + 1] - bx;
    bays.push(
      <g key={i}>
        {insulated && <Batt x={bx} y={studTop} w={bw} h={studBot - studTop} />}
        <rect x={bx} y={studTop} width={bw} height={studBot - studTop} fill="none" stroke="#4a4543" strokeWidth="0.3" />
      </g>
    );
  }
  return (
    <svg viewBox="0 0 200 160" className="w-full h-auto">
      <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
      <text x="100" y="16" fontSize="6" fill="#9b9286" textAnchor="middle">
        interior face · drywall removed to show cavities
      </text>
      {/* top & bottom plates */}
      <rect x="24" y="24" width="152" height="10" fill="#c5a06b" stroke="#4a4543" strokeWidth="0.4" />
      <rect x="24" y="126" width="152" height="10" fill="#c5a06b" stroke="#4a4543" strokeWidth="0.4" />
      {bays}
      {/* studs */}
      {studs.map((sx) => (
        <rect key={sx} x={sx} y={studTop} width={sw} height={studBot - studTop} fill="#d9b886" stroke="#4a4543" strokeWidth="0.4" />
      ))}
      <text x="100" y="150" fontSize="7.5" fill="#7a7158" textAnchor="middle">
        {insulated ? `Cavities filled · ${rValue} batt` : "select interior wall insulation"}
      </text>
    </svg>
  );
}

/** Close-up of roof trusses with attic insulation; depth grows with R-value. */
function AtticInsulationDetail({ rValue }: { rValue: string }) {
  const chosen = rValue !== "";
  const depth = rValue === "R-60" ? 50 : rValue === "R-50" ? 42 : rValue === "R-38" ? 32 : 26;
  const ceil = 120;
  const top = ceil - depth;
  return (
    <svg viewBox="0 0 200 160" className="w-full h-auto">
      <defs>
        <clipPath id="atticClip">
          <polygon points="22,120 100,30 178,120" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
      {/* ceiling drywall */}
      <rect x="22" y="120" width="156" height="5" fill="#f0ece3" stroke="#4a4543" strokeWidth="0.3" />
      {/* attic insulation, clipped to the truss profile */}
      {chosen && (
        <g clipPath="url(#atticClip)">
          <Batt x={18} y={top} w={164} h={depth} />
        </g>
      )}
      {/* roof truss: top chords, bottom chord, webs */}
      <line x1="20" y1="120" x2="100" y2="28" stroke="#c5a06b" strokeWidth="3" />
      <line x1="180" y1="120" x2="100" y2="28" stroke="#c5a06b" strokeWidth="3" />
      <line x1="20" y1="120" x2="180" y2="120" stroke="#c5a06b" strokeWidth="3" />
      <line x1="100" y1="28" x2="100" y2="120" stroke="#c5a06b" strokeWidth="1.4" />
      <line x1="100" y1="28" x2="60" y2="120" stroke="#c5a06b" strokeWidth="1.4" />
      <line x1="100" y1="28" x2="140" y2="120" stroke="#c5a06b" strokeWidth="1.4" />
      <text x="100" y="150" fontSize="7.5" fill="#7a7158" textAnchor="middle">
        {chosen ? `Attic insulation · ${rValue}` : "select attic insulation"}
      </text>
    </svg>
  );
}

function InsulationDetailSketch({ answers }: { answers: QuizAnswers }) {
  const wallIns = ans(answers, "interiorWallInsulation");
  const extIns = ans(answers, "exteriorInsulation");
  const atticIns = ans(answers, "atticInsulation");
  const wall = ans(answers, "exteriorWall");
  const sheath = ans(answers, "sheathing");
  const insulated = wallIns !== "";
  const exteriorFoam = extIns === "Yes";
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Insulation details</p>
      <ViewCard title="Wall cavity — interior view">
        <WallInteriorInsulationDetail insulated={insulated} rValue={wallIns} />
      </ViewCard>
      <div className="grid grid-cols-2 gap-3">
        <ViewCard title="Exterior wall — plan detail">
          <WallPlanDetail wall={wall} sheath={sheath} insulated={insulated} exteriorFoam={exteriorFoam} />
        </ViewCard>
        <ViewCard title="Attic / roof trusses">
          <AtticInsulationDetail rValue={atticIns} />
        </ViewCard>
      </div>
      <p className="text-xs text-stone-400 leading-relaxed">
        The stud cavities fill with batt insulation as you choose an R-value;{" "}
        {exteriorFoam
          ? "a continuous rigid-foam layer wraps the OSB beyond"
          : "turn on exterior insulation to add a continuous foam layer over the OSB"}
        , and the attic fills deeper as its R-value rises.
      </p>
    </div>
  );
}

// ─── EXTERIOR ───────────────────────────────────────────────────
function ExteriorElevations({ sectionId, answers }: { sectionId: string; answers: QuizAnswers }) {
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Elevations</p>
      <div className="grid grid-cols-2 gap-3">
        <Elevation side="front" answers={answers} sectionId={sectionId} />
        <Elevation side="left" answers={answers} sectionId={sectionId} />
        <Elevation side="right" answers={answers} sectionId={sectionId} />
        <Elevation side="back" answers={answers} sectionId={sectionId} />
      </div>
      <p className="text-xs text-stone-400 leading-relaxed">
        Front, left, right, back. Sketches respond to facade, roof, windows, doors, and porch selections.
      </p>
    </div>
  );
}

type Side = "front" | "left" | "right" | "back";

function Elevation({ side, answers, sectionId }: { side: Side; answers: QuizAnswers; sectionId: string }) {
  const W = 180;
  const H = 140;
  const facade = facadeColor(answers);
  const roof = roofColor(answers);
  const roofShape = ans(answers, "roofShape");
  const dormers = ans(answers, "dormers");
  const hasChimney = ans(answers, "chimneyFireplace") === "Yes";
  const shutters = ans(answers, "shutters");
  const garage = ans(answers, "garage");
  const frontPorch = ans(answers, "frontPorch");
  const portico = ans(answers, "portico");
  const sidelights = ans(answers, "sidelights") === "Yes";
  const transom = ans(answers, "transom");

  // Body
  const bodyX = 20;
  const bodyY = 55;
  const bodyW = W - 40;
  const bodyH = 65;
  const eaveY = bodyY;
  const peakY = side === "front" || side === "back" ? 20 : 18;

  // Highlight active feature
  const highlight: Record<string, boolean> = {
    facade: sectionId === "facade",
    roof: sectionId === "roof",
    windows: sectionId === "windows",
    doors: sectionId === "exterior-doors",
    porch: sectionId === "front-porch" || sectionId === "portico",
    rearPorch: sectionId === "rear-porch" || sectionId === "rear-door-awning",
    sideAwning: sectionId === "side-door-awning",
    garage: sectionId === "garage",
    chimney: sectionId === "chimney",
    hardscape: sectionId === "hardscaping",
  };

  function hl(key: keyof typeof highlight): string {
    return highlight[key] ? "#e8b04a" : "transparent";
  }

  // Roof rendering — front/back show gable face if Gable; hip is trapezoid
  function renderRoof() {
    if (side === "front" || side === "back") {
      if (roofShape === "Hip") {
        return (
          <polygon
            points={`${bodyX + 10},${eaveY} ${bodyX + bodyW - 10},${eaveY} ${bodyX + bodyW - 30},${peakY} ${bodyX + 30},${peakY}`}
            fill={roof}
            stroke={hl("roof")}
            strokeWidth={highlight.roof ? 2 : 0.5}
          />
        );
      }
      // Gable or gable-with-front-gable: show triangle gable face
      const peak = `${bodyX + bodyW / 2},${peakY}`;
      const main = (
        <polygon
          points={`${bodyX},${eaveY} ${bodyX + bodyW},${eaveY} ${peak}`}
          fill={facade}
          stroke="#4a4543"
          strokeWidth="0.5"
        />
      );
      // roof edge lines
      const edge = (
        <>
          <line x1={bodyX} y1={eaveY} x2={bodyX + bodyW / 2} y2={peakY} stroke={roof} strokeWidth="3" />
          <line
            x1={bodyX + bodyW}
            y1={eaveY}
            x2={bodyX + bodyW / 2}
            y2={peakY}
            stroke={roof}
            strokeWidth="3"
          />
        </>
      );
      const frontGable =
        side === "front" && roofShape === "Gable with front gable (Georgian style)" ? (
          <polygon
            points={`${bodyX + bodyW / 2 - 25},${eaveY} ${bodyX + bodyW / 2 + 25},${eaveY} ${bodyX + bodyW / 2},${eaveY - 30}`}
            fill={facade}
            stroke={roof}
            strokeWidth="1"
          />
        ) : null;
      return (
        <g style={{ stroke: hl("roof"), strokeWidth: highlight.roof ? 2 : 0 }}>
          {main}
          {edge}
          {frontGable}
        </g>
      );
    }
    // left / right side view: show roof slope as triangle/trapezoid
    if (roofShape === "Hip") {
      return (
        <polygon
          points={`${bodyX},${eaveY} ${bodyX + bodyW},${eaveY} ${bodyX + bodyW - 25},${peakY + 8} ${bodyX + 25},${peakY + 8}`}
          fill={roof}
          stroke={hl("roof")}
          strokeWidth={highlight.roof ? 2 : 0.5}
        />
      );
    }
    return (
      <polygon
        points={`${bodyX},${eaveY} ${bodyX + bodyW},${eaveY} ${bodyX + bodyW},${peakY + 8} ${bodyX},${peakY + 8}`}
        fill={roof}
        stroke={hl("roof")}
        strokeWidth={highlight.roof ? 2 : 0.5}
      />
    );
  }

  function renderDormers() {
    if (!dormers || dormers === "None") return null;
    if (side !== "front" && side !== "back") {
      // side view: small bumps on slope
      return (
        <g>
          <rect x={bodyX + 30} y={peakY + 12} width="14" height="10" fill={facade} stroke={roof} />
          <rect x={bodyX + bodyW - 44} y={peakY + 12} width="14" height="10" fill={facade} stroke={roof} />
        </g>
      );
    }
    // front/back: small dormer bumps on roof line
    const positions = [bodyX + 35, bodyX + bodyW / 2 - 8, bodyX + bodyW - 50];
    return (
      <g>
        {positions.map((x, i) => (
          <g key={i}>
            <rect x={x} y={eaveY - 18} width="16" height="14" fill={facade} stroke={roof} />
            {dormers === "Gable" && (
              <polygon points={`${x},${eaveY - 18} ${x + 16},${eaveY - 18} ${x + 8},${eaveY - 26}`} fill={roof} />
            )}
            {dormers === "Shed" && (
              <polygon points={`${x},${eaveY - 18} ${x + 16},${eaveY - 18} ${x + 16},${eaveY - 22}`} fill={roof} />
            )}
            <rect x={x + 4} y={eaveY - 14} width="8" height="8" fill="#cfe4f0" stroke="#4a4543" strokeWidth="0.4" />
          </g>
        ))}
      </g>
    );
  }

  function renderChimney() {
    if (!hasChimney) return null;
    const cx = side === "left" ? bodyX + 10 : side === "right" ? bodyX + bodyW - 18 : bodyX + bodyW - 30;
    return (
      <rect
        x={cx}
        y={peakY - 8}
        width="8"
        height={eaveY - peakY + 6}
        fill={facade}
        stroke={hl("chimney")}
        strokeWidth={highlight.chimney ? 1.5 : 0.5}
      />
    );
  }

  function renderBody() {
    return (
      <rect
        x={bodyX}
        y={bodyY}
        width={bodyW}
        height={bodyH}
        fill={facade}
        stroke={hl("facade")}
        strokeWidth={highlight.facade ? 2 : 0.6}
      />
    );
  }

  function renderFacadePattern() {
    const f = ans(answers, "facade");
    if (f.startsWith("Hardiplank") || f === "Cedar lap") {
      const lines = [];
      for (let y = bodyY + 8; y < bodyY + bodyH; y += 8) {
        lines.push(<line key={y} x1={bodyX} y1={y} x2={bodyX + bodyW} y2={y} stroke="#9b8a68" strokeWidth="0.3" />);
      }
      return <g>{lines}</g>;
    }
    if (f === "Brick") {
      const elements = [];
      for (let y = bodyY + 6; y < bodyY + bodyH; y += 6) {
        elements.push(<line key={y} x1={bodyX} y1={y} x2={bodyX + bodyW} y2={y} stroke="#8a4030" strokeWidth="0.2" />);
      }
      return <g>{elements}</g>;
    }
    return null;
  }

  // Windows + door on front
  function renderFront() {
    const winY1 = bodyY + 8; // 2nd floor
    const winY2 = bodyY + 38; // 1st floor (note our two stories are within bodyH; visual proxy)
    const winW = 10;
    const winH = 16;
    const windowXs = [bodyX + 16, bodyX + 40, bodyX + bodyW / 2 - winW / 2, bodyX + bodyW - 50, bodyX + bodyW - 26];
    const doorX = bodyX + bodyW / 2 - 7;
    const doorY = bodyY + 36;
    return (
      <g>
        {/* second story windows */}
        {windowXs.map((x, i) => (
          <Window key={`w2-${i}`} x={x} y={winY1} w={winW} h={winH} highlight={highlight.windows} answers={answers} shutterSide={!!shutters && shutters !== "No"} />
        ))}
        {/* first story windows (skip center where door is) */}
        {windowXs.map((x, i) =>
          i === 2 ? null : (
            <Window key={`w1-${i}`} x={x} y={winY2} w={winW} h={winH} highlight={highlight.windows} answers={answers} shutterSide={!!shutters && shutters !== "No"} />
          )
        )}
        {/* sidelights */}
        {sidelights && (
          <>
            <rect x={doorX - 5} y={doorY} width="4" height="16" fill="#cfe4f0" stroke="#4a4543" strokeWidth="0.4" />
            <rect x={doorX + 15} y={doorY} width="4" height="16" fill="#cfe4f0" stroke="#4a4543" strokeWidth="0.4" />
          </>
        )}
        {/* transom */}
        {transom && transom !== "None" && (
          <rect
            x={doorX - (sidelights ? 6 : 0)}
            y={doorY - 4}
            width={14 + (sidelights ? 12 : 0)}
            height="4"
            fill={transom === "Fanlight" ? "#d9eaf0" : "#cfe4f0"}
            stroke="#4a4543"
            strokeWidth="0.4"
          />
        )}
        {/* door */}
        <rect
          x={doorX}
          y={doorY}
          width="14"
          height="16"
          fill="#5a3a2a"
          stroke={hl("doors")}
          strokeWidth={highlight.doors ? 1.5 : 0.6}
        />
        {/* portico */}
        {portico && portico !== "None" && (
          <g>
            <rect
              x={doorX - 8}
              y={doorY - 10}
              width="30"
              height="4"
              fill="#e8e2d2"
              stroke={hl("porch")}
              strokeWidth={highlight.porch ? 1.5 : 0.5}
            />
            {portico.startsWith("Gable") && (
              <polygon
                points={`${doorX - 8},${doorY - 10} ${doorX + 22},${doorY - 10} ${doorX + 7},${doorY - 18}`}
                fill={roof}
                stroke={hl("porch")}
                strokeWidth={highlight.porch ? 1.5 : 0.5}
              />
            )}
            {portico.startsWith("Hip") && (
              <polygon
                points={`${doorX - 8},${doorY - 10} ${doorX + 22},${doorY - 10} ${doorX + 18},${doorY - 16} ${doorX - 4},${doorY - 16}`}
                fill={roof}
                stroke={hl("porch")}
                strokeWidth={highlight.porch ? 1.5 : 0.5}
              />
            )}
            <line x1={doorX - 8} y1={doorY - 6} x2={doorX - 8} y2={doorY + 16} stroke="#4a4543" strokeWidth="0.5" />
            <line x1={doorX + 22} y1={doorY - 6} x2={doorX + 22} y2={doorY + 16} stroke="#4a4543" strokeWidth="0.5" />
          </g>
        )}
        {/* front porch slab */}
        {frontPorch && frontPorch !== "None" && (
          <rect
            x={doorX - 14}
            y={doorY + 16}
            width="42"
            height="3"
            fill="#d8cfb6"
            stroke={hl("porch")}
            strokeWidth={highlight.porch ? 1.5 : 0.4}
          />
        )}
        {/* garage on front-load */}
        {garage === "2 car front load" && side === "front" && (
          <g>
            <rect
              x={bodyX + bodyW - 38}
              y={bodyY + 28}
              width="36"
              height="26"
              fill="#dcd2bf"
              stroke={hl("garage")}
              strokeWidth={highlight.garage ? 1.5 : 0.5}
            />
            <line x1={bodyX + bodyW - 20} y1={bodyY + 28} x2={bodyX + bodyW - 20} y2={bodyY + 54} stroke="#4a4543" strokeWidth="0.4" />
          </g>
        )}
      </g>
    );
  }

  function renderBack() {
    // Similar but with rear porch + patio door
    const winY1 = bodyY + 8;
    const winY2 = bodyY + 38;
    const winW = 10;
    const winH = 16;
    const xs = [bodyX + 16, bodyX + 36, bodyX + bodyW - 46, bodyX + bodyW - 26];
    const doorX = bodyX + bodyW / 2 - 16;
    const patioDoor = ans(answers, "patioDoor");
    const rearPorch = ans(answers, "rearPorchSlabBasement") || ans(answers, "rearPorchStemwall");
    return (
      <g>
        {xs.map((x, i) => (
          <Window key={`b2-${i}`} x={x} y={winY1} w={winW} h={winH} highlight={highlight.windows} answers={answers} shutterSide={false} />
        ))}
        {xs.map((x, i) => (
          <Window key={`b1-${i}`} x={x} y={winY2} w={winW} h={winH} highlight={highlight.windows} answers={answers} shutterSide={false} />
        ))}
        {/* patio door */}
        {patioDoor && patioDoor !== "None" ? (
          <rect
            x={doorX}
            y={winY2}
            width="32"
            height="16"
            fill="#bfd6e0"
            stroke={hl("doors")}
            strokeWidth={highlight.doors ? 1.5 : 0.5}
          />
        ) : (
          <rect
            x={doorX + 9}
            y={winY2}
            width="14"
            height="16"
            fill="#5a3a2a"
            stroke={hl("doors")}
            strokeWidth={highlight.doors ? 1.5 : 0.5}
          />
        )}
        {rearPorch && rearPorch !== "None" && (
          <rect
            x={bodyX + 20}
            y={bodyY + bodyH}
            width={bodyW - 40}
            height="5"
            fill="#cfc4ac"
            stroke={hl("rearPorch")}
            strokeWidth={highlight.rearPorch ? 1.5 : 0.4}
          />
        )}
        {ans(answers, "rearDoorAwningSlabBasement") &&
          ans(answers, "rearDoorAwningSlabBasement") !== "N/A" && (
            <rect
              x={doorX - 4}
              y={winY2 - 4}
              width="40"
              height="3"
              fill={roof}
              stroke={hl("rearPorch")}
              strokeWidth={highlight.rearPorch ? 1.5 : 0.4}
            />
          )}
      </g>
    );
  }

  function renderSide() {
    const winY1 = bodyY + 8;
    const winY2 = bodyY + 38;
    const winW = 10;
    const winH = 16;
    const xs = [bodyX + 16, bodyX + bodyW / 2 - 5, bodyX + bodyW - 26];
    const isLeft = side === "left";
    const sunroom = ans(answers, "sunroom");
    const sunOnLeft = sunroom === "Yes - left side";
    const sunOnRight = sunroom === "Yes - right side";
    const showSun = (isLeft && sunOnLeft) || (!isLeft && sunOnRight);
    const sideAwning = ans(answers, "sideDoorAwningSlabBasement");
    const showSideEntry = isLeft && ans(answers, "sideEntrance") === "Yes";
    return (
      <g>
        {xs.map((x, i) => (
          <Window key={`s2-${i}`} x={x} y={winY1} w={winW} h={winH} highlight={highlight.windows} answers={answers} shutterSide={false} />
        ))}
        {xs.map((x, i) => (
          <Window key={`s1-${i}`} x={x} y={winY2} w={winW} h={winH} highlight={highlight.windows} answers={answers} shutterSide={false} />
        ))}
        {showSideEntry && (
          <g>
            <rect
              x={bodyX + bodyW - 46}
              y={winY2}
              width="14"
              height="16"
              fill="#5a3a2a"
              stroke={hl("doors")}
              strokeWidth={highlight.doors ? 1.5 : 0.5}
            />
            {sideAwning && sideAwning !== "N/A" && (
              <rect
                x={bodyX + bodyW - 50}
                y={winY2 - 4}
                width="22"
                height="3"
                fill={roof}
                stroke={hl("sideAwning")}
                strokeWidth={highlight.sideAwning ? 1.5 : 0.4}
              />
            )}
          </g>
        )}
        {showSun && (
          <g>
            <rect
              x={isLeft ? bodyX - 18 : bodyX + bodyW - 2}
              y={bodyY + 30}
              width="20"
              height="30"
              fill="#cfe4f0"
              stroke="#4a4543"
              strokeWidth="0.5"
              opacity="0.9"
            />
            <text
              x={isLeft ? bodyX - 8 : bodyX + bodyW + 8}
              y={bodyY + 48}
              fontSize="6"
              fill="#4a4543"
              textAnchor="middle"
            >
              Sun
            </text>
          </g>
        )}
      </g>
    );
  }

  // Ground
  return (
    <div className="bg-white border border-stone-200 rounded-sm overflow-hidden">
      <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-stone-400 border-b border-stone-100">
        {side}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <rect x="0" y="0" width={W} height={H} fill="#f7f6f1" />
        {/* ground */}
        <rect x="0" y={bodyY + bodyH + 8} width={W} height={H} fill="#d8cfb6" />
        {ans(answers, "driveway") && side === "front" && highlight.hardscape && (
          <rect x={bodyX + 10} y={bodyY + bodyH + 8} width={bodyW - 20} height="6" fill="#9b9286" />
        )}
        {renderRoof()}
        {renderDormers()}
        {renderChimney()}
        {renderBody()}
        {renderFacadePattern()}
        {side === "front" && renderFront()}
        {side === "back" && renderBack()}
        {(side === "left" || side === "right") && renderSide()}
      </svg>
    </div>
  );
}

function Window({
  x,
  y,
  w,
  h,
  highlight,
  answers,
  shutterSide,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  highlight: boolean;
  answers: QuizAnswers;
  shutterSide: boolean;
}) {
  const sh = ans(answers, "shutters");
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="#d6e7ef"
        stroke={highlight ? "#e8b04a" : "#4a4543"}
        strokeWidth={highlight ? 1.4 : 0.4}
      />
      {/* grid */}
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#4a4543" strokeWidth="0.3" />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#4a4543" strokeWidth="0.3" />
      {shutterSide && sh && sh !== "No" && (
        <>
          <rect x={x - 3} y={y} width="3" height={h} fill={sh === "Louvered" ? "#3a4a3a" : "#5a3a2a"} />
          <rect x={x + w} y={y} width="3" height={h} fill={sh === "Louvered" ? "#3a4a3a" : "#5a3a2a"} />
        </>
      )}
    </g>
  );
}

// ─── ROOMS ──────────────────────────────────────────────────────
function RoomSketch({ sketchKey, answers }: { sketchKey: string; answers: QuizAnswers }) {
  switch (sketchKey) {
    case "whole-house":
      return <WholeHouseSketch answers={answers} />;
    case "first-floor":
      return <FloorPlanSketch floor="first" answers={answers} />;
    case "second-floor":
      return <FloorPlanSketch floor="second" answers={answers} />;
    case "kitchen":
      return <KitchenSketch answers={answers} />;
    case "bath":
      return <BathSketch answers={answers} />;
    case "staircase":
      return <StaircaseSketch answers={answers} />;
    case "trim":
    case "trim-by-room":
      return <TrimSketch answers={answers} sketchKey={sketchKey} />;
    case "interior-door":
      return <InteriorDoorSketch answers={answers} />;
    case "built-ins":
      return <BuiltInsSketch answers={answers} />;
    case "lighting":
      return <LightingSketch answers={answers} />;
    default:
      return <FloorPlanSketch floor="first" answers={answers} />;
  }
}

function ViewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-stone-200 rounded-sm overflow-hidden">
      <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-stone-400 border-b border-stone-100">
        {title}
      </div>
      {children}
    </div>
  );
}

function WholeHouseSketch({ answers }: { answers: QuizAnswers }) {
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Whole house</p>
      <div className="grid grid-cols-2 gap-3">
        <ViewCard title="1st floor">
          <FloorPlan floor="first" answers={answers} />
        </ViewCard>
        <ViewCard title="2nd floor">
          <FloorPlan floor="second" answers={answers} />
        </ViewCard>
        <ViewCard title="3rd floor / attic">
          <ThirdFloorPlan answers={answers} />
        </ViewCard>
        <ViewCard title="Basement">
          <BasementPlan answers={answers} />
        </ViewCard>
      </div>
    </div>
  );
}

function FloorPlanSketch({ floor, answers }: { floor: "first" | "second"; answers: QuizAnswers }) {
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">
        {floor === "first" ? "First floor" : "Second floor"}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <ViewCard title="Plan view">
          <FloorPlan floor={floor} answers={answers} />
        </ViewCard>
        <ViewCard title="Perspective">
          <FloorPerspective floor={floor} answers={answers} />
        </ViewCard>
      </div>
    </div>
  );
}

const W_PLAN = 200;
const H_PLAN = 160;

function FloorPlan({ floor, answers }: { floor: "first" | "second"; answers: QuizAnswers }) {
  // Stylized rectangular plan
  const sunroom = ans(answers, "sunroom");
  const garage = ans(answers, "garage");

  return (
    <svg viewBox={`0 0 ${W_PLAN} ${H_PLAN}`} className="w-full h-auto">
      <rect x="0" y="0" width={W_PLAN} height={H_PLAN} fill="#fafaf7" />
      {/* main body */}
      <rect x="20" y="20" width="160" height="120" fill="#ffffff" stroke="#4a4543" strokeWidth="1" />
      {floor === "first" ? (
        <>
          {/* foyer */}
          <rect x="80" y="100" width="40" height="40" fill="#f0ead8" stroke="#4a4543" strokeWidth="0.5" />
          <text x="100" y="125" textAnchor="middle" fontSize="7" fill="#7a7158">Foyer</text>
          {/* living */}
          <rect x="20" y="20" width="60" height="50" fill="#f5f0e0" stroke="#4a4543" strokeWidth="0.5" />
          <text x="50" y="48" textAnchor="middle" fontSize="7" fill="#7a7158">Living</text>
          {/* dining */}
          <rect x="120" y="20" width="60" height="50" fill="#f5f0e0" stroke="#4a4543" strokeWidth="0.5" />
          <text x="150" y="48" textAnchor="middle" fontSize="7" fill="#7a7158">Dining</text>
          {/* kitchen */}
          <rect x="120" y="70" width="60" height="40" fill="#e7eedf" stroke="#4a4543" strokeWidth="0.5" />
          <text x="150" y="92" textAnchor="middle" fontSize="7" fill="#7a7158">Kitchen</text>
          {/* mudroom */}
          <rect x="120" y="110" width="40" height="30" fill="#efe7d4" stroke="#4a4543" strokeWidth="0.5" />
          <text x="140" y="128" textAnchor="middle" fontSize="6" fill="#7a7158">Mud</text>
          {/* powder */}
          <rect x="160" y="110" width="20" height="30" fill="#e0e6ea" stroke="#4a4543" strokeWidth="0.5" />
          <text x="170" y="128" textAnchor="middle" fontSize="5" fill="#7a7158">PB</text>
          {/* office */}
          <rect x="20" y="70" width="60" height="40" fill="#f5f0e0" stroke="#4a4543" strokeWidth="0.5" />
          <text x="50" y="92" textAnchor="middle" fontSize="7" fill="#7a7158">Office</text>
          {/* stair */}
          <rect x="80" y="60" width="40" height="40" fill="#ece3cd" stroke="#4a4543" strokeWidth="0.5" />
          <line x1="80" y1="70" x2="120" y2="70" stroke="#7a7158" strokeWidth="0.3" />
          <line x1="80" y1="80" x2="120" y2="80" stroke="#7a7158" strokeWidth="0.3" />
          <line x1="80" y1="90" x2="120" y2="90" stroke="#7a7158" strokeWidth="0.3" />
          {/* sunroom */}
          {sunroom === "Yes - right side" && (
            <rect x="180" y="40" width="18" height="50" fill="#dceaf0" stroke="#4a4543" strokeWidth="0.5" />
          )}
          {sunroom === "Yes - left side" && (
            <rect x="2" y="40" width="18" height="50" fill="#dceaf0" stroke="#4a4543" strokeWidth="0.5" />
          )}
          {garage && garage !== "None" && (
            <>
              <rect x="180" y="100" width="18" height="40" fill="#e0d8c4" stroke="#4a4543" strokeWidth="0.5" />
              <text x="189" y="124" textAnchor="middle" fontSize="5" fill="#7a7158">Gar</text>
            </>
          )}
        </>
      ) : (
        <>
          {/* primary */}
          <rect x="20" y="20" width="80" height="60" fill="#f5f0e0" stroke="#4a4543" strokeWidth="0.5" />
          <text x="60" y="50" textAnchor="middle" fontSize="7" fill="#7a7158">Primary</text>
          {/* primary bath */}
          <rect x="20" y="80" width="40" height="30" fill="#e0e6ea" stroke="#4a4543" strokeWidth="0.5" />
          <text x="40" y="98" textAnchor="middle" fontSize="6" fill="#7a7158">Prim Bath</text>
          {/* closet */}
          <rect x="60" y="80" width="40" height="30" fill="#efe7d4" stroke="#4a4543" strokeWidth="0.5" />
          <text x="80" y="98" textAnchor="middle" fontSize="6" fill="#7a7158">Closet</text>
          {/* bed 1 */}
          <rect x="100" y="20" width="40" height="40" fill="#f5f0e0" stroke="#4a4543" strokeWidth="0.5" />
          <text x="120" y="42" textAnchor="middle" fontSize="6" fill="#7a7158">Bed 1</text>
          {/* bed 2 */}
          <rect x="140" y="20" width="40" height="40" fill="#f5f0e0" stroke="#4a4543" strokeWidth="0.5" />
          <text x="160" y="42" textAnchor="middle" fontSize="6" fill="#7a7158">Bed 2</text>
          {/* bed 3 */}
          <rect x="140" y="60" width="40" height="40" fill="#f5f0e0" stroke="#4a4543" strokeWidth="0.5" />
          <text x="160" y="82" textAnchor="middle" fontSize="6" fill="#7a7158">Bed 3</text>
          {/* baths */}
          <rect x="100" y="60" width="40" height="20" fill="#e0e6ea" stroke="#4a4543" strokeWidth="0.5" />
          <text x="120" y="73" textAnchor="middle" fontSize="5" fill="#7a7158">Bath 1</text>
          <rect x="100" y="80" width="40" height="20" fill="#e0e6ea" stroke="#4a4543" strokeWidth="0.5" />
          <text x="120" y="93" textAnchor="middle" fontSize="5" fill="#7a7158">Bath 2</text>
          {/* hall */}
          <rect x="100" y="100" width="80" height="20" fill="#ece3cd" stroke="#4a4543" strokeWidth="0.5" />
          <text x="140" y="113" textAnchor="middle" fontSize="6" fill="#7a7158">Hallway</text>
          {/* laundry */}
          <rect x="20" y="110" width="80" height="30" fill="#efe7d4" stroke="#4a4543" strokeWidth="0.5" />
          <text x="60" y="128" textAnchor="middle" fontSize="6" fill="#7a7158">Laundry</text>
          {/* stair */}
          <rect x="100" y="120" width="40" height="20" fill="#ece3cd" stroke="#4a4543" strokeWidth="0.5" />
          <line x1="100" y1="125" x2="140" y2="125" stroke="#7a7158" strokeWidth="0.3" />
          <line x1="100" y1="130" x2="140" y2="130" stroke="#7a7158" strokeWidth="0.3" />
          <line x1="100" y1="135" x2="140" y2="135" stroke="#7a7158" strokeWidth="0.3" />
        </>
      )}
    </svg>
  );
}

function FloorPerspective({ floor, answers }: { floor: "first" | "second"; answers: QuizAnswers }) {
  const floorMat = ans(answers, floor === "first" ? "firstFloorFlooring" : "bedroomFlooring");
  return (
    <svg viewBox="0 0 200 160" className="w-full h-auto">
      <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
      {/* room cube */}
      <polygon points="30,40 170,40 170,130 30,130" fill="#f3eedf" stroke="#4a4543" strokeWidth="0.6" />
      <polygon points="30,40 50,20 190,20 170,40" fill="#ffffff" stroke="#4a4543" strokeWidth="0.6" />
      <polygon points="170,40 190,20 190,110 170,130" fill="#e8e0c8" stroke="#4a4543" strokeWidth="0.6" />
      {/* floor */}
      <polygon points="30,130 170,130 190,150 50,150" fill={floorMat.includes("Carpet") ? "#c8b8a4" : floorMat.includes("marble") ? "#ece6dc" : "#a8794e"} stroke="#4a4543" strokeWidth="0.6" />
      {/* floor lines for plank */}
      {!floorMat.includes("Carpet") && !floorMat.includes("marble") && (
        <>
          <line x1="50" y1="140" x2="190" y2="140" stroke="#7a5a3a" strokeWidth="0.3" />
          <line x1="40" y1="135" x2="180" y2="135" stroke="#7a5a3a" strokeWidth="0.3" />
        </>
      )}
      <text x="100" y="78" textAnchor="middle" fontSize="8" fill="#7a7158">
        {floor === "first" ? "First floor" : "Second floor"} perspective
      </text>
      {floorMat && (
        <text x="100" y="92" textAnchor="middle" fontSize="7" fill="#9b9286">
          Floor: {floorMat}
        </text>
      )}
    </svg>
  );
}

function ThirdFloorPlan({ answers }: { answers: QuizAnswers }) {
  const third = ans(answers, "finishedThirdFloor");
  return (
    <svg viewBox="0 0 200 160" className="w-full h-auto">
      <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
      <polygon points="40,140 160,140 130,30 70,30" fill="#ffffff" stroke="#4a4543" strokeWidth="1" />
      {third === "Guest room, bathroom, and bonus room" && (
        <>
          <rect x="60" y="60" width="40" height="50" fill="#f5f0e0" stroke="#4a4543" strokeWidth="0.5" />
          <text x="80" y="88" textAnchor="middle" fontSize="6">Guest</text>
          <rect x="100" y="60" width="40" height="50" fill="#f5f0e0" stroke="#4a4543" strokeWidth="0.5" />
          <text x="120" y="88" textAnchor="middle" fontSize="6">Bonus</text>
          <rect x="100" y="110" width="20" height="20" fill="#e0e6ea" stroke="#4a4543" strokeWidth="0.5" />
          <text x="110" y="123" textAnchor="middle" fontSize="5">Bath</text>
        </>
      )}
      {third === "Bonus room only" && (
        <>
          <rect x="70" y="60" width="60" height="60" fill="#f5f0e0" stroke="#4a4543" strokeWidth="0.5" />
          <text x="100" y="92" textAnchor="middle" fontSize="7">Bonus</text>
        </>
      )}
      {(third === "None" || third === "") && (
        <text x="100" y="92" textAnchor="middle" fontSize="7" fill="#9b9286">Unfinished attic</text>
      )}
    </svg>
  );
}

function BasementPlan({ answers }: { answers: QuizAnswers }) {
  const fin = ans(answers, "finishedBasement");
  return (
    <svg viewBox="0 0 200 160" className="w-full h-auto">
      <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
      <rect x="20" y="20" width="160" height="120" fill={fin === "Yes" ? "#f5f0e0" : "#e6e0cf"} stroke="#4a4543" strokeWidth="1" />
      <text x="100" y="85" textAnchor="middle" fontSize="8" fill="#7a7158">
        {fin === "Yes" ? "Finished basement" : "Unfinished basement"}
      </text>
    </svg>
  );
}

function KitchenSketch({ answers }: { answers: QuizAnswers }) {
  const cabinetStyle = ans(answers, "kitchenCabinetStyle");
  const cabinetMat = ans(answers, "kitchenCabinetMaterial");
  const countertop = ans(answers, "kitchenCountertopMaterial");
  const layout = ans(answers, "kitchenLayout");
  const backsplash = ans(answers, "kitchenBacksplash");
  const fridge = ans(answers, "fridge");
  const builtIn = ans(answers, "builtInFridgeFreezer") === "Yes";

  const cabColor = cabinetMat === "Cherry" ? "#7a3f28" : cabinetMat === "Poplar" ? "#d8c5a4" : "#e8e2d2";
  const counterColor = countertop.includes("Soapstone") ? "#3a3a3a" : countertop.includes("Taj") ? "#d8c8a0" : "#ece6dc";

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Kitchen</p>
      <div className="grid grid-cols-2 gap-3">
        <ViewCard title="Plan view">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <rect x="20" y="20" width="160" height="120" fill="#ffffff" stroke="#4a4543" strokeWidth="1" />
            {/* perimeter cabinets */}
            <rect x="20" y="20" width="160" height="14" fill={cabColor} stroke="#4a4543" strokeWidth="0.4" />
            <rect x="20" y="20" width="14" height="120" fill={cabColor} stroke="#4a4543" strokeWidth="0.4" />
            <rect x="166" y="20" width="14" height="120" fill={cabColor} stroke="#4a4543" strokeWidth="0.4" />
            {/* island */}
            <rect x="60" y="80" width="80" height="30" fill={cabColor} stroke="#4a4543" strokeWidth="0.5" />
            <rect x="60" y="80" width="80" height="30" fill="none" stroke={counterColor} strokeWidth="2" />
            {/* range */}
            <rect x="90" y="22" width="20" height="10" fill="#3a3a3a" />
            {/* sink */}
            <rect x="76" y="84" width="20" height="14" fill="#bdc6ca" stroke="#4a4543" strokeWidth="0.4" />
            {/* fridge */}
            {builtIn || fridge === "Built-in separated" ? (
              <rect x="36" y="22" width="20" height="14" fill="#dcd6c8" stroke="#4a4543" strokeWidth="0.4" />
            ) : (
              <rect x="36" y="22" width="14" height="14" fill="#bdc6ca" stroke="#4a4543" strokeWidth="0.4" />
            )}
            {/* butler's pantry */}
            {layout === "Layout 1 (w/ butler's pantry)" && (
              <>
                <rect x="20" y="120" width="60" height="20" fill="#f0ead8" stroke="#4a4543" strokeWidth="0.5" />
                <text x="50" y="133" textAnchor="middle" fontSize="6" fill="#7a7158">Butler's</text>
              </>
            )}
          </svg>
        </ViewCard>
        <ViewCard title="Elevation">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            {/* wall */}
            <rect x="20" y="30" width="160" height="100" fill="#fbf6e9" stroke="#4a4543" strokeWidth="0.5" />
            {/* upper cabinets */}
            <rect x="30" y="45" width="50" height="30" fill={cabColor} stroke="#4a4543" strokeWidth="0.4" />
            <rect x="120" y="45" width="50" height="30" fill={cabColor} stroke="#4a4543" strokeWidth="0.4" />
            {/* range hood */}
            <polygon points="85,45 115,45 110,70 90,70" fill={cabColor} stroke="#4a4543" strokeWidth="0.4" />
            {/* backsplash */}
            <rect x="30" y="78" width="140" height="22" fill={backsplash ? "#ece6dc" : "#fbf6e9"} stroke="#4a4543" strokeWidth="0.3" />
            {backsplash === "Subway" &&
              Array.from({ length: 6 }).map((_, i) => (
                <line key={i} x1="30" y1={80 + i * 4} x2="170" y2={80 + i * 4} stroke="#bcb09a" strokeWidth="0.2" />
              ))}
            {/* counter */}
            <rect x="30" y="100" width="140" height="6" fill={counterColor} stroke="#4a4543" strokeWidth="0.4" />
            {/* lower cabinets */}
            <rect x="30" y="106" width="140" height="24" fill={cabColor} stroke="#4a4543" strokeWidth="0.4" />
            {/* cabinet style hint - vertical divisions */}
            {[50, 70, 90, 110, 130, 150].map((x) => (
              <line key={x} x1={x} y1="106" x2={x} y2="130" stroke="#4a4543" strokeWidth="0.3" />
            ))}
            {/* style flourish for arch/crown */}
            {cabinetStyle?.includes("Arch") && (
              <path d="M 35 55 Q 40 48 45 55" stroke="#4a4543" strokeWidth="0.4" fill="none" />
            )}
            <text x="100" y="148" textAnchor="middle" fontSize="7" fill="#7a7158">
              {cabinetStyle || "Cabinets"} · {cabinetMat || ""}
            </text>
          </svg>
        </ViewCard>
        <ViewCard title="Island detail">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <rect x="30" y="60" width="140" height="20" fill={ans(answers, "islandCountertops").includes("Butcher") ? "#a8794e" : counterColor} stroke="#4a4543" strokeWidth="0.4" />
            <rect x="30" y="80" width="140" height="40" fill={cabColor} stroke="#4a4543" strokeWidth="0.4" />
            {[60, 80, 100, 120, 140].map((x) => (
              <line key={x} x1={x} y1="80" x2={x} y2="120" stroke="#4a4543" strokeWidth="0.3" />
            ))}
            <text x="100" y="138" textAnchor="middle" fontSize="7" fill="#7a7158">
              Island · {ans(answers, "islandCountertops") || "—"}
            </text>
          </svg>
        </ViewCard>
        <ViewCard title="Materials">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <rect x="20" y="20" width="50" height="30" fill={cabColor} stroke="#4a4543" strokeWidth="0.4" />
            <text x="45" y="62" textAnchor="middle" fontSize="6" fill="#7a7158">Cabinet</text>
            <rect x="80" y="20" width="50" height="30" fill={counterColor} stroke="#4a4543" strokeWidth="0.4" />
            <text x="105" y="62" textAnchor="middle" fontSize="6" fill="#7a7158">Counter</text>
            <rect x="140" y="20" width="40" height="30" fill="#ece6dc" stroke="#4a4543" strokeWidth="0.4" />
            <text x="160" y="62" textAnchor="middle" fontSize="6" fill="#7a7158">Backsplash</text>
            <text x="100" y="100" textAnchor="middle" fontSize="7" fill="#7a7158">
              {countertop || "—"}
            </text>
            <text x="100" y="115" textAnchor="middle" fontSize="7" fill="#7a7158">
              {backsplash || "—"}
            </text>
          </svg>
        </ViewCard>
      </div>
    </div>
  );
}

function BathSketch({ answers }: { answers: QuizAnswers }) {
  const counter = ans(answers, "primaryBathCountertopMaterial");
  const counterColor = counter.includes("Soapstone") ? "#3a3a3a" : counter.includes("Taj") ? "#d8c8a0" : "#ece6dc";
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Bathrooms</p>
      <div className="grid grid-cols-2 gap-3">
        <ViewCard title="Plan view">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <rect x="20" y="20" width="160" height="120" fill="#ffffff" stroke="#4a4543" strokeWidth="1" />
            {/* tub */}
            <rect x="30" y="30" width="60" height="30" fill="#e6eef0" stroke="#4a4543" strokeWidth="0.5" />
            <text x="60" y="48" textAnchor="middle" fontSize="6" fill="#7a7158">Tub</text>
            {/* shower */}
            <rect x="100" y="30" width="60" height="40" fill="#cfdde0" stroke="#4a4543" strokeWidth="0.5" />
            <text x="130" y="52" textAnchor="middle" fontSize="6" fill="#7a7158">Shower</text>
            {/* double vanity */}
            <rect x="30" y="100" width="130" height="20" fill={counterColor} stroke="#4a4543" strokeWidth="0.5" />
            <circle cx="60" cy="110" r="5" fill="#fafaf7" stroke="#4a4543" strokeWidth="0.3" />
            <circle cx="130" cy="110" r="5" fill="#fafaf7" stroke="#4a4543" strokeWidth="0.3" />
            <text x="95" y="135" textAnchor="middle" fontSize="6" fill="#7a7158">Vanity</text>
            {/* toilet */}
            <rect x="160" y="100" width="14" height="20" fill="#ffffff" stroke="#4a4543" strokeWidth="0.4" />
            <text x="167" y="113" textAnchor="middle" fontSize="5" fill="#7a7158">WC</text>
          </svg>
        </ViewCard>
        <ViewCard title="Vanity elevation">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <rect x="20" y="40" width="160" height="80" fill="#fbf6e9" stroke="#4a4543" strokeWidth="0.5" />
            {/* mirrors */}
            <rect x="40" y="50" width="50" height="30" fill="#d8d8d8" stroke="#4a4543" strokeWidth="0.5" />
            <rect x="110" y="50" width="50" height="30" fill="#d8d8d8" stroke="#4a4543" strokeWidth="0.5" />
            {/* counter */}
            <rect x="30" y="90" width="140" height="5" fill={counterColor} stroke="#4a4543" strokeWidth="0.4" />
            {/* cabinet */}
            <rect x="30" y="95" width="140" height="30" fill="#d8c5a4" stroke="#4a4543" strokeWidth="0.4" />
            {[60, 100, 140].map((x) => (
              <line key={x} x1={x} y1="95" x2={x} y2="125" stroke="#4a4543" strokeWidth="0.3" />
            ))}
            <text x="100" y="140" textAnchor="middle" fontSize="7" fill="#7a7158">
              {counter || "Counter"}
            </text>
          </svg>
        </ViewCard>
        <ViewCard title="Shower elevation">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <rect x="40" y="30" width="120" height="100" fill="#e8eef0" stroke="#4a4543" strokeWidth="0.5" />
            <circle cx="100" cy="50" r="5" fill="#bdc6ca" stroke="#4a4543" strokeWidth="0.3" />
            <line x1="100" y1="55" x2="100" y2="120" stroke="#bdc6ca" strokeWidth="0.5" />
            {/* tile lines */}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1="40" y1={40 + i * 12} x2="160" y2={40 + i * 12} stroke="#bdc6ca" strokeWidth="0.2" />
            ))}
          </svg>
        </ViewCard>
        <ViewCard title="Mirror/Lighting">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <circle cx="100" cy="40" r="6" fill="#f4d27a" stroke="#4a4543" strokeWidth="0.4" />
            <rect x="60" y="60" width="80" height="50" fill="#d8d8d8" stroke="#4a4543" strokeWidth="0.5" />
            <text x="100" y="135" textAnchor="middle" fontSize="7" fill="#7a7158">
              Mirror & lighting
            </text>
          </svg>
        </ViewCard>
      </div>
    </div>
  );
}

function StaircaseSketch({ answers }: { answers: QuizAnswers }) {
  const balusters = ans(answers, "balusters");
  const newels = ans(answers, "newels");
  const rounded = ans(answers, "roundedStartingStep") === "Yes";

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Staircase</p>
      <div className="grid grid-cols-2 gap-3">
        <ViewCard title="Elevation">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            {/* steps */}
            {Array.from({ length: 10 }).map((_, i) => (
              <g key={i}>
                <rect x={30 + i * 13} y={130 - i * 11} width="13" height="11" fill="#c8a878" stroke="#4a4543" strokeWidth="0.3" />
                {/* baluster */}
                <line
                  x1={36 + i * 13}
                  y1={130 - i * 11 - 2}
                  x2={36 + i * 13}
                  y2={130 - i * 11 - 22}
                  stroke="#4a4543"
                  strokeWidth={balusters?.includes("2 Balustrades") ? 0.4 : 0.6}
                />
                {balusters?.includes("2 Balustrades") && (
                  <line
                    x1={40 + i * 13}
                    y1={130 - i * 11 - 2}
                    x2={40 + i * 13}
                    y2={130 - i * 11 - 22}
                    stroke="#4a4543"
                    strokeWidth="0.4"
                  />
                )}
                {balusters?.includes("Vase") && (
                  <circle cx={36 + i * 13} cy={130 - i * 11 - 12} r="2" fill="#4a4543" />
                )}
              </g>
            ))}
            {/* handrail */}
            <line x1="30" y1="108" x2="165" y2="-2" stroke="#7a3f28" strokeWidth="2" />
            {/* newel */}
            <rect x="22" y="100" width="8" height="38" fill="#7a3f28" stroke="#4a4543" strokeWidth="0.4" />
            {/* rounded starting step */}
            {rounded && (
              <ellipse cx="36" cy="141" rx="14" ry="5" fill="#c8a878" stroke="#4a4543" strokeWidth="0.4" />
            )}
            <text x="100" y="152" textAnchor="middle" fontSize="6" fill="#7a7158">
              {balusters || "Balusters"} · {newels || "Newels"}
            </text>
          </svg>
        </ViewCard>
        <ViewCard title="Plan view">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <rect x="60" y="20" width="80" height="120" fill="#ffffff" stroke="#4a4543" strokeWidth="0.6" />
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={i} x1="60" y1={28 + i * 10} x2="140" y2={28 + i * 10} stroke="#7a7158" strokeWidth="0.3" />
            ))}
            {rounded && <ellipse cx="100" cy="138" rx="32" ry="6" fill="none" stroke="#4a4543" strokeWidth="0.5" />}
          </svg>
        </ViewCard>
        <ViewCard title="Newel detail">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <rect x="90" y="40" width="20" height="100" fill="#7a3f28" stroke="#4a4543" strokeWidth="0.4" />
            <rect x="86" y="36" width="28" height="8" fill="#7a3f28" stroke="#4a4543" strokeWidth="0.4" />
            <rect x="86" y="136" width="28" height="8" fill="#7a3f28" stroke="#4a4543" strokeWidth="0.4" />
            <text x="100" y="155" textAnchor="middle" fontSize="6" fill="#7a7158">
              {newels || "Newel"}
            </text>
          </svg>
        </ViewCard>
        <ViewCard title="Baluster detail">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <line x1="100" y1="20" x2="100" y2="140" stroke="#4a4543" strokeWidth="3" />
            {balusters?.includes("Vase") && (
              <>
                <ellipse cx="100" cy="80" rx="10" ry="14" fill="#d8c5a4" stroke="#4a4543" strokeWidth="0.5" />
                <rect x="95" y="50" width="10" height="6" fill="#d8c5a4" stroke="#4a4543" strokeWidth="0.4" />
              </>
            )}
            {balusters?.includes("Square") && (
              <rect x="94" y="40" width="12" height="100" fill="#d8c5a4" stroke="#4a4543" strokeWidth="0.4" />
            )}
            <text x="100" y="155" textAnchor="middle" fontSize="6" fill="#7a7158">
              {balusters || "Baluster"}
            </text>
          </svg>
        </ViewCard>
      </div>
    </div>
  );
}

function TrimSketch({ answers, sketchKey }: { answers: QuizAnswers; sketchKey: string }) {
  const baseboard = ans(answers, "baseboard");
  const crown = ans(answers, "crownMolding");
  const tbrKitchen = multiAns(answers, "kitchenTrimByRoom");
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Trim</p>
      <div className="grid grid-cols-2 gap-3">
        <ViewCard title="Wall section">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <rect x="20" y="10" width="160" height="140" fill="#fbf6e9" stroke="#4a4543" strokeWidth="0.5" />
            {/* crown */}
            <rect x="20" y="10" width="160" height={crown ? 10 : 4} fill="#e8e2d2" stroke="#4a4543" strokeWidth="0.5" />
            <text x="100" y="25" textAnchor="middle" fontSize="6" fill="#7a7158">Crown: {crown || "—"}</text>
            {/* chair rail */}
            {(sketchKey === "trim-by-room" && tbrKitchen.includes("Chair rail")) ||
            ans(answers, "diningRoomTrimDetail") ? (
              <rect x="20" y="78" width="160" height="4" fill="#e8e2d2" stroke="#4a4543" strokeWidth="0.4" />
            ) : null}
            {/* wainscoting */}
            {sketchKey === "trim-by-room" && tbrKitchen.includes("Wainscoting") && (
              <rect x="20" y="82" width="160" height="50" fill="#f0ead8" stroke="#4a4543" strokeWidth="0.3" />
            )}
            {/* baseboard */}
            <rect x="20" y="132" width="160" height={baseboard ? 18 : 8} fill="#e8e2d2" stroke="#4a4543" strokeWidth="0.5" />
            <text x="100" y="148" textAnchor="middle" fontSize="6" fill="#7a7158">Base: {baseboard || "—"}</text>
          </svg>
        </ViewCard>
        <ViewCard title="Door & casing">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <rect x="60" y="30" width="80" height="120" fill="#fbf6e9" stroke="#4a4543" strokeWidth="0.5" />
            {/* casing */}
            <rect x="55" y="25" width="90" height="6" fill="#e8e2d2" stroke="#4a4543" strokeWidth="0.4" />
            <rect x="55" y="25" width="6" height="125" fill="#e8e2d2" stroke="#4a4543" strokeWidth="0.4" />
            <rect x="139" y="25" width="6" height="125" fill="#e8e2d2" stroke="#4a4543" strokeWidth="0.4" />
            {/* door panels */}
            <rect x="68" y="40" width="64" height="20" fill="#fafaf7" stroke="#4a4543" strokeWidth="0.3" />
            <rect x="68" y="62" width="64" height="20" fill="#fafaf7" stroke="#4a4543" strokeWidth="0.3" />
            <rect x="68" y="84" width="28" height="60" fill="#fafaf7" stroke="#4a4543" strokeWidth="0.3" />
            <rect x="104" y="84" width="28" height="60" fill="#fafaf7" stroke="#4a4543" strokeWidth="0.3" />
            <text x="100" y="155" textAnchor="middle" fontSize="6" fill="#7a7158">
              {ans(answers, "doorCasings") || "Casing"}
            </text>
          </svg>
        </ViewCard>
      </div>
    </div>
  );
}

function InteriorDoorSketch({ answers }: { answers: QuizAnswers }) {
  const quality = ans(answers, "doorQuality");
  const hardware = ans(answers, "doorHardware");
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Interior door</p>
      <div className="grid grid-cols-1 gap-3">
        <ViewCard title="6-panel door">
          <svg viewBox="0 0 200 240" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="240" fill="#fafaf7" />
            <rect x="40" y="20" width="120" height="200" fill="#e8d8b8" stroke="#4a4543" strokeWidth="0.8" />
            {/* 6 panels */}
            <rect x="52" y="32" width="44" height="50" fill="#fafaf7" stroke="#4a4543" strokeWidth="0.4" />
            <rect x="104" y="32" width="44" height="50" fill="#fafaf7" stroke="#4a4543" strokeWidth="0.4" />
            <rect x="52" y="86" width="44" height="50" fill="#fafaf7" stroke="#4a4543" strokeWidth="0.4" />
            <rect x="104" y="86" width="44" height="50" fill="#fafaf7" stroke="#4a4543" strokeWidth="0.4" />
            <rect x="52" y="140" width="44" height="70" fill="#fafaf7" stroke="#4a4543" strokeWidth="0.4" />
            <rect x="104" y="140" width="44" height="70" fill="#fafaf7" stroke="#4a4543" strokeWidth="0.4" />
            {/* hardware */}
            <circle cx="148" cy="130" r="3" fill={hardware?.includes("brass") ? "#c79b3a" : "#7a5a3a"} />
            <text x="100" y="232" textAnchor="middle" fontSize="7" fill="#7a7158">
              {quality || "—"} · {hardware || "—"}
            </text>
          </svg>
        </ViewCard>
      </div>
    </div>
  );
}

function BuiltInsSketch({ answers }: { answers: QuizAnswers }) {
  const livingRoom = ans(answers, "livingRoomBuiltIns") === "Yes";
  const mudRoom = ans(answers, "mudRoomBuiltIns") === "Yes";
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Built-ins</p>
      <div className="grid grid-cols-2 gap-3">
        <ViewCard title="Living room">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <rect x="20" y="20" width="160" height="120" fill="#fbf6e9" stroke="#4a4543" strokeWidth="0.5" />
            {livingRoom && (
              <>
                <rect x="30" y="40" width="60" height="90" fill="#e8d8b8" stroke="#4a4543" strokeWidth="0.5" />
                {[55, 70, 85, 100, 115].map((y) => (
                  <line key={y} x1="30" y1={y} x2="90" y2={y} stroke="#4a4543" strokeWidth="0.3" />
                ))}
                <rect x="110" y="40" width="60" height="90" fill="#e8d8b8" stroke="#4a4543" strokeWidth="0.5" />
                {[55, 70, 85, 100, 115].map((y) => (
                  <line key={y} x1="110" y1={y} x2="170" y2={y} stroke="#4a4543" strokeWidth="0.3" />
                ))}
              </>
            )}
            <text x="100" y="155" textAnchor="middle" fontSize="7" fill="#7a7158">
              Living: {livingRoom ? "Yes" : "No"}
            </text>
          </svg>
        </ViewCard>
        <ViewCard title="Mud room">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <rect x="20" y="20" width="160" height="120" fill="#fbf6e9" stroke="#4a4543" strokeWidth="0.5" />
            {mudRoom && (
              <>
                <rect x="30" y="40" width="140" height="90" fill="#e8d8b8" stroke="#4a4543" strokeWidth="0.5" />
                {[40, 75, 110, 145].map((x) => (
                  <line key={x} x1={x} y1="40" x2={x} y2="130" stroke="#4a4543" strokeWidth="0.3" />
                ))}
                {[58, 92, 126].map((x) => (
                  <circle key={x} cx={x} cy="70" r="2" fill="#7a5a3a" />
                ))}
              </>
            )}
            <text x="100" y="155" textAnchor="middle" fontSize="7" fill="#7a7158">
              Mud: {mudRoom ? "Yes" : "No"}
            </text>
          </svg>
        </ViewCard>
      </div>
    </div>
  );
}

function LightingSketch({ answers }: { answers: QuizAnswers }) {
  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-[0.15em] text-stone-400">Lighting</p>
      <div className="grid grid-cols-2 gap-3">
        <ViewCard title="1st floor reflected ceiling plan">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <rect x="20" y="20" width="160" height="120" fill="#ffffff" stroke="#4a4543" strokeWidth="0.6" />
            {[50, 100, 150].map((x) =>
              [50, 80, 110].map((y) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="#f4d27a" stroke="#4a4543" strokeWidth="0.3" />
              ))
            )}
            <circle cx="100" cy="50" r="6" fill="#f4d27a" stroke="#4a4543" strokeWidth="0.5" />
            <text x="100" y="155" textAnchor="middle" fontSize="6" fill="#7a7158">
              {ans(answers, "foyerLightFixture") ? `Foyer: ${ans(answers, "foyerLightFixture")}` : "Foyer fixture"}
            </text>
          </svg>
        </ViewCard>
        <ViewCard title="Exterior lights">
          <svg viewBox="0 0 200 160" className="w-full h-auto">
            <rect x="0" y="0" width="200" height="160" fill="#fafaf7" />
            <rect x="40" y="50" width="120" height="80" fill="#dcd2bf" stroke="#4a4543" strokeWidth="0.5" />
            <circle cx="70" cy="100" r="3" fill="#f4d27a" />
            <circle cx="130" cy="100" r="3" fill="#f4d27a" />
            <text x="100" y="148" textAnchor="middle" fontSize="6" fill="#7a7158">
              Front porch & garage
            </text>
          </svg>
        </ViewCard>
      </div>
    </div>
  );
}
