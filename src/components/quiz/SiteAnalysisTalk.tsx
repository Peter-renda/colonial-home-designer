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

// ── ElevenLabs narration hook (server route /api/tts) ───────────
// Fetches an MP3 per section from our ElevenLabs-backed route and plays
// them in sequence through a single <audio> element. Audio is cached by
// the section text so re-listening (or replaying after a pause) is instant.
function useElevenLabsNarration(sections: string[]) {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const idxRef = useRef(0);
  const cancelledRef = useRef(false);
  const reqRef = useRef(0);
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    const cache = cacheRef.current;
    return () => {
      cancelledRef.current = true;
      audio.pause();
      audio.src = "";
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  async function fetchAudioUrl(text: string): Promise<string> {
    const cached = cacheRef.current.get(text);
    if (cached) return cached;
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      let msg = `narration failed (${res.status})`;
      try {
        const data = await res.json();
        if (data?.error) msg = data.error;
      } catch {
        // non-JSON error body — keep the status message
      }
      throw new Error(msg);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    cacheRef.current.set(text, url);
    return url;
  }

  async function playFrom(index: number) {
    const audio = audioRef.current;
    if (!audio) return;
    if (index >= sectionsRef.current.length) {
      setPlaying(false);
      setCurrent(-1);
      idxRef.current = 0;
      return;
    }
    cancelledRef.current = false;
    idxRef.current = index;
    setCurrent(index);
    setPlaying(true);
    setError(null);
    setLoading(true);
    const token = ++reqRef.current;
    try {
      const url = await fetchAudioUrl(sectionsRef.current[index]);
      if (cancelledRef.current || token !== reqRef.current) return;
      audio.src = url;
      audio.onended = () => {
        if (cancelledRef.current) return;
        playFrom(idxRef.current + 1);
      };
      await audio.play();
    } catch (e) {
      if (cancelledRef.current) return;
      setError(e instanceof Error ? e.message : "narration failed");
      setPlaying(false);
      setCurrent(-1);
    } finally {
      if (token === reqRef.current) setLoading(false);
    }
  }

  function play() {
    const audio = audioRef.current;
    if (!audio) return;
    // resume if we paused part-way through a section
    if (audio.src && audio.paused && audio.currentTime > 0 && !audio.ended && current >= 0) {
      cancelledRef.current = false;
      setPlaying(true);
      audio.play().catch(() => {});
      return;
    }
    playFrom(current >= 0 ? idxRef.current : 0);
  }

  function pause() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPlaying(false);
  }

  function stop() {
    const audio = audioRef.current;
    cancelledRef.current = true;
    reqRef.current++; // invalidate any in-flight fetch
    if (audio) {
      audio.pause();
      audio.onended = null;
    }
    setPlaying(false);
    setCurrent(-1);
    setLoading(false);
    idxRef.current = 0;
  }

  function playSection(index: number) {
    const audio = audioRef.current;
    if (audio) audio.pause();
    playFrom(index);
  }

  return { playing, current, loading, error, play, pause, stop, playSection };
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

  const speech = useElevenLabsNarration(narration.sections.map((s) => s.body));

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
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {!speech.playing ? (
              <button
                onClick={speech.play}
                disabled={speech.loading}
                className="inline-flex items-center gap-2 bg-stone-800 text-white px-6 py-3 text-sm uppercase tracking-[0.15em] hover:bg-stone-700 transition-colors disabled:opacity-50"
              >
                {speech.loading ? "Generating voice…" : "► Play narration"}
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
            <span className="text-xs text-stone-400">
              An ElevenLabs AI voice walkthrough of your site.
            </span>
          </div>
          {speech.error && (
            <p className="mt-2 text-xs text-rose-500">
              Couldn&rsquo;t play narration: {speech.error}
            </p>
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
                  <button
                    onClick={() => speech.playSection(i)}
                    className="text-[11px] text-stone-400 hover:text-stone-600 uppercase tracking-wider transition-colors"
                  >
                    ► Listen
                  </button>
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
