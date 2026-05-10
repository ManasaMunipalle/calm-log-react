Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { entries } = await req.json();

    const MOOD = { "Very Sad": 1, "Sad": 2, "Neutral": 3, "Happy": 4, "Very Happy": 5 };

    const text = entries.map((e) => [
      `Date: ${(e.created_at || "").split("T")[0]}`,
      `Mood: ${e.mood_label || ""} (${e.mood_score || MOOD[e.mood_label] || "?"}/5)`,
      e.feeling ? `Feeling: ${e.feeling}` : "",
      e.heavy   ? `Heavy: ${e.heavy}`     : "",
      e.okay    ? `Okay: ${e.okay}`       : "",
      e.tasks   ? `Notes: ${e.tasks}`     : "",
      (!e.feeling && e.content) ? `Entry: ${e.content}` : "",
    ].filter(Boolean).join("\n")).join("\n\n---\n\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `You are a warm journal coach. Read these entries and write a personal 3-4 paragraph reflection covering: emotional patterns, what's been heavy, what's going well, and encouragement. Write warmly in second person, no bullet points.\n\n${text}`,
        }],
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Anthropic error", detail: json }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ summary: json.content[0].text }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
