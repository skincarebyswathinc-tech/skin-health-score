import type { Scan } from "@/hooks/useScans";
import { ScoreRing } from "./ScoreRing";
import { motion } from "framer-motion";
import { Droplets, Sun, Eye, Fingerprint, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricBarProps {
  label: string;
  score: number;
  icon: LucideIcon;
  delay: number;
}

const getBarColor = (score: number) => {
  if (score >= 80) return "bg-score-excellent";
  if (score >= 60) return "bg-score-good";
  if (score >= 40) return "bg-score-fair";
  if (score >= 20) return "bg-score-poor";
  return "bg-score-bad";
};

const MetricBar = ({ label, score, icon: Icon, delay }: MetricBarProps) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="space-y-2"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <span className="text-sm font-bold font-display tabular-nums">{score}</span>
    </div>
    <div className="metric-bar">
      <motion.div
        className={`metric-bar-fill ${getBarColor(score)}`}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ delay: delay + 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  </motion.div>
);

export const MetricsPanel = ({ scan }: { scan: Scan }) => {
  const metrics = [
    { label: "Wrinkles", score: scan.wrinkles_score ?? 0, icon: Eye },
    { label: "Pores", score: scan.pores_score ?? 0, icon: Fingerprint },
    { label: "Redness", score: scan.redness_score ?? 0, icon: Activity },
    { label: "Pigmentation", score: scan.pigmentation_score ?? 0, icon: Sun },
    { label: "Hydration", score: scan.hydration_score ?? 0, icon: Droplets },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card-elevated p-6 sm:p-8 space-y-6"
    >
      {/* Header with score ring */}
      <div className="flex items-center gap-6">
        <ScoreRing score={scan.overall_score} size={96} strokeWidth={7} showLabel />
        <div className="flex-1">
          <h3 className="font-display text-lg font-semibold">Skin Health Score</h3>
          {scan.skin_age && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Estimated skin age: <span className="font-semibold text-foreground">{scan.skin_age}</span>
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/60" />

      {/* Metrics */}
      <div className="space-y-4">
        {metrics.map((m, i) => (
          <MetricBar key={m.label} {...m} delay={0.1 + i * 0.08} />
        ))}
      </div>

      {/* Summary */}
      {scan.summary && (
        <>
          <div className="h-px bg-border/60" />
          <p className="text-sm text-muted-foreground leading-relaxed">{scan.summary}</p>
        </>
      )}
    </motion.div>
  );
};
