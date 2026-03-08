interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-score-excellent";
  if (score >= 60) return "text-score-good";
  if (score >= 40) return "text-score-fair";
  if (score >= 20) return "text-score-poor";
  return "text-score-bad";
};

const getStrokeColor = (score: number) => {
  if (score >= 80) return "stroke-score-excellent";
  if (score >= 60) return "stroke-score-good";
  if (score >= 40) return "stroke-score-fair";
  if (score >= 20) return "stroke-score-poor";
  return "stroke-score-bad";
};

export const ScoreRing = ({ score, size = 120, strokeWidth = 8, label }: ScoreRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="score-ring flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={getStrokeColor(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold font-display ${getScoreColor(score)}`}>{score}</span>
        </div>
      </div>
      {label && <span className="text-sm text-muted-foreground font-medium">{label}</span>}
    </div>
  );
};

export { getScoreColor };
