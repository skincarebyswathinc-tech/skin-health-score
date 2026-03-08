import { AppNav } from "@/components/AppNav";
import { useScans } from "@/hooks/useScans";
import { ScoreRing } from "@/components/ScoreRing";
import { format } from "date-fns";
import { Clock, ChevronRight } from "lucide-react";
import { useState } from "react";
import { MetricsPanel } from "@/components/MetricsPanel";
import type { Scan } from "@/hooks/useScans";

const HistoryPage = () => {
  const { data: scans, isLoading } = useScans();
  const [selected, setSelected] = useState<Scan | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="container py-8 max-w-2xl space-y-6">
        <div className="animate-fade-in">
          <h1 className="font-display text-2xl font-bold">Scan History</h1>
          <p className="text-muted-foreground">Track your skin health over time</p>
        </div>

        {selected ? (
          <div className="space-y-4 animate-fade-in">
            <button
              onClick={() => setSelected(null)}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              ← Back to history
            </button>
            <div className="glass-card p-4">
              <img
                src={selected.image_url}
                alt="Scan"
                className="w-32 h-32 rounded-xl object-cover mx-auto"
              />
            </div>
            <MetricsPanel scan={selected} />
          </div>
        ) : isLoading ? (
          <div className="glass-card p-12 text-center animate-pulse-soft">
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        ) : !scans?.length ? (
          <div className="glass-card p-12 text-center animate-fade-in">
            <Clock className="w-12 h-12 mx-auto mb-4 text-primary/40" />
            <p className="text-muted-foreground">No scans yet. Start your first scan!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scans.map((scan, i) => (
              <button
                key={scan.id}
                onClick={() => setSelected(scan)}
                className="glass-card w-full p-4 flex items-center gap-4 hover:shadow-lg transition-shadow text-left animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <img
                  src={scan.image_url}
                  alt="Scan"
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold font-display">
                    Score: {scan.overall_score}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(scan.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <ScoreRing score={scan.overall_score} size={48} strokeWidth={4} />
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
