import { AppNav } from "@/components/AppNav";
import { useScans } from "@/hooks/useScans";
import { ScoreRing } from "@/components/ScoreRing";
import { format } from "date-fns";
import { Clock, ChevronRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { MetricsPanel } from "@/components/MetricsPanel";
import type { Scan } from "@/hooks/useScans";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const HistoryPage = () => {
  const { data: scans, isLoading } = useScans();
  const [selected, setSelected] = useState<Scan | null>(null);

  return (
    <div className="page-container">
      <AppNav />
      <main className="page-content">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header"
        >
          <h1 className="page-title">Scan History</h1>
          <p className="page-subtitle">Track your skin health over time</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to history
              </button>
              <div className="glass-card p-5 flex justify-center">
                <img
                  src={selected.image_url}
                  alt="Scan"
                  className="w-32 h-32 rounded-2xl object-cover shadow-md"
                />
              </div>
              <MetricsPanel scan={selected} />
            </motion.div>
          ) : isLoading ? (
            <motion.div key="loading" className="glass-card p-16 text-center animate-pulse-soft">
              <p className="text-muted-foreground">Loading history…</p>
            </motion.div>
          ) : !scans?.length ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-16 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No scans yet. Start your first scan!</p>
            </motion.div>
          ) : (
            <motion.div key="list" className="space-y-3">
              {scans.map((scan, i) => (
                <motion.button
                  key={scan.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  onClick={() => setSelected(scan)}
                  className="glass-card w-full p-4 flex items-center gap-4 hover:shadow-lg transition-all duration-200 text-left group"
                >
                  <img
                    src={scan.image_url}
                    alt="Scan"
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold font-display text-sm">
                      Score: {scan.overall_score}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(scan.created_at), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                  <ScoreRing score={scan.overall_score} size={44} strokeWidth={3.5} />
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default HistoryPage;
