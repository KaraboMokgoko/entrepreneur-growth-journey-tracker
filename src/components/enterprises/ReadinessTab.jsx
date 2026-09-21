import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import ReadinessChecklist from "@/components/readiness/ReadinessChecklist";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { FUNDING_ITEMS, PROCUREMENT_ITEMS, readinessScore } from "@/lib/scoring";
import { ShieldCheck, Plus, Pencil, Trash2 } from "lucide-react";

const COMP_STATUSES = ["Valid", "Expired", "Pending", "Not started"];

export default function ReadinessTab({ enterprise, compliance, funding, procurement, canManage, onChanged }) {
  const [tab, setTab] = useState("compliance");
  const fundingRecord = funding[0];
  const procurementRecord = procurement[0];
  const fundingScore = fundingRecord ? readinessScore(fundingRecord.checklist, FUNDING_ITEMS) : 0;
  const procurementScore = procurementRecord ? readinessScore(procurementRecord.checklist, PROCUREMENT_ITEMS) : 0;
  const complianceScore = compliance.length ? Math.round((compliance.filter((c) => c.status === "Valid").length / compliance.length) * 100) : 0;

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="compliance">Compliance · {complianceScore}%</TabsTrigger>
        <TabsTrigger value="funding">Funding · {fundingScore}%</TabsTrigger>
        <TabsTrigger value="procurement">Procurement · {procurementScore}%</TabsTrigger>
      </TabsList>
      <TabsContent value="compliance" className="mt-4">
        <CompliancePanel enterprise={enterprise} compliance={compliance} canManage={canManage} onChanged={onChanged} />
      </TabsContent>
      <TabsContent value="funding" className="mt-4">
        <Card><CardContent className="p-5">
          <ReadinessChecklist entityName="FundingReadiness" items={FUNDING_ITEMS} record={fundingRecord} enterpriseId={enterprise.id} onChanged={onChanged} />
        </CardContent></Card>
      </TabsContent>
      <TabsContent value="procurement" className="mt-4">
        <Card><CardContent className="p-5">
          <ReadinessChecklist entityName="ProcurementReadiness" items={PROCUREMENT_ITEMS} record={procurementRecord} enterpriseId={enterprise.id} onChanged={onChanged} />
        </CardContent></Card>
      </TabsContent>
    </Tabs>
  );
}

function CompliancePanel({ enterprise, compliance, canManage, onChanged }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ item: "", status: "Not started", expiry_date: "", evidence: "", notes: "" });

  const openNew = () => { setEditing(null); setForm({ item: "", status: "Not started", expiry_date: "", evidence: "", notes: "" }); setOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setOpen(true); };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.item?.trim()) { toast.error("Item required"); return; }
    try {
      const payload = { ...form, enterprise_id: enterprise.id };
      if (editing?.id) { await base44.entities.ComplianceRecord.update(editing.id, payload); toast.success("Updated"); }
      else { await base44.entities.ComplianceRecord.create(payload); toast.success("Added"); }
      setOpen(false); onChanged?.();
    } catch (err) { toast.error(err.message); }
  };
  const remove = async (c) => { if (!confirm("Delete?")) return; try { await base44.entities.ComplianceRecord.delete(c.id); toast.success("Deleted"); onChanged?.(); } catch (e) { toast.error(e.message); } };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canManage && <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Add item</Button>}
      </div>
      {compliance.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No compliance records" description="Add CIPC, tax, B-BBEE, UIF and COIDA items." />
      ) : (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr><th className="text-left p-3 font-medium">Item</th><th className="text-left p-3 font-medium">Status</th><th className="text-left p-3 font-medium">Expiry</th>{canManage && <th className="p-3"></th>}</tr>
              </thead>
              <tbody>
                {compliance.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{c.item}</td>
                    <td className="p-3"><StatusBadge status={c.status} /></td>
                    <td className="p-3 text-xs">{c.expiry_date || "—"}</td>
                    {canManage && <td className="p-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(c)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent></Card>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-lg w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold">{editing ? "Edit item" : "Add compliance item"}</h3>
            <form onSubmit={save} className="space-y-3">
              <div className="space-y-1.5"><Label>Item *</Label><Input value={form.item} onChange={(e) => set("item", e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => set("status", v)}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{COMP_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1.5"><Label>Expiry date</Label><Input type="date" value={form.expiry_date || ""} onChange={(e) => set("expiry_date", e.target.value)} /></div>
              </div>
              <div className="space-y-1.5"><Label>Evidence</Label><Input value={form.evidence || ""} onChange={(e) => set("evidence", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Notes</Label><Input value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} /></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}