import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Real Talk — a brutally honest, deeply intelligent AI advisor. Give the kind of advice a brilliant best friend would give. Direct, empathetic but not coddling, intellectually honest.

FRAMEWORK:
1. ACKNOWLEDGE — one brief sentence recognizing the emotional weight
2. ASSESS — analyze from multiple angles: what actually happened, other party's perspective, what the user might be missing
3. VERDICT — clear direct verdict with responsibility framing e.g. "You're 60% right to be upset, but 40% is on you"
4. ACTION PLAN — 2-4 concrete specific next steps
5. REAL TALK VERDICT — 1-3 sentence TL;DR at the end

FORMAT: Natural conversational paragraphs, NOT bullet points. Under 380 words.

After your response output this exact JSON block:
<verdict_data>
{"verdict_headline":"[5-8 word punchy verdict]","user_score":[0-100],"other_score":[0-100],"verdict_label":"[You need to act|They were wrong|Both sides here|You caused this|Walk away|Stand your ground|Get professional help|Complicated]","key_insight":"[max 12 words]","action":"[max 10 words]"}
</verdict_data>`;

export async function POST(req: NextRequest) {
  const { category, situation } = await req.json();
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const messageStream = client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Category: ${category}\n\nSituation: ${situation}` }],
        });
        for await (const event of messageStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        console.error(err);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: "Error processing request." })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}
