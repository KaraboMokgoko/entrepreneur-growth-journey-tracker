import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Flag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { canManageEnterprise } from "@/lib/roles";
import StatusBadge from "@/components/shared/StatusBadge";
import { LoadingSkeleton, ErrorState } from "@/components/shared/PageState";
import EmptyState from "@/components/shared/EmptyState";
import { differenceInCalendarDays, parseISO, format } from "date-fns";
import { toast } from "sonner";

const COLUMNS = ["Pending", "In progress", "Completed", "Overdue"];

function effectiveStatus(m) {
  if (m.status === "Completed") return "Completed";
  if (m.target_date && new Date(m.target_date) < new Date(new Date().toDateString()) && m.status !== "Completed") return "Overdue";
  return m.status;
}

export default function Milestones() {
  const { user } = useAuth();
  const canManage = canManageEnterprise(user?.role);
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [enterprises, setEnterprises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [ms, ents] = await Promise.all([
        base44.entities.Milestone.list("-target_date", 500),
        base44.entities.Enterprise.list("-created_date", 300),
      ]);
      setEnterprises(Object.fromEntries(ents.map((e) => [e.id, e])));
      setMilestones(ms);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const enriched = milestones.map((m) => ({ ...m, _status: effectiveStatus(m) }));

  const move = async (m, status) => {
    const patch = { status };
    if (status === "Completed" && !m.completed_date) patch.completed_date = new Date().toISOString().slice(0, 10);
    try { await base44.entities.Milestone.update(m.id, patch); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-5"><h1 className="text-2xl font-bold">Milestones</h1><p className="text-sm text-muted-foreground">{milestones.length} across the cohort</p></div>
      {loading ? <LoadingSkeleton /> :
       error ? <ErrorState message={error} onRetry={load} /> :
       enriched.length === 0 ? <EmptyState icon={Flag} title="No milestones" description="Add milestones from an enterprise's detail page." /> :
       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
         {COLUMNS.map((col) => (
           <div key={col} className="bg-slate-100 rounded-lg p-3 min-h-[120px]">
             <div className="flex items-center justify-between mb-2">
               <h4 className="text-sm font-semibold">{col}</h4>
               <Badge variant="outline">{enriched.filter((m) => m._status === col).length}</Badge>
             </div>
             <div className="space-y-2">
               {enriched.filter((m) => m._status === col).map((m) => (
                 <Card key={m.id} className="bg-white cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/enterprises/${m.enterprise_id}`)}>
                   <CardContent className="p-3">
                     <p className="text-sm font-medium">{m.title}</p>
                     <p className="text-xs text-muted-foreground">{enterprises[m.enterprise_id]?.name}</p>
                     {m.target_date && <p className="text-xs text-muted-foreground mt-1">{format(parseISO(m.target_date), "d MMM yyyy")}</p>}
                     {canManage && (
                       <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                         <Select value={m._status} onValueChange={(v) => move(m, v)}>
                           <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                           <SelectContent>{["Pending", "In progress", "Completed", "Overdue"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                         </Select>
                       </div>
                    )}
                   </CardContent>
                 </Card>
               ))}
             </div>
           </div>
         ))}
       </div>}
    </div>
  );
}