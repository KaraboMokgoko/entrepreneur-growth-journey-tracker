import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Handshake, Pencil, Trash2 } from "lucide-react";
import InterventionForm from "@/components/interventions/InterventionForm";
import EmptyState from "@/components/shared/EmptyState";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

const TYPE_COLORS = {
  Training: "bg-teal-100 text-teal-700",
  Mentorship: "bg-blue-100 text-blue-700",
  Funding: "bg-emerald-100 text-emerald-700",
  Compliance: "bg-amber-100 text-amber-700",
  "Market access": "bg-violet-100 text-violet-700",
  Other: "bg-slate-100 text-slate-600",
};

export default function InterventionsTab({ enterprise, interventions, canManage, onChanged }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const sorted = [...interventions].sort((a, b) => (b.intervention_date || "").localeCompare(a.intervention_date || ""));
  const grouped = {};
  sorted.forEach((i) => {
    const m = i.intervention_date ? format(parseISO(i.intervention_date), "MMM yyyy") : "Undated";
    (grouped[m] = grouped[m] || []).push(i);
  });

  const remove = async (i) => {
    if (!confirm("Delete this intervention?")) return;
    try { await base44.entities.Intervention.delete(i.id); toast.success("Deleted"); onChanged?.(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canManage && <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="w-4 h-4 mr-1.5" /> Record intervention</Button>}
      </div>
      {sorted.length === 0 ? (
        <EmptyState icon={Handshake} title="No interventions recorded" description="Track training, funding, mentorship and market access support." />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">{month}</h4>
              <div className="space-y-3">
                {items.map((i) => (
                  <Card key={i.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={TYPE_COLORS[i.intervention_type] || "bg-slate-100"}>{i.intervention_type}</Badge>
                            <span className="text-sm font-medium">{i.provider}</span>
                            <span className="text-xs text-muted-foreground">{i.intervention_date ? format(parseISO(i.intervention_date), "d MMM") : ""}</span>
                          </div>
                          <p className="text-sm mt-2"><span className="text-muted-foreground">Purpose: </span>{i.purpose}</p>
                          {i.outcome && <p className="text-sm mt-1"><span className="text-muted-foreground">Outcome: </span>{i.outcome}</p>}
                        </div>
                        {canManage && (
                          <div className="flex gap-1 shrink-0">
                            <Button variant="ghost" size="icon" onClick={() => { setEditing(i); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => remove(i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit intervention" : "Record intervention"}</DialogTitle></DialogHeader>
          <InterventionForm intervention={editing} enterpriseId={enterprise.id} onSaved={() => { setOpen(false); onChanged?.(); }} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}