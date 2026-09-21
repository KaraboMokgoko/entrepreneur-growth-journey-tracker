import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Wand2, ListChecks } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { CATEGORY_LABELS, generateRecommendedActions } from "@/lib/scoring";

const STATUSES = ["Not started", "In progress", "Completed", "Blocked"];
const PRIORITIES = ["High", "Medium", "Low"];

export default function DevelopmentPlanTab({ enterprise, diagnostics, actions, canManage, onChanged }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const filtered = actions.filter((a) =>
    (filterStatus === "all" || a.status === filterStatus) &&
    (filterCategory === "all" || a.category === filterCategory)
  );

  const generateFromDiagnostic = async () => {
    const latest = [...diagnostics].sort((a, b) => (b.assessment_date || "").localeCompare(a.assessment_date || ""))[0];
    if (!latest) { toast.error("Run a diagnostic first"); return; }
    const recommended = latest.recommended_actions?.length ? latest.recommended_actions : generateRecommendedActions(latest.scores);
    const existing = new Set(actions.map((a) => a.description));
    const toCreate = recommended.filter((r) => !existing.has(r)).map((r) => {
      const cat = Object.entries(CATEGORY_LABELS).find(([, label]) => r.toLowerCase().includes(label.toLowerCase().split(" ")[0]));
      return {
        enterprise_id: enterprise.id,
        diagnostic_id: latest.id,
        description: r,
        category: cat ? cat[0] : "strategy_business_model",
        status: "Not started",
        priority: "Medium",
      };
    });
    if (!toCreate.length) { toast.info("All recommended actions already exist"); return; }
    try {
      await base44.entities.DevelopmentAction.bulkCreate(toCreate);
      toast.success(`Created ${toCreate.length} actions`);
      onChanged?.();
    } catch (err) {
      toast.error(err.message || "Could not generate actions");
    }
  };

  const updateStatus = async (action, status) => {
    try {
      await base44.entities.DevelopmentAction.update(action.id, { status });
      onChanged?.();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={generateFromDiagnostic}><Wand2 className="w-4 h-4 mr-1.5" /> Generate from diagnostic</Button>
            <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="w-4 h-4 mr-1.5" /> Add action</Button>
          </div>
        )}
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={ListChecks} title="No development actions" description="Add actions manually or generate them from a diagnostic." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead><TableHead>Category</TableHead><TableHead>Owner</TableHead>
                    <TableHead>Target</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id} className="cursor-pointer hover:bg-slate-50" onClick={() => { if (canManage) { setEditing(a); setOpen(true); } }}>
                      <TableCell className="font-medium max-w-[260px]">{a.description}</TableCell>
                      <TableCell className="text-xs">{a.category ? CATEGORY_LABELS[a.category] || a.category : "—"}</TableCell>
                      <TableCell>{a.owner || "—"}</TableCell>
                      <TableCell className="text-xs">{a.target_date || "—"}</TableCell>
                      <TableCell>
                        {canManage ? (
                          <Select value={a.status} onValueChange={(v) => { updateStatus(a, v); }} >
                            <SelectTrigger className="h-8 w-36" onClick={(e) => e.stopPropagation()}><SelectValue /></SelectTrigger>
                            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        ) : <StatusBadge status={a.status} />}
                      </TableCell>
                      <TableCell><StatusBadge status={a.priority} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      <ActionDialog open={open} setOpen={setOpen} editing={editing} enterpriseId={enterprise.id} onSaved={() => { setOpen(false); onChanged?.(); }} />
    </div>
  );
}

function ActionDialog({ open, setOpen, editing, enterpriseId, onSaved }) {
  const [form, setForm] = useState({ description: "", category: "finance", owner: "", target_date: "", status: "Not started", priority: "Medium", evidence: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ description: "", category: "finance", owner: "", target_date: "", status: "Not started", priority: "Medium", evidence: "", ...(editing || {}) });
    }
  }, [open, editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    if (!form.description?.trim()) { toast.error("Description required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, enterprise_id: enterpriseId };
      if (editing?.id) { await base44.entities.DevelopmentAction.update(editing.id, payload); toast.success("Action updated"); }
      else { await base44.entities.DevelopmentAction.create(payload); toast.success("Action added"); }
      onSaved();
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editing?.id ? "Edit action" : "Add action"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label>Description *</Label><Textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1.5"><Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-1.5"><Label>Owner</Label><Input value={form.owner} onChange={(e) => set("owner", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Target date</Label><Input type="date" value={form.target_date} onChange={(e) => set("target_date", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Evidence</Label><Textarea rows={2} value={form.evidence} onChange={(e) => set("evidence", e.target.value)} /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}