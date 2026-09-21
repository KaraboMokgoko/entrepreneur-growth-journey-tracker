import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Users, Pencil, Trash2 } from "lucide-react";
import SessionForm from "@/components/mentorship/SessionForm";
import EmptyState from "@/components/shared/EmptyState";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

export default function MentorshipTab({ enterprise, sessions, canRecord, onChanged }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const sorted = [...sessions].sort((a, b) => (b.session_date || "").localeCompare(a.session_date || ""));

  const remove = async (s) => {
    if (!confirm("Delete this session?")) return;
    try { await base44.entities.MentorshipSession.delete(s.id); toast.success("Deleted"); onChanged?.(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canRecord && <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="w-4 h-4 mr-1.5" /> Record session</Button>}
      </div>
      {sorted.length === 0 ? (
        <EmptyState icon={Users} title="No mentorship sessions" description="Record mentoring sessions to track guidance and follow-ups." />
      ) : (
        <div className="space-y-3">
          {sorted.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{s.topic}</p>
                      <Badge variant="outline">{s.session_date ? format(parseISO(s.session_date), "d MMM yyyy") : "—"}</Badge>
                    </div>
                    {s.challenge && <p className="text-sm mt-2"><span className="text-muted-foreground">Challenge: </span>{s.challenge}</p>}
                    {s.guidance && <p className="text-sm mt-1"><span className="text-muted-foreground">Guidance: </span>{s.guidance}</p>}
                    {s.actions && <p className="text-sm mt-1"><span className="text-muted-foreground">Actions: </span>{s.actions}</p>}
                    {s.follow_up && <p className="text-xs text-muted-foreground mt-2">Follow-up: {s.follow_up}{s.follow_up_date ? ` · ${format(parseISO(s.follow_up_date), "d MMM yyyy")}` : ""}</p>}
                  </div>
                  {canRecord && (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(s)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit session" : "Record session"}</DialogTitle></DialogHeader>
          <SessionForm session={editing} enterpriseId={enterprise.id} mentorId={user?.id} onSaved={() => { setOpen(false); onChanged?.(); }} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}