import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ListChecks } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { canManageEnterprise } from "@/lib/roles";
import { CATEGORY_LABELS } from "@/lib/scoring";
import StatusBadge from "@/components/shared/StatusBadge";
import { LoadingSkeleton, ErrorState } from "@/components/shared/PageState";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";

const STATUSES = ["Not started", "In progress", "Completed", "Blocked"];

export default function DevelopmentPlan() {
  const { user } = useAuth();
  const canManage = canManageEnterprise(user?.role);
  const navigate = useNavigate();
  const [actions, setActions] = useState([]);
  const [enterprises, setEnterprises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [acts, ents] = await Promise.all([
        base44.entities.DevelopmentAction.list("-created_date", 500),
        base44.entities.Enterprise.list("-created_date", 300),
      ]);
      setEnterprises(Object.fromEntries(ents.map((e) => [e.id, e])));
      setActions(acts);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = actions.filter((a) => filterStatus === "all" || a.status === filterStatus);

  const updateStatus = async (a, status) => {
    try { await base44.entities.DevelopmentAction.update(a.id, { status }); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-2xl font-bold">Development Plan</h1><p className="text-sm text-muted-foreground">{actions.length} actions across the cohort</p></div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All statuses</SelectItem>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {loading ? <LoadingSkeleton /> :
       error ? <ErrorState message={error} onRetry={load} /> :
       filtered.length === 0 ? <EmptyState icon={ListChecks} title="No actions" description="Actions are created from diagnostics or manually per enterprise." /> :
       <Card><CardContent className="p-0">
         <div className="overflow-x-auto">
           <Table>
             <TableHeader><TableRow><TableHead>Enterprise</TableHead><TableHead>Action</TableHead><TableHead>Category</TableHead><TableHead>Target</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead></TableRow></TableHeader>
             <TableBody>
               {filtered.map((a) => (
                 <TableRow key={a.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/enterprises/${a.enterprise_id}`)}>
                   <TableCell className="font-medium">{enterprises[a.enterprise_id]?.name || "—"}</TableCell>
                   <TableCell className="max-w-[260px]">{a.description}</TableCell>
                   <TableCell className="text-xs">{a.category ? CATEGORY_LABELS[a.category] || a.category : "—"}</TableCell>
                   <TableCell className="text-xs">{a.target_date || "—"}</TableCell>
                   <TableCell onClick={(e) => e.stopPropagation()}>
                     {canManage ? (
                       <Select value={a.status} onValueChange={(v) => updateStatus(a, v)}><SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                         <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                     ) : <StatusBadge status={a.status} />}
                   </TableCell>
                   <TableCell><StatusBadge status={a.priority} /></TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </div>
       </CardContent></Card>}
    </div>
  );
}