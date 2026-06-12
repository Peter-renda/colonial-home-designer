import { ReactNode } from "react";

interface Props {
  sheetNo: string;
  title: string;
  style: string;
  scale?: string;
  children: ReactNode;
}

/**
 * Title-block wrapper that makes each drawing read like a CD sheet:
 * double border, drawing area, and a title strip across the bottom.
 */
export default function SheetFrame({ sheetNo, title, style, scale, children }: Props) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return (
    <div className="sheet bg-white border-2 border-stone-800 p-1.5 shadow-sm">
      <div className="border border-stone-800 flex flex-col">
        <div className="flex-1 p-4">{children}</div>
        <div className="border-t-2 border-stone-800 grid grid-cols-[1fr_auto_auto_auto] text-stone-800">
          <div className="px-4 py-2 border-r border-stone-300">
            <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400">Project</p>
            <p className="text-sm font-medium tracking-wide">
              COLONIAL MODEL 1 — {style.toUpperCase()}
            </p>
            <p className="text-[9px] text-stone-400">
              SiteCommand · Colonial Home Designer · generated with Claude
            </p>
          </div>
          <div className="px-4 py-2 border-r border-stone-300">
            <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400">Sheet title</p>
            <p className="text-sm font-medium tracking-wide uppercase">{title}</p>
            <p className="text-[9px] text-stone-400">{scale ?? "Scale: as noted"}</p>
          </div>
          <div className="px-4 py-2 border-r border-stone-300">
            <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400">Date</p>
            <p className="text-sm">{today}</p>
            <p className="text-[9px] text-stone-400">Not for construction</p>
          </div>
          <div className="px-5 py-2 flex flex-col items-center justify-center">
            <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400">Sheet</p>
            <p className="text-xl font-semibold">{sheetNo}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
