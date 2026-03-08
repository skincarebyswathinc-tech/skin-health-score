import { motion } from "framer-motion";
import { ScanFace } from "lucide-react";
import { useEffect, useState } from "react";

const stages = [
  "Detecting facial features…",
  "Analyzing pores & texture…",
  "Evaluating hydration levels…",
  "Checking pigmentation…",
  "Measuring skin elasticity…",
  "Generating your score…",
];

export const AnalysisLoading = ({ imageUrl }: { imageUrl?: string | null }) => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const progress = ((stageIndex + 1) / stages.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card-elevated p-10 text-center space-y-8"
    >
      {/* Animated scan visual */}
      <div className="relative w-36 h-36 mx-auto">
        {imageUrl ? (
          <img src={imageUrl} alt="Scanning" className="w-full h-full rounded-2xl object-cover" />
        ) : (
          <div className="w-full h-full rounded-2xl bg-muted flex items-center justify-center">
            <ScanFace className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {/* Scan line overlay */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <motion.div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        {/* Breathing ring */}
        <div className="absolute -inset-3 rounded-3xl border-2 border-primary/20 animate-breathing" />
      </div>

      {/* Progress */}
      <div className="max-w-xs mx-auto space-y-3">
        <div className="metric-bar">
          <motion.div
            className="metric-bar-fill hero-gradient"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <motion.p
          key={stageIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground font-medium"
        >
          {stages[stageIndex]}
        </motion.p>
      </div>

      <p className="text-xs text-muted-foreground/60">This usually takes 10–20 seconds</p>
    </motion.div>
  );
};
