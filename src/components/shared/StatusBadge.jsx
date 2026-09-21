import { Badge } from "@/components/ui/badge";

const MAP = {
  // generic
  Completed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Valid: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  "In progress": "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Overdue: "bg-red-100 text-red-700 hover:bg-red-100",
  Expired: "bg-red-100 text-red-700 hover:bg-red-100",
  Blocked: "bg-red-100 text-red-700 hover:bg-red-100",
  "Not started": "bg-slate-100 text-slate-600 hover:bg-slate-100",
  "Non-compliant": "bg-red-100 text-red-700 hover:bg-red-100",
  "Partially compliant": "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Compliant: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  Registered: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  High: "bg-red-100 text-red-700 hover:bg-red-100",
  Medium: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Low: "bg-slate-100 text-slate-600 hover:bg-slate-100",
};

export default function StatusBadge({ status }) {
  const cls = MAP[status] || "bg-slate-100 text-slate-600 hover:bg-slate-100";
  return <Badge className={cls}>{status || "—"}</Badge>;
}