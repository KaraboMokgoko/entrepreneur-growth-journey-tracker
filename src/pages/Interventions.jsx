import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Handshake } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LoadingSkeleton, ErrorState } from "@/components/shared/PageState";
import EmptyState from "@/components/shared/EmptyState";
import { format, parseISO } from "date-fns";

const TYPE_COLORS = {
  Training: "bg-teal-100 text-teal-700", Mentorship: "bg-blue-100 text-blue-700",
  Funding: "bg-emerald-100 text-emerald-700", Compliance: "bg-amber-100 text-amber-700",
  "Market access": "bg-violet-100 text-violet-700", Other: "bg-slate-100 text-slate-600",
};

export default function Interventions() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [enterprises, setEnterprises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [ints, ents] = await Promise.all([
        base44.entities.Intervention.list("-intervention_date", 500),
        base44.entities.Enterprise.list("-created_date", 300),
      ]);
      setEnterprises(Object.fromEntries(ents.map((e) => [e.id, e])));
      setItems(ints);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const grouped = {};
  items.forEach((i) => {
    const m = i.intervention_date ? format(parseISO(i.intervention_date), "MMM yyyy") : "Undated";
    (grouped[m] = grouped[m] || []).push(i);
  });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-5"><h1 className="text-2xl font-bold">Interventions</h1><p className="text-sm text-muted-foreground">{items.length} recorded across the cohort</p></div>
      {loading ? <LoadingSkeleton /> :
       error ? <ErrorState message={error} onRetry={load} /> :
       items.length === 0 ? <EmptyState icon={Handshake} title="No interventions" description="Record interventions from an enterprise's detail page." /> :
       <div className="space-y-6">
         {Object.entries(grouped).map(([month, list]) => (
           <div key={month}>
             <h4 className="text-sm font-semibold text-muted-foreground mb-2">{month}</h4>
             <div className="space-y-2">
               {list.map((i) => (
                 <Card key={i.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/enterprises/${i.enterprise_id}`)}>
                   <CardContent className="p-4">
                     <div className="flex items-center gap-2 flex-wrap">
                       <Badge className={TYPE_COLORS[i.intervention_type] || "bg-slate-100"}>{i.intervention_type}</Badge>
                       <span className="text-sm font-medium">{i.provider}</span>
                       <span className="text-xs text-muted-foreground">{enterprises[i.enterprise_id]?.name}</span>
                     </div>
                     <p className="text-sm mt-1"><span className="text-muted-foreground">Purpose: </span>{i.purpose}</p>
                     {i.outcome && <p className="text-sm mt-1"><span className="text-muted-foreground">Outcome: </span>{i.outcome}</p>}
                   </CardContent>
                 </Card>
               ))}
             </div>
           </div>
         ))}
       </div>}
    </div>
  );
}