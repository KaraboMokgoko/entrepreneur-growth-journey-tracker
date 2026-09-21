import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function SessionForm({ session, enterpriseId, mentorId, onSaved, onCancel }) {
  const [form, setForm] = useState({
    session_date: new Date().toISOString().slice(0, 10),
    topic: "", challenge: "", guidance: "", actions: "", follow_up: "", follow_up_date: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (session) setForm((f) => ({ ...f, ...session })); }, [session]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.topic?.trim()) { toast.error("Topic is required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, enterprise_id: enterpriseId, mentor_id: mentorId };
      if (session?.id) {
        await base44.entities.MentorshipSession.update(session.id, payload);
        toast.success("Session updated");
      } else {
        await base44.entities.MentorshipSession.create(payload);
        toast.success("Session recorded");
      }
      onSaved?.();
    } catch (err) {
      toast.error(err.message || "Could not save session");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Session date</Label>
          <Input type="date" value={form.session_date} onChange={(e) => set("session_date", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Follow-up date</Label>
          <Input type="date" value={form.follow_up_date} onChange={(e) => set("follow_up_date", e.target.value)} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Topic *</Label>
        <Input value={form.topic} onChange={(e) => set("topic", e.target.value)} placeholder="e.g. Pricing strategy" />
      </div>
      <div className="space-y-1.5">
        <Label>Challenge</Label>
        <Textarea rows={2} value={form.challenge} onChange={(e) => set("challenge", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Guidance</Label>
        <Textarea rows={2} value={form.guidance} onChange={(e) => set("guidance", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Actions</Label>
        <Textarea rows={2} value={form.actions} onChange={(e) => set("actions", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Follow-up notes</Label>
        <Textarea rows={2} value={form.follow_up} onChange={(e) => set("follow_up", e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : session?.id ? "Save changes" : "Record session"}</Button>
      </div>
    </form>
  );
}