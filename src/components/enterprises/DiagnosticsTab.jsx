import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, ClipboardList } from "lucide-react";
import DiagnosticForm from "@/components/diagnostics/DiagnosticForm";
import EmptyState from "@/components/shared/EmptyState";
import { computeOverall } from "@/lib/scoring";
import { format } from "date-fns";

export default function DiagnosticsTab({ enterprise, enterprises, diagnostics, canAssess, onChanged }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const sorted = [...diagnostics].sort((a, b) => (b.assessment_date || "").localeCompare(a.assessment_date || ""));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canAssess && (
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-1.5" /> New diagnostic
          </Button>
        )}
      </div>
      {sorted.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No diagnostics yet" description="Run a baseline assessment to start the growth journey." actionLabel={canAssess ? "Run baseline" : undefined} onAction={canAssess ? () => { setEditing(null); setOpen(true); } : undefined} />
      ) : (
        <div className="space-y-3">
          {sorted.map((d) => (
            <Card key={d.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { if (canAssess) { setEditing(d); setOpen(true); } }}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={d.assessment_type === "baseline" ? "outline" : "secondary"}>{d.assessment_type}</Badge>
                    <span className="text-sm font-medium">{d.assessment_date ? format(new Date(d.assessment_date), "d MMM yyyy") : "—"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{d.priority_gaps?.length || 0} gaps · {d.recommended_actions?.length || 0} actions</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: d.overall_score >= 70 ? "#16a34a" : d.overall_score >= 40 ? "#f59e0b" : "#dc2626" }}>{Math.round(d.overall_score || computeOverall(d.scores))}%</p>
                  <p className="text-xs text-muted-foreground">overall</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit diagnostic" : "New diagnostic"}</DialogTitle></DialogHeader>
          <DiagnosticForm
            diagnostic={editing}
            enterprises={enterprises}
            defaultEnterpriseId={enterprise?.id}
            onSaved={() => { setOpen(false); onChanged?.(); }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}