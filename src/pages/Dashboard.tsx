import { AppNav } from "@/components/AppNav";
import { useLatestScan } from "@/hooks/useScans";
import { ProgressChart } from "@/components/ProgressChart";
import { useAuth } from "@/hooks/useAuth";
import { MetricsPanel } from "@/components/MetricsPanel";
import { ScoreRing } from "@/components/ScoreRing";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ScanFace, Calendar, TrendingUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const Dashboard = () => {
  const { user } = useAuth();
  const { data: latestScan, isLoading } = useLatestScan();
  const displayName = user?.email?.split("@")[0] ?? "";

  return (
    <div className="page-container">
      <AppNav />
      <main className="page-content">
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="page-header">
          <p className="text-sm text-muted-foreground font-medium">Welcome back</p>
          <h1 className="page-title">{displayName ? `${displayName}'s Dashboard` : "Dashboard"}</h1>
        </motion.div>

        {isLoading ? (
          <div className="glass-card p-16 text-center animate-pulse-soft">
            <p className="text-muted-foreground">Loading your data…</p>
          </div>
        ) : latestScan ? (
          <div className="space-y-6">
            {/* Hero Score Card */}
            <motion.div
              custom={1} initial="hidden" animate="visible" variants={fadeUp}
              className="glass-card-elevated p-8 sm:p-10 text-center"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-6">Latest Skin Score</p>
              <ScoreRing score={latestScan.overall_score} size={180} strokeWidth={10} showLabel />
              {latestScan.skin_age && (
                <p className="mt-5 text-sm text-muted-foreground">
                  Estimated skin age: <span className="font-semibold text-foreground">{latestScan.skin_age}</span>
                </p>
              )}
              <div className="flex justify-center gap-3 mt-8">
                <Link to="/scan">
                  <Button variant="hero" className="gap-2 rounded-full px-6">
                    <ScanFace className="w-4 h-4" /> New Scan
                  </Button>
                </Link>
                <Link to="/history">
                  <Button variant="outline" className="gap-2 rounded-full px-6">
                    <Calendar className="w-4 h-4" /> History
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
              <ProgressChart />
            </motion.div>

            {/* Detailed Metrics */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
              <MetricsPanel scan={latestScan} />
            </motion.div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            custom={1} initial="hidden" animate="visible" variants={fadeUp}
            className="glass-card-elevated p-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-5">
              <TrendingUp className="w-7 h-7 text-accent-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">No scans yet</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
              Upload a selfie to get your first AI-powered skin analysis
            </p>
            <Link to="/scan">
              <Button variant="hero" size="lg" className="rounded-full px-8 gap-2">
                <ScanFace className="w-4 h-4" /> Start Your First Scan <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
