"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArchitecturalStyle, QuizAnswers } from "../../types/quiz";
import { buildSiteNarration } from "../../lib/siteNarration";
import SunPathDiagram from "./SunPathDiagram";

interface Props {
  answers: QuizAnswers;
  recommendedStyle: ArchitecturalStyle;
  onContinue: () => void;
  onBack: () => void;
}

const DEFAULT_LATITUDE = 39.5; // continental-US midpoint fallback

function ans(answers: QuizAnswers, id: string): string {
  const v = answers[id];
  if (Array.isArray(v)) return v.join(", ");
  return (v as string) ?? "";
}

/** Parse a "lat, long" (or "lat long") string into a latitude. */
function parseLatitude(raw: string): number | null {
  const m = raw.match(/(-?\d{1,2}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)/);
  if (m) {
    const lat = parseFloat(m[1]);
    if (lat >= -90 && lat <= 90) return lat;
  }
  // a lone number could be a latitude
  const single = raw.trim().match(/^(-?\d{1,2}(?:\.\d+)?)$/);
  if (single) {
    const lat = parseFloat(single[1]);
    if (lat >= -90 && lat <= 90) return lat;
  }
  return null;
}

// ── speech synthesis hook (browser Web Speech API) ──────────────
function useSpeech(sections: string[]) {
  const [supported, setSupported] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(-1);
  const idxRef = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speakFrom(index: number) {
    if (!("speechSynthesis" in window)) return;
    if (index >= sections.length) {
      setPlaying(false);
      setCurrent(-1);
      return;
    }
    idxRef.current = index;
    setCurrent(index);
    const u = new SpeechSynthesisUtterance(sections[index]);
    u.rate = 0.96;
    u.pitch = 1;
    u.onend = () => {
      if (cancelledRef.current) return;
      speakFrom(index + 1);
    };
    window.speechSynthesis.speak(u);
  }

  function play() {
    if (!("speechSynthesis" in window)) return;
    cancelledRef.current = false;
    if (window.speechSynthesis.paused && window.speechSynthesis.speaking) {
      window.speechSynthesis.resume();
      setPlaying(true);
      return;
    }
    window.speechSynthesis.cancel();
    setPlaying(true);
    speakFrom(playing || current >= 0 ? idxRef.current : 0);
  }

  function pause() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.pause();
    setPlaying(false);
  }

  function stop() {
    if (!("speechSynthesis" in window)) return;
    cancelledRef.current = true;
    window.speechSynthesis.cancel();
    setPlaying(false);
    setCurrent(-1);
    idxRef.current = 0;
  }

  function playSection(index: number) {
    if (!("speechSynthesis" in window)) return;
    cancelledRef.current = false;
    window.speechSynthesis.cancel();
    setPlaying(true);
    speakFrom(index);
  }

  return { supported, playing, current, play, pause, stop, playSection };
}

export default function SiteAnalysisTalk({ answers, recommendedStyle, onContinue, onBack }: Props) {
  // Resolve a latitude: explicit coordinates first, then geocode the address,
  // then a sensible default. Everything degrades gracefully offline.
  const coordRaw = ans(answers, "siteCoordinates");
  const addressRaw = ans(answers, "siteAddress");
  const parsedLat = parseLatitude(coordRaw);

  const [latitude, setLatitude] = useState<number>(parsedLat ?? DEFAULT_LATITUDE);
  const [locLabel, setLocLabel] = useState<string>(
    parsedLat != null ? coordRaw : addressRaw || "approximate location"
  );
  const [manualLoc, setManualLoc] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  // Try to geocode the address when we don't have explicit coordinates.
  useEffect(() => {
    if (parsedLat != null) return;
    if (!addressRaw.trim()) return;
    let cancelled = false;
    setGeocoding(true);
    geocode(addressRaw)
      .then((res) => {
        if (cancelled || !res) return;
        setLatitude(res.lat);
        setLocLabel(res.label);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setGeocoding(false);
      });
    return () => {
      cancelled = true;
    };
  }, [addressRaw, parsedLat]);

  const narration = useMemo(
    () => buildSiteNarration(answers, recommendedStyle, latitude),
    [answers, recommendedStyle, latitude]
  );

  const speech = useSpeech(narration.sections.map((s) => s.body));

  // Stop narration if the user leaves the screen.
  useEffect(() => () => speech.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const facing = ans(answers, "streetFacing");

  async function applyManualLocation() {
    const lat = parseLatitude(manualLoc);
    if (lat != null) {
      setLatitude(lat);
      setLocLabel(manualLoc);
      return;
    }
    setGeocoding(true);
    const res = await geocode(manualLoc).catch(() => null);
    setGeocoding(false);
    if (res) {
      setLatitude(res.lat);
      setLocLabel(res.label);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-2">Site Analysis</p>
        <h2 className="text-3xl font-light text-stone-800 mb-3">Let&rsquo;s talk about your site.</h2>
        <p className="text-stone-500 text-sm mb-8 max-w-2xl leading-relaxed">
          Before we design the house, here&rsquo;s how your land shapes it — the path of the sun, the
          light through the day and seasons, where water moves, and how it should feel to arrive. Press
          play to listen.
        </p>

        {/* voice controls */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {speech.supported ? (
            <>
              {!speech.playing ? (
                <button
                  onClick={speech.play}
                  className="inline-flex items-center gap-2 bg-stone-800 text-white px-6 py-3 text-sm uppercase tracking-[0.15em] hover:bg-stone-700 transition-colors"
                >
                  ► Play narration
                </button>
              ) : (
                <button
                  onClick={speech.pause}
                  className="inline-flex items-center gap-2 bg-stone-800 text-white px-6 py-3 text-sm uppercase tracking-[0.15em] hover:bg-stone-700 transition-colors"
                >
                  ❚❚ Pause
                </button>
              )}
              <button
                onClick={speech.stop}
                className="text-sm text-stone-400 hover:text-stone-600 uppercase tracking-[0.15em] transition-colors"
              >
                ■ Stop
              </button>
              <span className="text-xs text-stone-400">A spoken AI walkthrough of your site.</span>
            </>
          ) : (
            <span className="text-xs text-stone-400">
              Spoken narration isn&rsquo;t supported in this browser — the full walkthrough is written
              below.
            </span>
          )}
        </div>

        {/* sun path */}
        <div className="mb-4">
          <SunPathDiagram latitude={latitude} facing={facing} locationLabel={locLabel} />
        </div>

        {/* location fallback / override */}
        <div className="mb-10 flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1">
              Refine location for the sun path
            </label>
            <input
              type="text"
              value={manualLoc}
              onChange={(e) => setManualLoc(e.target.value)}
              placeholder="City, or latitude, longitude (e.g. 40.71, -74.01)"
              className="w-72 max-w-full border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500"
            />
          </div>
          <button
            onClick={applyManualLocation}
            disabled={geocoding || !manualLoc.trim()}
            className="border border-stone-300 text-stone-600 px-4 py-2 text-xs uppercase tracking-wider hover:border-stone-500 transition-colors disabled:opacity-40"
          >
            {geocoding ? "Locating…" : "Update"}
          </button>
        </div>

        {/* narration transcript */}
        <div className="space-y-4 mb-12">
          {narration.sections.map((sec, i) => {
            const active = speech.current === i;
            return (
              <div
                key={sec.heading}
                className={`border bg-white transition-colors ${
                  active ? "border-stone-700 shadow-sm" : "border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
                  <h3 className="font-medium text-stone-800 text-sm flex items-center gap-2">
                    {active && <span className="text-stone-500 animate-pulse">🔊</span>}
                    {sec.heading}
                  </h3>
                  {speech.supported && (
                    <button
                      onClick={() => speech.playSection(i)}
                      className="text-[11px] text-stone-400 hover:text-stone-600 uppercase tracking-wider transition-colors"
                    >
                      ► Listen
                    </button>
                  )}
                </div>
                <p className="px-5 py-4 text-sm text-stone-600 leading-relaxed">{sec.body}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-stone-100">
          <button
            onClick={() => {
              speech.stop();
              onBack();
            }}
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => {
              speech.stop();
              onContinue();
            }}
            className="bg-stone-800 text-white px-8 py-3 text-sm uppercase tracking-[0.15em] hover:bg-stone-700 transition-colors"
          >
            Continue to the design →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── geocoding (best-effort, no API key; degrades gracefully) ────
async function geocode(query: string): Promise<{ lat: number; label: string } | null> {
  const q = query.trim();
  if (!q) return null;
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      q
    )}&count=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const hit = data?.results?.[0];
    if (hit && typeof hit.latitude === "number") {
      const parts = [hit.name, hit.admin1, hit.country_code].filter(Boolean);
      return { lat: hit.latitude, label: parts.join(", ") };
    }
  } catch {
    // offline or blocked — caller falls back to the default latitude
  }
  return null;
}
