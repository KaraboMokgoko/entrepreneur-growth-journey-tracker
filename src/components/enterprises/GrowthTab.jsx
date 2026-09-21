import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from "recharts";
import ScoreRadar from "@/components/dashboard/ScoreRadar";
import EmptyState from "@/components/shared/EmptyState";
import { scoreToRadarData, CATEGORIES } from "@/lib/scoring";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function GrowthTab({ enterprise, diagnostics, reassessments }) {
  const sorted = [...diagnostics].sort((a, b) => (a.assessment_date || "").localeCompare(b.assessment_date || ""));
  const baseline = sorted.find((d) => d.assessment_type === "baseline") || sorted[0];
  const latest = sorted[sorted.length - 1];

  if (!baseline || !latest) {
    return <EmptyState title="Not enough data" description="Run a baseline diagnostic and a reassessment to see growth deltas." />;
  }

  const radarData = CATEGORIES.map((c) => ({
    dimension: c.label,
    score: Number(latest.scores?.[c.key] ?? 0) * 20,
    baseline: Number(baseline.scores?.[c.key] ?? 0) * 20,
  }));

  const trendData = sorted.map((d) => ({
    date: d.assessment_date ? format(parseISO(d.assessment_date), "MMM yy") : "",
    score: Math.round(d.overall_score || 0),
  }));

  const delta = (latest.overall_score || 0) - (baseline.overall_score || 0);
  const DeltaIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const deltaColor = delta > 0 ? "text-emerald-600" : delta < 0 ? "text-red-600" : "text-slate-500";

  const barData = [
    { name: "Baseline", score: Math.round(baseline.overall_score || 0) },
    { name: "Latest", score: Math.round(latest.overall_score || 0) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DeltaCard label="Overall score" before={Math.round(baseline.overall_score || 0)} after={Math.round(latest.overall_score || 0)} suffix="%" />
        <DeltaCard label="Employees" before={enterprise?.employee_count || 0} after={enterprise?.employee_count || 0} />
        <DeltaCard label="Revenue band" before={baseline.assessment_date ? "—" : "—"} after={enterprise?.revenue_band || "—"} text />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Capability radar — baseline vs latest</CardTitle></CardHeader>
          <CardContent><ScoreRadar data={radarData} showBaseline /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Overall score over time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Baseline vs latest score</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className={`flex items-center gap-2 mt-3 ${deltaColor}`}>
            <DeltaIcon className="w-5 h-5" />
            <span className="font-medium">{delta > 0 ? "+" : ""}{Math.round(delta)}% change since baseline</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DeltaCard({ label, before, after, suffix = "", text }) {
  const diff = text ? null : (after - before);
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-end gap-2 mt-1">
          <div>
            <p className="text-xs text-muted-foreground">Before</p>
            <p className="text-lg font-semibold">{before}{suffix}</p>
          </div>
          <span className="text-muted-foreground pb-1">→</span>
          <div>
            <p className="text-xs text-muted-foreground">After</p>
            <p className="text-lg font-semibold">{after}{suffix}</p>
          </div>
          {!text && diff !== null && (
            <span className={`ml-auto pb-1 text-sm font-medium ${diff > 0 ? "text-emerald-600" : diff < 0 ? "text-red-600" : "text-slate-500"}`}>
              {diff > 0 ? "+" : ""}{diff}{suffix}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}