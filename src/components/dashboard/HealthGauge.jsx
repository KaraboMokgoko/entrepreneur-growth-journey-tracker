import { healthColor, healthLabel } from "@/lib/scoring";

// Circular health gauge. score is 0-100.
export default function HealthGauge({ score = 0, size = 160, label = "Health Score" }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = c - (pct / 100) * c;
  const color = healthColor(pct);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={12} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={12}
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{Math.round(pct)}%</span>
          <span className="text-xs font-medium" style={{ color }}>{healthLabel(pct)}</span>
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground mt-2">{label}</p>
    </div>
  );
}