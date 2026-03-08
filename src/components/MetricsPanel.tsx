import type { Scan } from "@/hooks/useScans";
import { ScoreRing } from "./ScoreRing";

interface MetricBarProps {
  label: string;
  score: number;
}

const getBarColor = (score: number) => {
  if (score >= 80) return "bg-score-excellent";
  if (score >= 60) return "bg-score-good";
  if (score >= 40) return "bg-score-fair";
  if (score >= 20) return "bg-score-poor";
  return "bg-score-bad";
};

const MetricBar = ({ label, score }: MetricBarProps) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold font-display">{score}/100</span>
    </div>
    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(score)}`}
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

export const MetricsPanel = ({ scan }: { scan: Scan }) => {
  const metrics = [
    { label: "Wrinkles", score: scan.wrinkles_score ?? 0 },
    { label: "Pores", score: scan.pores_score ?? 0 },
    { label: "Redness", score: scan.redness_score ?? 0 },
    { label: "Pigmentation", score: scan.pigmentation_score ?? 0 },
    { label: "Hydration", score: scan.hydration_score ?? 0 },
  ];

  return (
    <div className="glass-card p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Skin Health Score</h3>
          {scan.skin_age && (
            <p className="text-sm text-muted-foreground">Estimated skin age: {scan.skin_age}</p>
          )}
        </div>
        <ScoreRing score={scan.overall_score} size={80} strokeWidth={6} />
      </div>

      <div className="space-y-4">
        {metrics.map((m) => (
          <MetricBar key={m.label} label={m.label} score={m.score} />
        ))}
      </div>

      {scan.summary && (
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed">{scan.summary}</p>
        </div>
      )}
    </div>
  );
};
