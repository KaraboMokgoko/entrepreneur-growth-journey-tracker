import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Plus, Search, Building2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { canManageEnterprise } from "@/lib/roles";
import { healthColor } from "@/lib/scoring";
import EnterpriseForm from "@/components/enterprises/EnterpriseForm";
import { LoadingSkeleton, ErrorState } from "@/components/shared/PageState";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";

const SECTORS = ["Agriculture", "Retail", "Technology"];
const STAGES = ["Idea", "Startup", "Growth", "Established"];

export default function EnterpriseList() {
  const { user } = useAuth();
  const role = user?.role || "user";
  const canManage = canManageEnterprise(role);
  const navigate = useNavigate();
  const [enterprises, setEnterprises] = useState([]);
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");
  const [stage, setStage] = useState("all");
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [ents, diags] = await Promise.all([
        base44.entities.Enterprise.list("-created_date", 200),
        base44.entities.Diagnostic.list("-assessment_date", 500),
      ]);
      setEnterprises(ents); setDiagnostics(diags);
    } catch (e) { setError(e.message || "Failed to load"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const scoreMap = useMemo(() => {
    const m = {};
    diagnostics.forEach((d) => {
      const cur = m[d.enterprise_id];
      if (!cur || (d.assessment_date || "") > (cur.assessment_date || "")) m[d.enterprise_id] = d;
    });
    return m;
  }, [diagnostics]);

  const filtered = enterprises.filter((e) => {
    const matchesSearch = !search || (e.name + e.founder_name + e.sector).toLowerCase().includes(search.toLowerCase());
    const matchesSector = sector === "all" || e.sector === sector;
    const matchesStage = stage === "all" || e.stage === stage;
    return matchesSearch && matchesSector && matchesStage;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold">Enterprises</h1>
          <p className="text-sm text-muted-foreground">{enterprises.length} businesses on the growth journey</p>
        </div>
        {canManage && <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Add enterprise</Button>}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, founder or sector" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All sectors</SelectItem>{SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All stages</SelectItem>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {loading ? <LoadingSkeleton /> :
       error ? <ErrorState message={error} onRetry={load} /> :
       filtered.length === 0 ? <EmptyState icon={Building2} title="No enterprises" description={canManage ? "Add your first enterprise to begin." : "No enterprises match your filters."} actionLabel={canManage ? "Add enterprise" : undefined} onAction={canManage ? () => setOpen(true) : undefined} /> :
       <Card><CardContent className="p-0">
         <div className="overflow-x-auto">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Name</TableHead><TableHead>Sector</TableHead><TableHead>Stage</TableHead>
                 <TableHead className="text-right">Employees</TableHead><TableHead>Revenue band</TableHead><TableHead className="text-right">Health</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filtered.map((e) => {
                 const score = scoreMap[e.id]?.overall_score || 0;
                 return (
                   <TableRow key={e.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/enterprises/${e.id}`)}>
                     <TableCell className="font-medium">{e.name}</TableCell>
                     <TableCell>{e.sector}</TableCell>
                     <TableCell>{e.stage}</TableCell>
                     <TableCell className="text-right">{e.employee_count || 0}</TableCell>
                     <TableCell className="text-xs">{e.revenue_band || "—"}</TableCell>
                     <TableCell className="text-right">
                       <span className="font-bold" style={{ color: healthColor(score) }}>{Math.round(score)}%</span>
                     </TableCell>
                   </TableRow>
                 );
               })}
             </TableBody>
           </Table>
         </div>
       </CardContent></Card>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add enterprise</DialogTitle></DialogHeader>
          <EnterpriseForm onSaved={() => { setOpen(false); load(); toast.success("Enterprise created"); }} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}