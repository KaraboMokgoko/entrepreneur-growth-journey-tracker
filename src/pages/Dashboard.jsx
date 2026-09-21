import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Building2, ListChecks, Flag, Handshake, TrendingUp, TrendingDown, Plus, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useEnterpriseData, latestScore } from "@/lib/useEnterpriseData";
import { healthColor, healthLabel, scoreToRadarData, CATEGORIES, CATEGORY_LABELS, FUNDING_ITEMS, PROCUREMENT_ITEMS, readinessScore } from "@/lib/scoring";
import HealthGauge from "@/components/dashboard/HealthGauge";
import KpiCard from "@/components/dashboard/KpiCard";
import ScoreRadar from "@/components/dashboard/ScoreRadar";
import { LoadingSkeleton, ErrorState } from "@/components/shared/PageState";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/shared/StatusBadge";
import { format, parseISO, isThisMonth } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [enterprise, setEnterprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await base44.entities.Enterprise.list("-created_date", 200);
        // Entrepreneur: their own enterprise (created by them or assigned)
        const mine = list.find((e) => e.created_by_id === user?.id || (e.assigned_user_ids || []).includes(user?.id)) || list[0];
        setEnterprise(mine || null);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [user?.id]);

  if (loading) return <div className="p-6"><LoadingSkeleton rows={6} /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} /></div>;
  if (!enterprise) return <div className="p-6"><EmptyState icon={Building2} title="No enterprise linked to your account" description="Ask your practitioner to assign an enterprise to you." /></div>;

  return <EnterpriseDashboard enterprise={enterprise} />;
}

function EnterpriseDashboard({ enterprise }) {
  const linked = useEnterpriseData(enterprise.id);
  const [creating, setCreating] = useState(null);

  const score = latestScore(linked.diagnostics);
  const sorted = [...linked.diagnostics].sort((a, b) => (a.assessment_date || "").localeCompare(b.assessment_date || ""));
  const baseline = sorted.find((d) => d.assessment_type === "baseline") || sorted[0];
  const latest = sorted[sorted.length - 1];

  const milestonesCompleted = linked.milestones.length
    ? Math.round((linked.milestones.filter((m) => m.status === "Completed").length / linked.milestones.length) * 100)
    : 0;
  const fundingScore = linked.funding[0] ? readinessScore(linked.funding[0].checklist, FUNDING_ITEMS) : 0;
  const procurementScore = linked.procurement[0] ? readinessScore(linked.procurement[0].checklist, PROCUREMENT_ITEMS) : 0;
  const complianceScore = linked.compliance.length ? Math.round((linked.compliance.filter((c) => c.status === "Valid").length / linked.compliance.length) * 100) : 0;

  const radarData = useMemo(() => latest ? scoreToRadarData(latest.scores) : CATEGORIES.map((c) => ({ dimension: c.label, score: 0 })), [latest]);
  const trendData = sorted.map((d) => ({ date: d.assessment_date ? format(parseISO(d.assessment_date), "MMM yy") : "", score: Math.round(d.overall_score || 0) }));
  const readinessBars = [
    { name: "Compliance", score: complianceScore },
    { name: "Funding", score: fundingScore },
    { name: "Procurement", score: procurementScore },
  ];

  const gaps = latest?.priority_gaps?.length ? latest.priority_gaps : [];

  const actionsDueThisMonth = linked.actions.filter((a) => a.target_date && isThisMonth(parseISO(a.target_date)) && a.status !== "Completed");
  const recentMilestones = [...linked.milestones].sort((a, b) => (b.created_date || "").localeCompare(a.created_date || "")).slice(0, 5);
  const recentInterventions = [...linked.interventions].sort((a, b) => (b.intervention_date || "").localeCompare(a.intervention_date || "")).slice(0, 5);

  const scoreDelta = baseline && latest ? (latest.overall_score || 0) - (baseline.overall_score || 0) : 0;

  if (linked.loading) return <div className="p-6"><LoadingSkeleton rows={6} /></div>;

  const createAction = async (gap) => {
    const cat = CATEGORIES.find((c) => c.label === gap)?.key || "strategy_business_model";
    try {
      await base44.entities.DevelopmentAction.create({
        enterprise_id: enterprise.id, diagnostic_id: latest?.id, description: `Address gap: ${gap}`,
        category: cat, status: "Not started", priority: "High",
      });
      linked.reload();
    } catch (e) { /* ignore */ }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-5 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-teal-700 flex items-center justify-center"><Building2 className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-xl font-bold">{enterprise.name}</h1>
              <p className="text-sm text-muted-foreground">{enterprise.sector} · {enterprise.stage} · {enterprise.province}</p>
            </div>
          </div>
          <div className="ml-auto"><HealthGauge score={score} size={140} /></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={ListChecks} label="Health Score" value={`${Math.round(score)}%`} sub={healthLabel(score)} accent="teal" />
        <KpiCard icon={Flag} label="Milestones done" value={`${milestonesCompleted}%`} sub={`${linked.milestones.filter((m) => m.status === "Completed").length}/${linked.milestones.length} complete`} accent="emerald" />
        <KpiCard icon={ShieldCheck} label="Funding readiness" value={`${fundingScore}%`} accent="amber" />
        <KpiCard icon={ShieldCheck} label="Procurement readiness" value={`${procurementScore}%`} accent="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Capability radar</CardTitle></CardHeader>
          <CardContent><ScoreRadar data={radarData} showBaseline={!!baseline && baseline !== latest} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Overall score over time</CardTitle></CardHeader>
          <CardContent>
            {trendData.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip /><Line type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyState title="No assessments yet" />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Readiness scores</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={readinessBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip /><Bar dataKey="score" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Top priority gaps</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {gaps.length === 0 ? <p className="text-sm text-muted-foreground">No priority gaps identified.</p> :
              gaps.slice(0, 5).map((g) => (
                <div key={g} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-red-50">
                  <span className="text-sm font-medium text-red-700">{g}</span>
                  <Button size="sm" variant="outline" onClick={() => createAction(g)}><Plus className="w-3.5 h-3.5 mr-1" /> Create action</Button>
                </div>
              ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Actions due this month</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {actionsDueThisMonth.length === 0 ? <p className="text-sm text-muted-foreground">No actions due this month.</p> :
              actionsDueThisMonth.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2 py-1">
                  <span className="text-sm">{a.description}</span>
                  <StatusBadge status={a.status} />
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Growth indicators</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Indicator label="Score change" value={`${scoreDelta > 0 ? "+" : ""}${Math.round(scoreDelta)}%`} delta={scoreDelta} />
            <Indicator label="Employees" value={enterprise.employee_count || 0} />
            <Indicator label="Revenue band" value={enterprise.revenue_band || "—"} text />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent milestones</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentMilestones.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> :
              recentMilestones.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-2 py-1">
                  <span className="text-sm truncate">{m.title}</span>
                  <StatusBadge status={m.status} />
                </div>
              ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent interventions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentInterventions.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> :
              recentInterventions.map((i) => (
                <div key={i.id} className="py-1">
                  <p className="text-sm font-medium truncate">{i.provider} · {i.intervention_type}</p>
                  <p className="text-xs text-muted-foreground truncate">{i.purpose}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button asChild variant="outline"><Link to={`/enterprises/${enterprise.id}`}>View full enterprise detail →</Link></Button>
      </div>
    </div>
  );
}

function Indicator({ label, value, delta, text }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1 font-medium">
        {!text && delta !== undefined && (delta > 0 ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : delta < 0 ? <TrendingDown className="w-4 h-4 text-red-600" /> : null)}
        {value}
      </span>
    </div>
  );
}