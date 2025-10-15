import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@/components/Auth";
import { Header } from "@/components/Header";
import { SymptomChecker } from "@/components/SymptomChecker";
import { HistoryList } from "@/components/HistoryList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, History } from "lucide-react";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="checker" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="checker" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Check Symptoms
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="checker" className="animate-fade-in">
            <SymptomChecker onAnalysisComplete={() => setRefreshTrigger(prev => prev + 1)} />
          </TabsContent>
          <TabsContent value="history" className="animate-fade-in">
            <HistoryList refreshTrigger={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
