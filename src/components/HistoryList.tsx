import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { History, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Query {
  id: string;
  symptoms: string;
  analysis: string;
  severity: string;
  created_at: string;
}

export const HistoryList = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("symptom_queries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQueries(data || []);
    } catch (error: any) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("symptom_queries").delete().eq("id", id);
      if (error) throw error;
      toast.success("Query deleted");
      fetchHistory();
    } catch (error: any) {
      toast.error("Failed to delete query");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Emergency":
        return "bg-destructive text-destructive-foreground";
      case "High":
        return "bg-warning text-white";
      case "Medium":
        return "bg-info text-white";
      default:
        return "bg-success text-white";
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading history...</div>
        </CardContent>
      </Card>
    );
  }

  if (queries.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <History className="h-16 w-16 text-muted-foreground/50" />
          <p className="text-muted-foreground text-center">
            No symptom analysis history yet.
            <br />
            Start by analyzing your symptoms above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {queries.map((query) => (
        <Card key={query.id} className="shadow-soft hover:shadow-card transition-all duration-200 animate-fade-in">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <CardDescription>
                    {format(new Date(query.created_at), "PPp")}
                  </CardDescription>
                </div>
                <CardTitle className="text-lg font-heading">{query.symptoms}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getSeverityColor(query.severity)} text-xs`}>
                  {query.severity}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(query.id)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
              {query.analysis}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
