import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { seedCohort } from "@/lib/seed";

export default function Settings() {
  const { user, checkUserAuth } = useAuth();
  const [name, setName] = useState(user?.full_name || "");
  const [savingName, setSavingName] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const saveName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try { await base44.auth.updateMe({ full_name: name }); toast.success("Profile updated"); await checkUserAuth(); }
    catch (err) { toast.error(err.message); }
    finally { setSavingName(false); }
  };

  const resetDemo = async () => {
    setResetting(true);
    try { await seedCohort(); toast.success("Demo data reset"); setResetOpen(false); }
    catch (err) { toast.error(err.message || "Reset failed"); }
    finally { setResetting(false); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={saveName} className="space-y-4">
            <div className="space-y-1.5"><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input value={user?.email || ""} disabled /></div>
            <Button type="submit" disabled={savingName}>{savingName ? "Saving..." : "Save profile"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Password</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Use the forgot-password flow to change your password — a reset link will be emailed to you.</p>
          <Button variant="outline" asChild><a href="/forgot-password">Reset password</a></Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Demo data</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Re-seed the cohort with the standard set of demo enterprises, diagnostics and milestones. This adds fresh demo records alongside existing data.</p>
          <Button variant="outline" onClick={() => setResetOpen(true)}>Reset demo data</Button>
        </CardContent>
      </Card>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset demo data?</AlertDialogTitle>
            <AlertDialogDescription>This will create a fresh set of demo enterprises and linked records. Continue?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetDemo} disabled={resetting}>{resetting ? "Working..." : "Yes, reset"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}