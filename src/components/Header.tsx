import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Activity, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Header = () => {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-glow">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold">HealthCheck AI</h1>
            <p className="text-xs text-muted-foreground">Your AI Health Assistant</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  );
};
