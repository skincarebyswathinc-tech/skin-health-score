import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "imageUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a dermatological AI assistant. Analyze the provided face/selfie image and return skin health metrics. You must call the report_skin_analysis function with your findings. Score each metric from 0-100 where 100 is the best/healthiest. Be realistic and balanced. Estimate a skin age based on visible signs.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this selfie for skin health. Evaluate wrinkles, pores, redness, pigmentation, and hydration." },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_skin_analysis",
              description: "Report the skin analysis results with numeric scores",
              parameters: {
                type: "object",
                properties: {
                  overall_score: { type: "integer", description: "Overall skin health score 0-100" },
                  skin_age: { type: "integer", description: "Estimated skin age in years" },
                  wrinkles_score: { type: "integer", description: "Wrinkles score 0-100 (100=no wrinkles)" },
                  pores_score: { type: "integer", description: "Pores score 0-100 (100=invisible pores)" },
                  redness_score: { type: "integer", description: "Redness score 0-100 (100=no redness)" },
                  pigmentation_score: { type: "integer", description: "Pigmentation evenness score 0-100" },
                  hydration_score: { type: "integer", description: "Hydration score 0-100 (100=well hydrated)" },
                  summary: { type: "string", description: "Brief 2-3 sentence summary of skin condition with one tip" }
                },
                required: ["overall_score", "skin_age", "wrinkles_score", "pores_score", "redness_score", "pigmentation_score", "hydration_score", "summary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "report_skin_analysis" } }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No analysis results returned");
    }

    const result = JSON.parse(toolCall.function.arguments);

    // Clamp all scores to 0-100
    const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
    const sanitized = {
      overall_score: clamp(result.overall_score),
      skin_age: Math.max(10, Math.min(100, Math.round(result.skin_age))),
      wrinkles_score: clamp(result.wrinkles_score),
      pores_score: clamp(result.pores_score),
      redness_score: clamp(result.redness_score),
      pigmentation_score: clamp(result.pigmentation_score),
      hydration_score: clamp(result.hydration_score),
      summary: result.summary || "Analysis complete.",
    };

    return new Response(JSON.stringify(sanitized), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-skin error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
