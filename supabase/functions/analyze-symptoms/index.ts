import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing symptoms:", symptoms);

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
            content: `You are a medical AI assistant that helps analyze symptoms. 
            Provide a detailed analysis including:
            1. Possible conditions (with disclaimers)
            2. Severity level (Low, Medium, High, Emergency)
            3. Recommended actions
            4. When to seek medical help
            
            Always include a disclaimer that this is not medical advice and users should consult healthcare professionals.
            Format your response in a clear, structured way.`
          },
          {
            role: "user",
            content: `Analyze these symptoms: ${symptoms}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;
    
    // Extract severity from the analysis
    let severity = "Medium";
    const lowerAnalysis = analysis.toLowerCase();
    if (lowerAnalysis.includes("emergency") || lowerAnalysis.includes("immediate")) {
      severity = "Emergency";
    } else if (lowerAnalysis.includes("high") || lowerAnalysis.includes("severe")) {
      severity = "High";
    } else if (lowerAnalysis.includes("low") || lowerAnalysis.includes("minor")) {
      severity = "Low";
    }

    console.log("Analysis complete, severity:", severity);

    return new Response(
      JSON.stringify({ analysis, severity }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-symptoms function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
