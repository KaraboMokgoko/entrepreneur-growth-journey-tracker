import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { readinessScore, readinessExplanation, healthColor } from "@/lib/scoring";

// entityName: "FundingReadiness" | "ProcurementReadiness"
export default function ReadinessChecklist({ entityName, items, record, enterpriseId, onChanged }) {
  const [checklist, setChecklist] = useState({});
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setChecklist(record.checklist || {});
      setNotes(record.notes || "");
      setDate(record.assessment_date || new Date().toISOString().slice(0, 10));
    }
  }, [record]);

  const score = readinessScore(checklist, items);
  const toggle = (key, val) => setChecklist((c) => ({ ...c, [key]: val }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        enterprise_id: enterpriseId,
        assessment_date: date,
        checklist,
        score,
        notes,
      };
      if (record?.id) {
        await base44.entities[entityName].update(record.id, payload);
        toast.success("Readiness updated");
      } else {
        await base44.entities[entityName].create(payload);
        toast.success("Readiness assessment saved");
      }
      onChanged?.();
    } catch (err) {
      toast.error(err.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base font-semibold">Score</Label>
          <span className="text-2xl font-bold" style={{ color: healthColor(score) }}>{score}%</span>
        </div>
        <Progress value={score} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">{readinessExplanation(score, checklist, items)}</p>
      </div>
      <div className="space-y-3">
        {items.map((it) => (
          <label key={it.key} className="flex items-center gap-3 cursor-pointer">
            <Checkbox checked={!!checklist[it.key]} onCheckedChange={(v) => toggle(it.key, v)} />
            <span className="text-sm">{it.label}</span>
          </label>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button onClick={save} disabled={saving}>{saving ? "Saving..." : record?.id ? "Update assessment" : "Save assessment"}</Button>
    </div>
  );
}