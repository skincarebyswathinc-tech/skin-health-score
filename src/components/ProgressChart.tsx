import { useScans, type Scan } from "@/hooks/useScans";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 !bg-card/95 text-xs space-y-1 min-w-[140px]">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex justify-between gap-4">
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="font-semibold font-display" style={{ color: entry.color }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const ProgressChart = () => {
  const { data: scans } = useScans();

  if (!scans || scans.length < 2) return null;

  // Chronological order, last 20
  const chartData = [...scans]
    .reverse()
    .slice(-20)
    .map((s) => ({
      date: format(new Date(s.created_at), "MMM d"),
      Overall: s.overall_score,
      Wrinkles: s.wrinkles_score ?? 0,
      Pores: s.pores_score ?? 0,
      Redness: s.redness_score ?? 0,
      Pigmentation: s.pigmentation_score ?? 0,
      Hydration: s.hydration_score ?? 0,
    }));

  const metrics = [
    { key: "Overall", color: "hsl(164, 60%, 40%)" },
    { key: "Hydration", color: "hsl(200, 60%, 50%)" },
    { key: "Wrinkles", color: "hsl(280, 50%, 55%)" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card-elevated p-6 sm:p-8"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-accent-foreground" />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold">Score Trends</h3>
          <p className="text-xs text-muted-foreground">Your skin health over time</p>
        </div>
      </div>

      <div className="h-[220px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <defs>
              {metrics.map(({ key, color }) => (
                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 92%)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }}
              tickLine={false}
              axisLine={false}
              tickCount={5}
            />
            <Tooltip content={<CustomTooltip />} />
            {metrics.map(({ key, color }) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${key})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(0, 0%, 100%)" }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-4">
        {metrics.map(({ key, color }) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {key}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
