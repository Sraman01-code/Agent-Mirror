import type { Band } from "@/components/types";
import { BAND_LABEL } from "@/components/types";

const BAND_COLOR: Record<Band, string> = {
  healthy: "#34d399",
  at_risk: "#fbbf24",
  invisible: "#f87171",
};

export function ScoreGauge({
  score,
  band,
  size = 200,
}: {
  score: number;
  band: Band;
  size?: number;
}) {
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const color = BAND_COLOR[band];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#262626"
            strokeWidth={14}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={14}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-semibold tabular-nums">{score}</span>
          <span className="text-xs uppercase tracking-widest text-neutral-500">
            / 100 ARQ
          </span>
        </div>
      </div>
      <span
        className="mt-3 rounded-full px-3 py-1 text-sm font-medium"
        style={{ backgroundColor: `${color}1f`, color }}
      >
        {BAND_LABEL[band]}
      </span>
    </div>
  );
}
