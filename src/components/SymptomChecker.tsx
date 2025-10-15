import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Send, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface AnalysisResult {
  analysis: string;
  severity: string;
}

export const SymptomChecker = ({ onAnalysisComplete }: { onAnalysisComplete: () => void }) => {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "Emergency":
        return { color: "bg-destructive text-destructive-foreground", icon: AlertCircle };
      case "High":
        return { color: "bg-warning text-white", icon: AlertTriangle };
      case "Medium":
        return { color: "bg-info text-white", icon: AlertCircle };
      default:
        return { color: "bg-success text-white", icon: CheckCircle };
    }
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.functions.invoke("analyze-symptoms", {
        body: { symptoms },
      });

      if (error) throw error;

      setResult(data);

      const { error: dbError } = await supabase.from("symptom_queries").insert({
        user_id: user.id,
        symptoms,
        analysis: data.analysis,
        severity: data.severity,
      });

      if (dbError) throw dbError;

      toast.success("Analysis complete!");
      onAnalysisComplete();
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(error.message || "Failed to analyze symptoms");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card animate-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl font-heading">Describe Your Symptoms</CardTitle>
          <CardDescription>
            Be as specific as possible about what you're experiencing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: I've been experiencing a persistent headache for 2 days, along with mild fever and fatigue..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="min-h-[150px] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          <Button
            onClick={handleAnalyze}
            disabled={loading || !symptoms.trim()}
            className="w-full gradient-primary text-lg font-semibold py-6 hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Analyze Symptoms
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="shadow-card animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-heading">Analysis Results</CardTitle>
              <Badge className={`${getSeverityConfig(result.severity).color} text-sm px-3 py-1`}>
                {(() => {
                  const config = getSeverityConfig(result.severity);
                  const Icon = config.icon;
                  return (
                    <>
                      <Icon className="h-4 w-4 mr-1 inline" />
                      {result.severity} Severity
                    </>
                  );
                })()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {result.analysis}
              </div>
            </div>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Important:</strong> This analysis is for informational purposes only and
                should not be considered medical advice. Please consult with a healthcare
                professional for proper diagnosis and treatment.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
