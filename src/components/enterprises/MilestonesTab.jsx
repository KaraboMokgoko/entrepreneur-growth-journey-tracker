import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Plus, Flag, LayoutGrid, List, Pencil, Trash2 } from "lucide-react";
import MilestoneForm from "@/components/milestones/MilestoneForm";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/shared/StatusBadge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { differenceInCalendarDays, parseISO, format } from "date-fns";

const COLUMNS = ["Pending", "In progress", "Completed", "Overdue"];
const STATUSES = ["Pending", "In progress", "Completed", "Overdue"];

function effectiveStatus(m) {
  if (m.status === "Completed") return "Completed";
  if (m.target_date && new Date(m.target_date) < new Date(new Date().toDateString()) && m.status !== "Completed") return "Overdue";
  return m.status;
}

export default function MilestonesTab({ enterprise, milestones, canManage, onChanged }) {
  const [view, setView] = useState("kanban");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const enriched = milestones.map((m) => ({ ...m, _status: effectiveStatus(m) }));

  const move = async (m, status) => {
    const patch = { status };
    if (status === "Completed" && !m.completed_date) patch.completed_date = new Date().toISOString().slice(0, 10);
    try { await base44.entities.Milestone.update(m.id, patch); onChanged?.(); }
    catch (e) { toast.error(e.message); }
  };
  const remove = async (m) => {
    if (!confirm("Delete this milestone?")) return;
    try { await base44.entities.Milestone.delete(m.id); toast.success("Deleted"); onChanged?.(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <Button variant={view === "kanban" ? "default" : "outline"} size="sm" onClick={() => setView("kanban")}><LayoutGrid className="w-4 h-4 mr-1.5" /> Board</Button>
          <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}><List className="w-4 h-4 mr-1.5" /> List</Button>
        </div>
        {canManage && <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="w-4 h-4 mr-1.5" /> Add milestone</Button>}
      </div>

      {enriched.length === 0 ? (
        <EmptyState icon={Flag} title="No milestones" description="Add milestones to track the growth journey." />
      ) : view === "kanban" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {COLUMNS.map((col) => (
            <div key={col} className="bg-slate-100 rounded-lg p-3 min-h-[120px]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">{col}</h4>
                <Badge variant="outline">{enriched.filter((m) => m._status === col).length}</Badge>
              </div>
              <div className="space-y-2">
                {enriched.filter((m) => m._status === col).map((m) => (
                  <Card key={m.id} className="bg-white cursor-pointer hover:shadow-md transition-shadow" onClick={() => { if (canManage) { setEditing(m); setOpen(true); } }}>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium">{m.title}</p>
                      {m.target_date && <p className="text-xs text-muted-foreground mt-1">{format(parseISO(m.target_date), "d MMM yyyy")}</p>}
                      <DaysChip m={m} />
                      {canManage && (
                        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                          <Select value={m._status} onValueChange={(v) => move(m, v)}>
                            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {enriched.map((m) => (
            <Card key={m.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { if (canManage) { setEditing(m); setOpen(true); } }}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.target_date ? format(parseISO(m.target_date), "d MMM yyyy") : "No target date"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <DaysChip m={m} />
                  <StatusBadge status={m._status} />
                  {canManage && <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); remove(m); }}><Trash2 className="w-4 h-4 text-red-500" /></Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit milestone" : "Add milestone"}</DialogTitle></DialogHeader>
          <MilestoneForm milestone={editing} enterpriseId={enterprise.id} onSaved={() => { setOpen(false); onChanged?.(); }} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DaysChip({ m }) {
  if (!m.target_date || m._status === "Completed") return null;
  const days = differenceInCalendarDays(parseISO(m.target_date), new Date());
  const overdue = days < 0;
  return <Badge variant="outline" className={overdue ? "text-red-600 border-red-200" : "text-amber-600 border-amber-200"}>{overdue ? `${Math.abs(days)}d overdue` : `${days}d left`}</Badge>;
}