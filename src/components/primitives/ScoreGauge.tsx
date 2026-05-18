import type { Band } from "@/components/types";
import { BAND_LABEL } from "@/components/types";

// The product's central number, treated as a hero instrument: a drawn arc
// with a soft bloom, a tick ring, and a serif numeral. The arc animates on
// load (gaugeDraw); with reduced motion it renders at its final value because
// the inline strokeDashoffset already equals the end state.

const BAND: Record<Band, { from: string; to: string; chip: string; rgb: string }> = {
  healthy: { from: "#7bd14a", to: "#aee06a", chip: "text-signal-good", rgb: "rgb(var(--signal-good))" },
  at_risk: { from: "#f0a93a", to: "#ecb23e", chip: "text-signal-warn", rgb: "rgb(var(--signal-warn))" },
  invisible: { from: "#ff6b6b", to: "#ff955c", chip: "text-signal-risk", rgb: "rgb(var(--signal-risk))" },
};

export function ScoreGauge({
  score,
  band,
  size = 236,
}: {
  score: number;
  band: Band;
  size?: number;
}) {
  const stroke = 13;
  const radius = size / 2 - stroke - 9;
  const c = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const end = c * (1 - pct);
  const tone = BAND[band];
  const center = size / 2;
  const ticks = Array.from({ length: 40 });

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <div
          aria-hidden
          className="absolute inset-7 rounded-full blur-2xl"
          style={{ background: tone.rgb, opacity: 0.16 }}
        />
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="relative -rotate-90"
          role="img"
          aria-label={`AI Representation Quality ${score} of 100, band ${BAND_LABEL[band]}`}
        >
          <defs>
            <linearGradient id="arq-arc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={tone.from} />
              <stop offset="100%" stopColor={tone.to} />
            </linearGradient>
          </defs>

          {ticks.map((_, i) => {
            const a = (i / ticks.length) * 2 * Math.PI;
            const r1 = radius + stroke / 2 + 5;
            const r2 = r1 + (i % 5 === 0 ? 6 : 3);
            return (
              <line
                key={i}
                x1={center + r1 * Math.cos(a)}
                y1={center + r1 * Math.sin(a)}
                x2={center + r2 * Math.cos(a)}
                y2={center + r2 * Math.sin(a)}
                stroke="rgba(255,255,255,0.13)"
                strokeWidth={1}
              />
            );
          })}

          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="var(--surface-sunk)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#arq-arc)"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={end}
            className="animate-gauge"
            style={
              {
                "--dash-start": `${c}`,
                "--dash-end": `${end}`,
              } as React.CSSProperties
            }
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[3.7rem] leading-none tabular text-ink">
            {score}
          </span>
          <span className="mt-1 font-mono text-[0.62rem] uppercase tracking-kicker text-ink-faint">
            ARQ / 100
          </span>
        </div>
      </div>
      <span
        className={`mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface-raised px-4 py-1.5 text-sm font-medium ${tone.chip}`}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone.rgb }} />
        {BAND_LABEL[band]}
      </span>
    </div>
  );
}
