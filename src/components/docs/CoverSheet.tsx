import { QuizAnswers } from "../../types/quiz";
import { COLONIAL_MODEL_1 } from "../../data/colonialModel1";
import { HouseParams } from "../../lib/houseParams";
import SheetFrame from "./SheetFrame";

interface Props {
  params: HouseParams;
  answers: QuizAnswers;
  style: string;
  budget: string;
}

const SHEET_INDEX = [
  ["G-001", "Cover Sheet & Specifications"],
  ["A-101", "First Floor Plan"],
  ["A-102", "Second Floor Plan"],
  ["A-201", "Exterior Elevations"],
];

function ans(answers: QuizAnswers, id: string): string {
  const v = answers[id];
  if (Array.isArray(v)) return v.join(", ");
  return (v as string) ?? "";
}

export default function CoverSheet({ params, answers, style, budget }: Props) {
  const specs: [string, string][] = [
    ["Foundation", ans(answers, "foundationType")],
    ["Exterior walls", ans(answers, "exteriorWall")],
    ["1st floor ceiling", ans(answers, "firstFloorCeilingHeight")],
    ["2nd floor ceiling", ans(answers, "secondFloorCeilingHeight")],
    ["Facade", ans(answers, "facade")],
    ["Exterior paint", ans(answers, "exteriorPaint")],
    ["Roof shape", ans(answers, "roofShape")],
    ["Roof pitch", `${params.roofPitch}/12`],
    ["Shingles", ans(answers, "shingleStyle")],
    ["Dormers", ans(answers, "dormers")],
    ["Windows", ans(answers, "windowLevel")],
    ["Shutters", ans(answers, "shutters")],
    ["Front door", ans(answers, "frontDoorLevel")],
    ["Portico", ans(answers, "portico")],
    ["Garage", ans(answers, "garage")],
    ["HVAC", ans(answers, "hvacSystem")],
  ].filter(([, v]) => v !== "") as [string, string][];

  return (
    <SheetFrame sheetNo="G-001" title="Cover Sheet" style={style} scale="Scale: NTS">
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-2">
            A new single-family residence
          </p>
          <h2 className="text-4xl font-light tracking-wide text-stone-800 mb-1">
            COLONIAL MODEL 1
          </h2>
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500 mb-6">
            {style} Colonial Revival{budget ? ` · ${budget}` : ""}
          </p>

          <table className="w-full text-xs mb-6">
            <tbody>
              <tr className="border-y border-stone-300">
                <td className="py-1.5 text-stone-500">Footprint</td>
                <td className="py-1.5 text-right text-stone-800">
                  {params.widthFt}&prime;-0&Prime; × {params.depthFt}&prime;-0&Prime;
                </td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-1.5 text-stone-500">First floor area</td>
                <td className="py-1.5 text-right text-stone-800">
                  {COLONIAL_MODEL_1.firstFloorSqFt.toLocaleString()} SF
                </td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-1.5 text-stone-500">Second floor area</td>
                <td className="py-1.5 text-right text-stone-800">
                  {COLONIAL_MODEL_1.secondFloorSqFt.toLocaleString()} SF
                </td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="py-1.5 text-stone-500">Third floor / attic</td>
                <td className="py-1.5 text-right text-stone-800">
                  {COLONIAL_MODEL_1.thirdFloorSqFt.toLocaleString()} SF
                  {params.finishedThirdFloor ? " (finished)" : " (unfinished)"}
                </td>
              </tr>
              <tr className="border-b border-stone-300">
                <td className="py-1.5 text-stone-500 font-medium">Total area</td>
                <td className="py-1.5 text-right text-stone-800 font-medium">
                  {COLONIAL_MODEL_1.totalSqFt.toLocaleString()} SF
                </td>
              </tr>
            </tbody>
          </table>

          <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">Sheet index</p>
          <table className="w-full text-xs">
            <tbody>
              {SHEET_INDEX.map(([no, title]) => (
                <tr key={no} className="border-b border-stone-200">
                  <td className="py-1 w-16 font-medium text-stone-800">{no}</td>
                  <td className="py-1 text-stone-600">{title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">
            Outline specifications
          </p>
          <table className="w-full text-xs">
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k} className="border-b border-stone-200 align-top">
                  <td className="py-1 pr-3 text-stone-500 whitespace-nowrap">{k}</td>
                  <td className="py-1 text-right text-stone-800">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-stone-400 leading-relaxed mt-4 border border-stone-200 p-3">
            DESIGN DEVELOPMENT SET — generated from the owner&apos;s selections for
            pricing, coordination, and review. A licensed design professional must
            review, complete, and seal these documents before permitting or
            construction. Verify all dimensions in field.
          </p>
        </div>
      </div>
    </SheetFrame>
  );
}
