import { motion } from "framer-motion";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showLabel?: boolean;
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

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Poor";
  return "Needs Care";
};

export const ScoreRing = ({ score, size = 120, strokeWidth = 8, label, showLabel = false }: ScoreRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const fontSize = size >= 120 ? "text-3xl" : size >= 60 ? "text-xl" : "text-sm";

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
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={getStrokeColor(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${fontSize} font-bold font-display ${getScoreColor(score)}`}>{score}</span>
          {showLabel && (
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
              {getScoreLabel(score)}
            </span>
          )}
        </div>
      </div>
      {label && <span className="text-sm text-muted-foreground font-medium">{label}</span>}
    </div>
  );
};

export { getScoreColor };
