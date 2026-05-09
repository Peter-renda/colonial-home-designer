"use client";

import { Preferences } from "../types";

/**
 * Type-safe field metadata. The `key` is a Preferences key, and `options`
 * are the exact string literals from that key's union type. TypeScript will
 * yell at you if you typo an option.
 */
type FieldDef<K extends keyof Preferences> = {
  key: K;
  label: string;
  options: readonly Preferences[K][];
};

function field<K extends keyof Preferences>(
  key: K,
  label: string,
  options: readonly Preferences[K][],
): FieldDef<K> {
  return { key, label, options };
}

const SECTIONS = [
  {
    title: "Foundation",
    fields: [
      field("foundationType", "Foundation type", ["Slab on grade", "Stemwall", "Basement"] as const),
      field("slabDepth", "Slab depth", ["4 in", "6 in"] as const),
      field("stoneBase", "Stone base", ["3in", "6in"] as const),
      field("foundationSideInsulation", "Side insulation", ["Yes", "No"] as const),
      field("foundationBottomInsulation", "Bottom insulation", ["Yes (R5)", "No"] as const),
      field("crawlspace", "Crawlspace", ["Yes", "No"] as const),
    ],
  },
  {
    title: "Framing",
    fields: [
      field("firstFloorCeilingHeight", "1st floor ceiling", ["8' Ceiling", "9' Ceiling", "10' Ceiling"] as const),
      field("secondFloorCeilingHeight", "2nd floor ceiling", ["8' Ceiling", "9' Ceiling", "10' Ceiling"] as const),
      field("sheathing", "Sheathing", ["7/16 OSB", "7/16 Zip System"] as const),
      field("exteriorWall", "Exterior wall", ["2x4", "2x6"] as const),
      field("floorSystem", "Floor system", ["Engineered trusses", "I-joists", "Dimensional lumber"] as const),
    ],
  },
  {
    title: "Roof",
    fields: [
      field("roofShape", "Roof shape", ["Gable", "Hip"] as const),
      field("dormers", "Dormers", ["Gable", "Shed", "Hip", "None"] as const),
      field("gutters", "Gutters", ["4 in aluminum", "5 in aluminum", "6 in copper", "None"] as const),
      field("shingleStyle", "Shingles", ["GAF - architectural", "Brava - composite slate", "Brava - cedar shake"] as const),
      field("snowguards", "Snowguards", ["Snowbird - black", "Snowbird - copper", "None"] as const),
      field("rafterTails", "Rafter tails", ["Yes", "No"] as const),
    ],
  },
  {
    title: "Facade",
    fields: [
      field("facade", "Facade material", ["Brick", "Hardiplank - beaded", "Hardiplank - flat", "Cedar lap"] as const),
      field("exteriorPaint", "Exterior paint", ["Yes", "No"] as const),
      field("cornice", "Cornice", ["Cornice with Dentil", "Plain cornice", "None"] as const),
    ],
  },
  {
    title: "Windows",
    fields: [
      field("windowStyle", "Window style", ["Single hung with grid", "Single hung no grid", "Casement"] as const),
      field("windowLevel", "Window level", ["Vinyl", "Wood-clad", "Aluminum-clad"] as const),
      field("shutters", "Shutters", ["Yes - Louvered", "Yes - Raised panel", "No"] as const),
    ],
  },
  {
    title: "Garage",
    fields: [
      field("garage", "Garage", ["2 car side load", "2 car front load", "3 car side load", "3 car front load", "None"] as const),
      field("garageDoorLevel", "Garage door level", ["wood", "steel", "aluminum-glass"] as const),
      field("sideEntrance", "Side entrance", ["Yes", "No"] as const),
      field("raftersOverGarageDoors", "Rafters over garage doors", ["Yes", "No"] as const),
    ],
  },
] as const;

interface Props {
  value: Preferences;
  onChange: (next: Preferences) => void;
}

export default function PreferencesForm({ value, onChange }: Props) {
  return (
    <div className="space-y-8">
      {SECTIONS.map((section) => (
        <section key={section.title} className="border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-4">{section.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((f) => (
              <label key={String(f.key)} className="flex flex-col text-sm">
                <span className="text-gray-600 mb-1">{f.label}</span>
                <select
                  className="border rounded px-2 py-1.5 bg-white"
                  value={value[f.key] as string}
                  onChange={(e) =>
                    onChange({ ...value, [f.key]: e.target.value })
                  }
                >
                  {f.options.map((opt) => (
                    <option key={String(opt)} value={String(opt)}>
                      {String(opt)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
