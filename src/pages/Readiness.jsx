import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { healthColor, FUNDING_ITEMS, PROCUREMENT_ITEMS, readinessScore } from "@/lib/scoring";
import { LoadingSkeleton, ErrorState } from "@/components/shared/PageState";
import EmptyState from "@/components/shared/EmptyState";

export default function Readiness() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [ents, funding, procurement, compliance] = await Promise.all([
        base44.entities.Enterprise.list("-created_date", 300),
        base44.entities.FundingReadiness.list("-assessment_date", 500),
        base44.entities.ProcurementReadiness.list("-assessment_date", 500),
        base44.entities.ComplianceRecord.list("-created_date", 1000),
      ]);
      const fundMap = {}; funding.forEach((f) => { fundMap[f.enterprise_id] = f; });
      const procMap = {}; procurement.forEach((p) => { procMap[p.enterprise_id] = p; });
      const compByEnt = {}; compliance.forEach((c) => { (compByEnt[c.enterprise_id] = compByEnt[c.enterprise_id] || []).push(c); });
      const built = ents.map((e) => {
        const f = fundMap[e.id]; const p = procMap[e.id]; const comp = compByEnt[e.id] || [];
        const fScore = f ? readinessScore(f.checklist, FUNDING_ITEMS) : 0;
        const pScore = p ? readinessScore(p.checklist, PROCUREMENT_ITEMS) : 0;
        const cScore = comp.length ? Math.round(comp.filter((c) => c.status === "Valid").length / comp.length * 100) : 0;
        return { e, fScore, pScore, cScore };
      });
      setRows(built);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-5"><h1 className="text-2xl font-bold">Readiness</h1><p className="text-sm text-muted-foreground">Funding, procurement and compliance across the cohort</p></div>
      {loading ? <LoadingSkeleton /> :
       error ? <ErrorState message={error} onRetry={load} /> :
       rows.length === 0 ? <EmptyState icon={ShieldCheck} title="No enterprises" /> :
       <Card><CardContent className="p-0">
         <div className="overflow-x-auto">
           <Table>
             <TableHeader><TableRow><TableHead>Enterprise</TableHead><TableHead className="text-right">Compliance</TableHead><TableHead className="text-right">Funding</TableHead><TableHead className="text-right">Procurement</TableHead></TableRow></TableHeader>
             <TableBody>
               {rows.map(({ e, fScore, pScore, cScore }) => (
                 <TableRow key={e.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/enterprises/${e.id}`)}>
                   <TableCell className="font-medium">{e.name}</TableCell>
                   <TableCell className="text-right font-bold" style={{ color: healthColor(cScore) }}>{cScore}%</TableCell>
                   <TableCell className="text-right font-bold" style={{ color: healthColor(fScore) }}>{fScore}%</TableCell>
                   <TableCell className="text-right font-bold" style={{ color: healthColor(pScore) }}>{pScore}%</TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </div>
       </CardContent></Card>}
    </div>
  );
}