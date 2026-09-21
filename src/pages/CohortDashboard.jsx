import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Building2, Handshake, Flag, Activity } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { healthColor } from "@/lib/scoring";
import { FUNDING_ITEMS, PROCUREMENT_ITEMS, readinessScore } from "@/lib/scoring";
import KpiCard from "@/components/dashboard/KpiCard";
import { LoadingSkeleton, ErrorState } from "@/components/shared/PageState";
import EmptyState from "@/components/shared/EmptyState";
import { format, parseISO } from "date-fns";

const SECTOR_COLORS = { Agriculture: "#16a34a", Retail: "#f59e0b", Technology: "#0ea5e9" };
const STAGE_COLORS = ["#0f766e", "#0d9488", "#14b8a6", "#5eead4"];
const REVENUE_COLORS = ["#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155", "#0f172a"];

export default function CohortDashboard() {
  const { user } = useAuth();
  const role = user?.role || "user";
  const anonymize = role === "funder";
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [enterprises, diagnostics, interventions, milestones, compliance, funding, procurement] = await Promise.all([
        base44.entities.Enterprise.list("-created_date", 300),
        base44.entities.Diagnostic.list("-assessment_date", 1000),
        base44.entities.Intervention.list("-intervention_date", 1000),
        base44.entities.Milestone.list("-created_date", 1000),
        base44.entities.ComplianceRecord.list("-created_date", 1000),
        base44.entities.FundingReadiness.list("-assessment_date", 500),
        base44.entities.ProcurementReadiness.list("-assessment_date", 500),
      ]);
      setData({ enterprises, diagnostics, interventions, milestones, compliance, funding, procurement });
    } catch (e) { setError(e.message || "Failed to load"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const computed = useMemo(() => {
    if (!data) return null;
    const { enterprises, diagnostics, interventions, milestones, compliance, funding, procurement } = data;
    const scoreMap = {};
    diagnostics.forEach((d) => {
      const cur = scoreMap[d.enterprise_id];
      if (!cur || (d.assessment_date || "") > (cur.assessment_date || "")) scoreMap[d.enterprise_id] = d;
    });
    const avgHealth = enterprises.length ? Math.round(enterprises.reduce((s, e) => s + (scoreMap[e.id]?.overall_score || 0), 0) / enterprises.length) : 0;

    const bySector = {};
    enterprises.forEach((e) => { bySector[e.sector] = (bySector[e.sector] || 0) + 1; });
    const byStage = {};
    enterprises.forEach((e) => { byStage[e.stage] = (byStage[e.stage] || 0) + 1; });
    const byRevenue = {};
    enterprises.forEach((e) => { byRevenue[e.revenue_band || "Pre-revenue"] = (byRevenue[e.revenue_band || "Pre-revenue"] || 0) + 1; });

    // trend: average health score over time (by month)
    const byMonth = {};
    diagnostics.forEach((d) => {
      const m = d.assessment_date ? format(parseISO(d.assessment_date), "MMM yy") : "";
      (byMonth[m] = byMonth[m] || []).push(d.overall_score || 0);
    });
    const trend = Object.entries(byMonth).map(([m, vals]) => ({ date: m, score: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) }));

    // readiness heatmap by sector
    const sectors = [...new Set(enterprises.map((e) => e.sector))];
    const heat = sectors.map((sec) => {
      const entIds = enterprises.filter((e) => e.sector === sec).map((e) => e.id);
      const comp = compliance.filter((c) => entIds.includes(c.enterprise_id));
      const fund = funding.filter((f) => entIds.includes(f.enterprise_id));
      const proc = procurement.filter((p) => entIds.includes(p.enterprise_id));
      const compScore = comp.length ? Math.round(comp.filter((c) => c.status === "Valid").length / comp.length * 100) : 0;
      const fundScore = fund.length ? Math.round(fund.reduce((s, f) => s + readinessScore(f.checklist, FUNDING_ITEMS), 0) / fund.length) : 0;
      const procScore = proc.length ? Math.round(proc.reduce((s, p) => s + readinessScore(p.checklist, PROCUREMENT_ITEMS), 0) / proc.length) : 0;
      return { sector: sec, compliance: compScore, funding: fundScore, procurement: procScore };
    });

    return { scoreMap, avgHealth, bySector, byStage, byRevenue, trend, heat };
  }, [data]);

  if (loading) return <div className="p-6"><LoadingSkeleton rows={6} /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={load} /></div>;
  if (!data || data.enterprises.length === 0) return <div className="p-6"><EmptyState icon={Building2} title="No enterprises yet" description="Add enterprises to see cohort analytics." /></div>;

  const c = computed;
  const sectorBars = Object.entries(c.bySector).map(([name, count]) => ({ name, count }));
  const stageBars = Object.entries(c.byStage).map(([name, count]) => ({ name, count }));
  const revenuePies = Object.entries(c.byRevenue).map(([name, value]) => ({ name, value }));

  const labelFor = (e, i) => anonymize ? `Enterprise ${String.fromCharCode(65 + i)}` : e.name;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{anonymize ? "Cohort Dashboard" : "Cohort Dashboard"}</h1>
        <p className="text-sm text-muted-foreground">{anonymize ? "Anonymized aggregate view of the cohort" : "Overview of all enterprises on the growth journey"}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Building2} label="Enterprises" value={data.enterprises.length} accent="teal" />
        <KpiCard icon={Handshake} label="Interventions" value={data.interventions.length} accent="blue" />
        <KpiCard icon={Flag} label="Milestones" value={data.milestones.length} accent="amber" />
        <KpiCard icon={Activity} label="Avg health score" value={`${c.avgHealth}%`} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Enterprises by sector</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sectorBars}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip /><Bar dataKey="count" name="Enterprises" radius={[6, 6, 0, 0]}>
                  {sectorBars.map((entry, i) => <Cell key={i} fill={SECTOR_COLORS[entry.name] || "#0f766e"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Enterprises by stage</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stageBars}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip /><Bar dataKey="count" name="Enterprises" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Revenue band distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={revenuePies} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {revenuePies.map((_, i) => <Cell key={i} fill={REVENUE_COLORS[i % REVENUE_COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Average health score over time</CardTitle></CardHeader>
          <CardContent>
            {c.trend.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={c.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip /><Line type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyState title="No diagnostic data yet" />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Readiness by sector</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Sector</TableHead><TableHead className="text-right">Compliance</TableHead><TableHead className="text-right">Funding</TableHead><TableHead className="text-right">Procurement</TableHead></TableRow></TableHeader>
              <TableBody>
                {c.heat.map((h) => (
                  <TableRow key={h.sector}>
                    <TableCell className="font-medium">{h.sector}</TableCell>
                    <TableCell className="text-right" style={{ color: healthColor(h.compliance) }}>{h.compliance}%</TableCell>
                    <TableCell className="text-right" style={{ color: healthColor(h.funding) }}>{h.funding}%</TableCell>
                    <TableCell className="text-right" style={{ color: healthColor(h.procurement) }}>{h.procurement}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{anonymize ? "Cohort enterprises" : "Enterprises"}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>{anonymize ? "Label" : "Name"}</TableHead><TableHead>Sector</TableHead><TableHead>Stage</TableHead><TableHead>Revenue band</TableHead><TableHead className="text-right">Health</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.enterprises.map((e, i) => {
                  const score = c.scoreMap[e.id]?.overall_score || 0;
                  return (
                    <TableRow key={e.id} className={anonymize ? "" : "cursor-pointer hover:bg-slate-50"} onClick={() => !anonymize && navigate(`/enterprises/${e.id}`)}>
                      <TableCell className="font-medium">{labelFor(e, i)}</TableCell>
                      <TableCell>{anonymize ? e.sector : e.sector}</TableCell>
                      <TableCell>{e.stage}</TableCell>
                      <TableCell className="text-xs">{anonymize ? "—" : (e.revenue_band || "—")}</TableCell>
                      <TableCell className="text-right"><span className="font-bold" style={{ color: healthColor(score) }}>{Math.round(score)}%</span></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}