import { AppNav } from "@/components/AppNav";
import { useLatestScan } from "@/hooks/useScans";
import { useAuth } from "@/hooks/useAuth";
import { MetricsPanel } from "@/components/MetricsPanel";
import { ScoreRing } from "@/components/ScoreRing";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ScanFace, TrendingUp, Calendar } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: latestScan, isLoading } = useLatestScan();

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="container py-8 max-w-2xl space-y-8">
        <div className="animate-fade-in">
          <h1 className="font-display text-2xl font-bold">
            Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground">Your skin health at a glance</p>
        </div>

        {isLoading ? (
          <div className="glass-card p-12 text-center animate-pulse-soft">
            <p className="text-muted-foreground">Loading your data...</p>
          </div>
        ) : latestScan ? (
          <div className="space-y-6">
            <div className="glass-card p-8 text-center animate-fade-in">
              <p className="text-sm text-muted-foreground mb-4">Your Latest Skin Score</p>
              <ScoreRing score={latestScan.overall_score} size={160} strokeWidth={10} />
              {latestScan.skin_age && (
                <p className="mt-4 text-muted-foreground">
                  Estimated skin age: <span className="font-semibold text-foreground">{latestScan.skin_age}</span>
                </p>
              )}
              <div className="flex justify-center gap-3 mt-6">
                <Link to="/scan">
                  <Button variant="hero" className="gap-1.5">
                    <ScanFace className="w-4 h-4" /> New Scan
                  </Button>
                </Link>
                <Link to="/history">
                  <Button variant="hero-outline" className="gap-1.5">
                    <Calendar className="w-4 h-4" /> View History
                  </Button>
                </Link>
              </div>
            </div>

            <MetricsPanel scan={latestScan} />
          </div>
        ) : (
          <div className="glass-card p-12 text-center animate-fade-in">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary/40" />
            <h2 className="font-display text-lg font-semibold mb-2">No scans yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Upload a selfie to get your first skin analysis
            </p>
            <Link to="/scan">
              <Button variant="hero" size="lg">
                <ScanFace className="w-4 h-4" /> Start Your First Scan
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
