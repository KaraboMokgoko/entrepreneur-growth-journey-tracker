import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ClipboardList } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { canAssess } from "@/lib/roles";
import { healthColor } from "@/lib/scoring";
import { LoadingSkeleton, ErrorState } from "@/components/shared/PageState";
import EmptyState from "@/components/shared/EmptyState";
import { format, parseISO } from "date-fns";

export default function DiagnosticList() {
  const { user } = useAuth();
  const canCreate = canAssess(user?.role);
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [enterprises, setEnterprises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [diags, ents] = await Promise.all([
        base44.entities.Diagnostic.list("-assessment_date", 500),
        base44.entities.Enterprise.list("-created_date", 300),
      ]);
      setEnterprises(Object.fromEntries(ents.map((e) => [e.id, e])));
      setRows(diags);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-2xl font-bold">Diagnostics</h1><p className="text-sm text-muted-foreground">{rows.length} assessments</p></div>
        {canCreate && <Button onClick={() => navigate("/diagnostics/new")}><Plus className="w-4 h-4 mr-1.5" /> New diagnostic</Button>}
      </div>
      {loading ? <LoadingSkeleton /> :
       error ? <ErrorState message={error} onRetry={load} /> :
       rows.length === 0 ? <EmptyState icon={ClipboardList} title="No diagnostics" description="Run a baseline assessment for an enterprise." /> :
       <Card><CardContent className="p-0">
         <div className="overflow-x-auto">
           <Table>
             <TableHeader><TableRow><TableHead>Enterprise</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Score</TableHead></TableRow></TableHeader>
             <TableBody>
               {rows.map((d) => (
                 <TableRow key={d.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/enterprises/${d.enterprise_id}`)}>
                   <TableCell className="font-medium">{enterprises[d.enterprise_id]?.name || "—"}</TableCell>
                   <TableCell><Badge variant={d.assessment_type === "baseline" ? "outline" : "secondary"}>{d.assessment_type}</Badge></TableCell>
                   <TableCell className="text-xs">{d.assessment_date ? format(parseISO(d.assessment_date), "d MMM yyyy") : "—"}</TableCell>
                   <TableCell className="text-right"><span className="font-bold" style={{ color: healthColor(d.overall_score) }}>{Math.round(d.overall_score)}%</span></TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </div>
       </CardContent></Card>}
    </div>
  );
}