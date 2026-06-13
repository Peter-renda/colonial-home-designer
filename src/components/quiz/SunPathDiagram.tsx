"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  computeSunPath,
  REFERENCE_DAYS,
  SunPath,
  SunSample,
  formatTime,
} from "../../lib/solar";

interface Props {
  latitude: number;
  /** Compass direction the front of the house faces (N/S/E/W). */
  facing?: string;
  locationLabel?: string;
}

type SeasonKey = "summer" | "equinox" | "winter";

const SEASONS: { key: SeasonKey; label: string; day: number; tint: string }[] = [
  { key: "summer", label: "Jun 21", day: REFERENCE_DAYS.summerSolstice, tint: "#e0a23a" },
  { key: "equinox", label: "Mar/Sep", day: REFERENCE_DAYS.equinox, tint: "#c98a3a" },
  { key: "winter", label: "Dec 21", day: REFERENCE_DAYS.winterSolstice, tint: "#9a7bbf" },
];

// SVG layout constants
const VB_W = 600;
const VB_H = 340;
const GROUND_Y = 272;
const SKY_TOP = 30;
const LEFT = 44;
const RIGHT = 556;
const SKY_W = RIGHT - LEFT;

export default function SunPathDiagram({ latitude, facing, locationLabel }: Props) {
  const [season, setSeason] = useState<SeasonKey>("summer");
  const [playing, setPlaying] = useState(true);
  const [u, setU] = useState(0.5); // 0..1 progress across daylight

  const paths = useMemo(() => {
    const out: Record<SeasonKey, SunPath> = {
      summer: computeSunPath(latitude, REFERENCE_DAYS.summerSolstice),
      equinox: computeSunPath(latitude, REFERENCE_DAYS.equinox),
      winter: computeSunPath(latitude, REFERENCE_DAYS.winterSolstice),
    };
    return out;
  }, [latitude]);

  // Shared vertical scale so the three arcs are comparable in one frame.
  const refMaxAlt = Math.max(10, paths.summer.noonAltitude);

  function yForAlt(alt: number): number {
    const usableH = GROUND_Y - SKY_TOP;
    return GROUND_Y - Math.max(0, alt / refMaxAlt) * usableH;
  }

  // Map a season's daylight samples to screen coordinates.
  function mapArc(p: SunPath): { x: number; y: number; s: SunSample }[] {
    const day = p.daylight;
    if (day.length === 0) return [];
    const t0 = p.sunriseHour ?? day[0].hour;
    const t1 = p.sunsetHour ?? day[day.length - 1].hour;
    const span = Math.max(0.5, t1 - t0);
    return day.map((s) => ({
      x: LEFT + ((s.hour - t0) / span) * SKY_W,
      y: yForAlt(s.altitude),
      s,
    }));
  }

  const arcs = useMemo(
    () => ({
      summer: mapArc(paths.summer),
      equinox: mapArc(paths.equinox),
      winter: mapArc(paths.winter),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paths, refMaxAlt]
  );

  const activeArc = arcs[season];
  const activePath = paths[season];

  // ── animate the sun token along the active arc ──
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  useEffect(() => {
    if (!playing || activeArc.length === 0) return;
    function tick(t: number) {
      if (!lastRef.current) lastRef.current = t;
      const dt = (t - lastRef.current) / 1000;
      lastRef.current = t;
      setU((prev) => {
        const next = prev + dt / 9; // ~9s per full day
        return next > 1 ? 0 : next;
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = 0;
    };
  }, [playing, season, activeArc.length]);

  // Sun position from progress u.
  const sun = useMemo(() => {
    if (activeArc.length === 0) {
      return { x: VB_W / 2, y: GROUND_Y, alt: 0, hour: 12, azimuth: 180, visible: false };
    }
    const idx = Math.min(activeArc.length - 1, Math.max(0, Math.round(u * (activeArc.length - 1))));
    const pt = activeArc[idx];
    return {
      x: pt.x,
      y: pt.y,
      alt: pt.s.altitude,
      hour: pt.s.hour,
      azimuth: pt.s.azimuth,
      visible: true,
    };
  }, [activeArc, u]);

  // House shadow: opposite side of the sun, longer when the sun is low.
  const shadow = useMemo(() => {
    const altClamped = Math.max(4, sun.alt);
    const len = Math.min(180, 60 / Math.tan((altClamped * Math.PI) / 180));
    const dir = sun.x < VB_W / 2 ? 1 : -1; // sun on left → shadow right
    return { len, dir };
  }, [sun]);

  // Sky tint shifts warm at low sun, blue at high sun.
  const skyTop = sun.alt < 8 ? "#f3d9b5" : sun.alt < 20 ? "#dfe7ee" : "#cfe0ef";
  const skyBottom = sun.alt < 8 ? "#e7c79c" : "#eef3f6";

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto border border-stone-200 bg-white">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop} />
            <stop offset="100%" stopColor={skyBottom} />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff3cf" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fdd76a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* sky + ground */}
        <rect x="0" y="0" width={VB_W} height={GROUND_Y} fill="url(#sky)" />
        <rect x="0" y={GROUND_Y} width={VB_W} height={VB_H - GROUND_Y} fill="#d8cfb6" />
        <line x1="0" y1={GROUND_Y} x2={VB_W} y2={GROUND_Y} stroke="#9b9176" strokeWidth="1" />

        {/* horizon direction labels — sun rises east, sets west */}
        <text x={LEFT} y={GROUND_Y + 22} textAnchor="middle" fontSize="11" fill="#7a7158">
          E ☀ rise
        </text>
        <text x={VB_W / 2} y={GROUND_Y + 22} textAnchor="middle" fontSize="11" fill="#7a7158">
          S
        </text>
        <text x={RIGHT} y={GROUND_Y + 22} textAnchor="middle" fontSize="11" fill="#7a7158">
          W set ☾
        </text>

        {/* the three seasonal arcs */}
        {SEASONS.map((sea) => {
          const arc = arcs[sea.key];
          if (arc.length < 2) return null;
          const d = arc.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
          const active = sea.key === season;
          return (
            <path
              key={sea.key}
              d={d}
              fill="none"
              stroke={sea.tint}
              strokeWidth={active ? 2.4 : 1}
              strokeOpacity={active ? 0.95 : 0.35}
              strokeDasharray={active ? undefined : "4 4"}
            />
          );
        })}

        {/* house shadow */}
        {sun.visible && (
          <polygon
            points={`${VB_W / 2 - 70},${GROUND_Y} ${VB_W / 2 + 70},${GROUND_Y} ${
              VB_W / 2 + 70 + shadow.dir * shadow.len
            },${GROUND_Y + 14} ${VB_W / 2 - 70 + shadow.dir * shadow.len},${GROUND_Y + 14}`}
            fill="#000000"
            opacity="0.10"
          />
        )}

        {/* colonial house silhouette */}
        <HouseSilhouette />

        {/* sun token */}
        {sun.visible && (
          <g>
            <circle cx={sun.x} cy={sun.y} r="26" fill="url(#sunGlow)" />
            <circle cx={sun.x} cy={sun.y} r="11" fill="#fdb92e" stroke="#e89a16" strokeWidth="1" />
          </g>
        )}
      </svg>

      {/* season toggles */}
      <div className="flex flex-wrap items-center gap-2">
        {SEASONS.map((sea) => (
          <button
            key={sea.key}
            onClick={() => setSeason(sea.key)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-wider border transition-colors ${
              season === sea.key
                ? "border-stone-700 bg-stone-800 text-white"
                : "border-stone-200 bg-white text-stone-500 hover:border-stone-400"
            }`}
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
              style={{ background: sea.tint }}
            />
            {sea.label}
          </button>
        ))}
        <button
          onClick={() => setPlaying((p) => !p)}
          className="ml-auto px-3 py-1.5 text-[11px] uppercase tracking-wider text-stone-500 hover:text-stone-700 transition-colors"
        >
          {playing ? "❚❚ Pause sun" : "► Play sun"}
        </button>
      </div>

      {/* readout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <Stat label="Sunrise" value={formatTime(activePath.sunriseHour)} />
        <Stat label="Sunset" value={formatTime(activePath.sunsetHour)} />
        <Stat label="Noon sun height" value={`${Math.round(activePath.noonAltitude)}°`} />
        <Stat label="Day length" value={`${activePath.daylightHours.toFixed(1)} hrs`} />
      </div>
      <p className="text-[11px] text-stone-400 leading-relaxed">
        Sun path for latitude {latitude.toFixed(2)}°{locationLabel ? ` · ${locationLabel}` : ""}
        {facing ? ` · front faces ${facing}` : ""}. The solid arc is the selected date; the dashed
        arcs show how high the sun climbs in the other seasons. Watch the shadow stretch as the sun
        drops toward the horizon.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-stone-200 bg-white px-2.5 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-stone-400">{label}</div>
      <div className="text-stone-700 font-medium">{value}</div>
    </div>
  );
}

function HouseSilhouette() {
  const cx = VB_W / 2;
  const bodyW = 140;
  const bodyH = 92;
  const bodyX = cx - bodyW / 2;
  const bodyY = GROUND_Y - bodyH;
  const roofPeakY = bodyY - 46;
  return (
    <g>
      {/* chimneys */}
      <rect x={cx - 48} y={roofPeakY + 4} width="12" height="34" fill="#7d6f59" />
      <rect x={cx + 36} y={roofPeakY + 4} width="12" height="34" fill="#7d6f59" />
      {/* roof */}
      <polygon
        points={`${bodyX - 10},${bodyY} ${cx},${roofPeakY} ${bodyX + bodyW + 10},${bodyY}`}
        fill="#4d4844"
      />
      {/* body */}
      <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} fill="#efe9dc" stroke="#9b9176" strokeWidth="1" />
      {/* windows (5-bay, 2 storeys) */}
      {[0, 1, 3, 4].map((i) => (
        <g key={`u${i}`}>
          <rect x={bodyX + 12 + i * 28} y={bodyY + 12} width="16" height="20" fill="#bcd0dd" stroke="#6f6a64" strokeWidth="0.8" />
        </g>
      ))}
      {[0, 1, 3, 4].map((i) => (
        <g key={`l${i}`}>
          <rect x={bodyX + 12 + i * 28} y={bodyY + 46} width="16" height="22" fill="#bcd0dd" stroke="#6f6a64" strokeWidth="0.8" />
        </g>
      ))}
      {/* door */}
      <rect x={cx - 11} y={GROUND_Y - 36} width="22" height="36" fill="#5b4a36" stroke="#3d2f21" strokeWidth="0.8" />
    </g>
  );
}
