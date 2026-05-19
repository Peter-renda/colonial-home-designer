import { fal } from "@fal-ai/client";
import { NextRequest } from "next/server";

fal.config({ credentials: process.env.FAL_KEY });

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.FAL_KEY) {
    return Response.json({ error: "FAL_KEY not configured" }, { status: 500 });
  }

  const { prompt } = await req.json();
  if (typeof prompt !== "string" || !prompt.trim()) {
    return Response.json({ error: "prompt required" }, { status: 400 });
  }

  const fullPrompt = `pencil sketch, ${prompt}, hand-drawn graphite, sketchy linework, light cross-hatching, white background, minimalist architectural illustration, no color`;

  try {
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: fullPrompt,
        image_size: "square_hd",
        num_inference_steps: 4,
      },
    });
    const imageUrl = result.data?.images?.[0]?.url;
    if (!imageUrl) {
      return Response.json({ error: "no image returned" }, { status: 502 });
    }
    return Response.json({ imageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: message }, { status: 502 });
  }
}
