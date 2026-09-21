import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const TYPES = ["Training", "Mentorship", "Funding", "Compliance", "Market access", "Other"];
const PROVIDERS = ["SCA", "SEDA", "NYDA", "Absa", "Department of Trade", "Other"];

export default function InterventionForm({ intervention, enterpriseId, onSaved, onCancel }) {
  const [form, setForm] = useState({
    provider: "SCA", intervention_date: new Date().toISOString().slice(0, 10),
    intervention_type: "Training", purpose: "", outcome: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (intervention) setForm((f) => ({ ...f, ...intervention })); }, [intervention]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.purpose?.trim()) { toast.error("Purpose is required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, enterprise_id: enterpriseId };
      if (intervention?.id) {
        await base44.entities.Intervention.update(intervention.id, payload);
        toast.success("Intervention updated");
      } else {
        await base44.entities.Intervention.create(payload);
        toast.success("Intervention recorded");
      }
      onSaved?.();
    } catch (err) {
      toast.error(err.message || "Could not save intervention");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Provider</Label>
          <Select value={form.provider} onValueChange={(v) => set("provider", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{PROVIDERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={form.intervention_type} onValueChange={(v) => set("intervention_type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label>Date</Label>
          <Input type="date" value={form.intervention_date} onChange={(e) => set("intervention_date", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Purpose *</Label>
        <Textarea rows={2} value={form.purpose} onChange={(e) => set("purpose", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Outcome</Label>
        <Textarea rows={2} value={form.outcome} onChange={(e) => set("outcome", e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : intervention?.id ? "Save changes" : "Record intervention"}</Button>
      </div>
    </form>
  );
}