import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!anthropicKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { entries } = await req.json();

  const MOOD_SCORE: Record<string, number> = { "Very Sad": 1, "Sad": 2, "Neutral": 3, "Happy": 4, "Very Happy": 5 };

  const entriesText = entries
    .map((e: Record<string, unknown>) => {
      const moodScore = (e.mood_score as number) || MOOD_SCORE[e.mood_label as string] || 0;
      const moodStr = e.mood_label ? `${e.mood_label} (${moodScore}/5)` : `${moodScore}/5`;
      return [
        `Date: ${(e.created_at as string)?.split("T")[0] ?? "unknown"}`,
        `Mood: ${moodStr}`,
        e.feeling ? `Feeling: ${e.feeling}` : null,
        e.heavy ? `What felt heavy: ${e.heavy}` : null,
        e.okay ? `What felt okay: ${e.okay}` : null,
        e.tasks ? `Notes: ${e.tasks}` : null,
        !e.feeling && e.content ? `Entry: ${e.content}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n---\n\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a warm, compassionate journal coach. I'm sharing someone's recent journal entries with you. Please give a thoughtful, personal 3–4 paragraph summary that:
1. Reflects on their emotional patterns and recurring themes
2. Highlights what seems to be weighing on them
3. Celebrates what's going well or improving
4. Offers gentle, encouraging words for the road ahead

Write it like a caring friend reflecting back what they observe — warm, personal, no bullet points. Address them in second person ("you").

Here are their recent entries (most recent first):

${entriesText}`,
        },
      ],
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: "Claude API error", details: result }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ summary: result.content[0].text }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
