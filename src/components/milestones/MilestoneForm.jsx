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
import { CATEGORY_LABELS } from "@/lib/scoring";

const STATUSES = ["Pending", "In progress", "Completed", "Overdue"];

export default function MilestoneForm({ milestone, enterpriseId, onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: "", description: "", target_date: "", completed_date: "",
    status: "Pending", evidence: "", category: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (milestone) setForm((f) => ({ ...f, ...milestone }));
  }, [milestone]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, enterprise_id: enterpriseId };
      if (form.status === "Completed" && !form.completed_date) {
        payload.completed_date = new Date().toISOString().slice(0, 10);
      }
      if (milestone?.id) {
        await base44.entities.Milestone.update(milestone.id, payload);
        toast.success("Milestone updated");
      } else {
        await base44.entities.Milestone.create(payload);
        toast.success("Milestone added");
      }
      onSaved?.();
    } catch (err) {
      toast.error(err.message || "Could not save milestone");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Title *</Label>
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Target date</Label>
          <Input type="date" value={form.target_date} onChange={(e) => set("target_date", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Completed date</Label>
          <Input type="date" value={form.completed_date} onChange={(e) => set("completed_date", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Evidence</Label>
        <Textarea rows={2} value={form.evidence} onChange={(e) => set("evidence", e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : milestone?.id ? "Save changes" : "Add milestone"}</Button>
      </div>
    </form>
  );
}