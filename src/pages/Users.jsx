import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { UserCog, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { ROLES, ROLE_LABELS, ROLE_COLORS } from "@/lib/roles";
import { LoadingSkeleton, ErrorState } from "@/components/shared/PageState";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", role: "practitioner" });
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try { setUsers(await base44.entities.User.list("-created_date", 200)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const invite = async (e) => {
    e.preventDefault();
    if (!form.email?.trim()) { toast.error("Email is required"); return; }
    setInviting(true);
    try {
      await base44.users.inviteUser(form.email.trim(), form.role);
      // set display name if supported
      toast.success(`Invitation sent to ${form.email}`);
      setOpen(false); setForm({ email: "", full_name: "", role: "practitioner" });
      load();
    } catch (err) { toast.error(err.message || "Could not invite user"); }
    finally { setInviting(false); }
  };

  const changeRole = async (u, role) => {
    try { await base44.entities.User.update(u.id, { role }); toast.success("Role updated"); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="text-2xl font-bold">Users</h1><p className="text-sm text-muted-foreground">{users.length} users</p></div>
        <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Invite user</Button>
      </div>
      {loading ? <LoadingSkeleton /> :
       error ? <ErrorState message={error} onRetry={load} /> :
       users.length === 0 ? <EmptyState icon={UserCog} title="No users" /> :
       <Card><CardContent className="p-0">
         <div className="overflow-x-auto">
           <Table>
             <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Change role</TableHead></TableRow></TableHeader>
             <TableBody>
               {users.map((u) => (
                 <TableRow key={u.id}>
                   <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                   <TableCell className="text-xs">{u.email}</TableCell>
                   <TableCell><span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] || ""}`}>{ROLE_LABELS[u.role] || u.role}</span></TableCell>
                   <TableCell>
                     <Select value={u.role} onValueChange={(v) => changeRole(u, v)}>
                       <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                       <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
                     </Select>
                   </TableCell>
                </TableRow>
               ))}
             </TableBody>
           </Table>
         </div>
       </CardContent></Card>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Invite user</DialogTitle></DialogHeader>
          <form onSubmit={invite} className="space-y-4">
            <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent></Select>
            </div>
            <p className="text-xs text-muted-foreground">The invitee will receive an email to set their password and join the app.</p>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={inviting}>{inviting ? "Sending..." : "Send invite"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}