import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  CATEGORIES, emptyScores, computeOverall, getStrengths, getGaps,
  generateRecommendedActions, healthColor,
} from "@/lib/scoring";

export default function DiagnosticForm({ diagnostic, enterprises, defaultEnterpriseId, onSaved, onCancel }) {
  const [enterpriseId, setEnterpriseId] = useState(defaultEnterpriseId || "");
  const [type, setType] = useState("baseline");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [scores, setScores] = useState(emptyScores());
  const [strengths, setStrengths] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [actions, setActions] = useState([]);
  const [notes, setNotes] = useState("");
  const [autoStrengths, setAutoStrengths] = useState(true);
  const [autoGaps, setAutoGaps] = useState(true);
  const [autoActions, setAutoActions] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (diagnostic) {
      setEnterpriseId(diagnostic.enterprise_id || "");
      setType(diagnostic.assessment_type || "baseline");
      setDate(diagnostic.assessment_date || new Date().toISOString().slice(0, 10));
      setScores({ ...emptyScores(), ...(diagnostic.scores || {}) });
      setStrengths(diagnostic.strengths || []);
      setGaps(diagnostic.priority_gaps || []);
      setActions(diagnostic.recommended_actions || []);
      setNotes(diagnostic.notes || "");
      setAutoStrengths(!(diagnostic.strengths?.length));
      setAutoGaps(!(diagnostic.priority_gaps?.length));
      setAutoActions(!(diagnostic.recommended_actions?.length));
    }
  }, [diagnostic]);

  const overall = useMemo(() => computeOverall(scores), [scores]);
  const derivedStrengths = useMemo(() => getStrengths(scores), [scores]);
  const derivedGaps = useMemo(() => getGaps(scores), [scores]);
  const derivedActions = useMemo(() => generateRecommendedActions(scores), [scores]);

  const setScore = (key, val) => setScores((s) => ({ ...s, [key]: val[0] }));

  const submit = async (e) => {
    e.preventDefault();
    if (!enterpriseId) { toast.error("Select an enterprise"); return; }
    setSaving(true);
    try {
      const payload = {
        enterprise_id: enterpriseId,
        assessment_type: type,
        assessment_date: date,
        scores,
        overall_score: overall,
        strengths: autoStrengths ? derivedStrengths : strengths,
        priority_gaps: autoGaps ? derivedGaps : gaps,
        recommended_actions: autoActions ? derivedActions : actions,
        notes,
      };
      let saved;
      if (diagnostic?.id) {
        saved = await base44.entities.Diagnostic.update(diagnostic.id, payload);
        toast.success("Diagnostic updated");
      } else {
        saved = await base44.entities.Diagnostic.create(payload);
        toast.success(type === "reassessment" ? "Reassessment saved" : "Baseline diagnostic saved");
      }
      // If reassessment, create the reassessment record with before/after
      if (type === "reassessment" && !diagnostic?.id) {
        try {
          const ent = enterprises?.find((x) => x.id === enterpriseId) || await base44.entities.Enterprise.get(enterpriseId);
          const baselines = await base44.entities.Diagnostic.filter({ enterprise_id: enterpriseId, assessment_type: "baseline" }, "-assessment_date", 5);
          const baseline = baselines[0];
          if (baseline) {
            await base44.entities.Reassessment.create({
              enterprise_id: enterpriseId,
              baseline_diagnostic_id: baseline.id,
              reassessment_diagnostic_id: saved.id,
              reassessment_date: date,
              revenue_band_before: baseline ? "" : "",
              revenue_band_after: ent?.revenue_band || "",
              employees_before: 0,
              employees_after: ent?.employee_count || 0,
              overall_score_before: baseline.overall_score || 0,
              overall_score_after: overall,
              notes: notes || "",
            });
          }
        } catch (reErr) {
          console.error("reassessment link failed", reErr);
        }
      }
      onSaved?.(saved);
    } catch (err) {
      toast.error(err.message || "Could not save diagnostic");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5 sm:col-span-1">
          <Label>Enterprise *</Label>
          <Select value={enterpriseId} onValueChange={setEnterpriseId} disabled={!!defaultEnterpriseId}>
            <SelectTrigger><SelectValue placeholder="Select enterprise" /></SelectTrigger>
            <SelectContent>
              {(enterprises || []).map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="baseline">Baseline</SelectItem>
              <SelectItem value="reassessment">Reassessment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Scoring (1 = weak, 5 = strong)</h4>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Overall health</p>
              <p className="text-2xl font-bold" style={{ color: healthColor(overall) }}>{overall}%</p>
            </div>
          </div>
          <div className="space-y-4">
            {CATEGORIES.map((c) => (
              <div key={c.key}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-3 shrink-0">{scores[c.key]}/5</Badge>
                </div>
                <Slider
                  value={[scores[c.key]]}
                  onValueChange={(v) => setScore(c.key, v)}
                  min={1} max={5} step={1}
                  className="mt-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EditableList
          title="Strengths" auto={autoStrengths} setAuto={setAutoStrengths}
          derived={derivedStrengths} value={strengths} onChange={setStrengths}
        />
        <EditableList
          title="Priority gaps" auto={autoGaps} setAuto={setAutoGaps}
          derived={derivedGaps} value={gaps} onChange={setGaps}
        />
        <EditableList
          title="Recommended actions" auto={autoActions} setAuto={setAutoActions}
          derived={derivedActions} value={actions} onChange={setActions}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : diagnostic?.id ? "Save changes" : "Save diagnostic"}</Button>
      </div>
    </form>
  );
}

function EditableList({ title, auto, setAuto, derived, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">{title}</Label>
        <label className="text-xs flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
          Auto
        </label>
      </div>
      <Textarea
        rows={6}
        value={auto ? derived.join("\n") : value.join("\n")}
        onChange={(e) => { setAuto(false); onChange(e.target.value.split("\n").filter(Boolean)); }}
        className="text-xs"
      />
    </div>
  );
}