import { NextRequest } from "next/server";

export const runtime = "nodejs";

/** Adam — deep, steady male ElevenLabs stock voice. Overridable via env. */
const DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB";

/** Read the ElevenLabs key under any of the common env-var names. */
function elevenLabsKey(): string | undefined {
  return (
    process.env.ELEVENLABS_API_KEY ||
    process.env.ELEVEN_API_KEY ||
    process.env.XI_API_KEY ||
    process.env.ELEVENLABS_KEY
  );
}

export async function POST(req: NextRequest) {
  const key = elevenLabsKey();
  if (!key) {
    return Response.json(
      { error: "ElevenLabs API key not configured" },
      { status: 500 }
    );
  }

  let body: { text?: string; voiceId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text) {
    return Response.json({ error: "text required" }, { status: 400 });
  }

  const voiceId =
    body.voiceId?.trim() || process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID;
  const modelId = process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2";

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
        voiceId
      )}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return Response.json(
        { error: `ElevenLabs error ${res.status}`, detail: detail.slice(0, 500) },
        { status: 502 }
      );
    }

    const audio = await res.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: message }, { status: 502 });
  }
}
