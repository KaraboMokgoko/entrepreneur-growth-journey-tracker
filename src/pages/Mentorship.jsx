import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LoadingSkeleton, ErrorState } from "@/components/shared/PageState";
import EmptyState from "@/components/shared/EmptyState";
import { format, parseISO } from "date-fns";

export default function Mentorship() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [enterprises, setEnterprises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [ss, ents] = await Promise.all([
        base44.entities.MentorshipSession.list("-session_date", 500),
        base44.entities.Enterprise.list("-created_date", 300),
      ]);
      setEnterprises(Object.fromEntries(ents.map((e) => [e.id, e])));
      setSessions(ss);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const sorted = [...sessions].sort((a, b) => (b.session_date || "").localeCompare(a.session_date || ""));

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-5"><h1 className="text-2xl font-bold">Mentorship</h1><p className="text-sm text-muted-foreground">{sessions.length} sessions across the cohort</p></div>
      {loading ? <LoadingSkeleton /> :
       error ? <ErrorState message={error} onRetry={load} /> :
       sorted.length === 0 ? <EmptyState icon={Users} title="No sessions" description="Record sessions from an enterprise's detail page." /> :
       <div className="space-y-3">
         {sorted.map((s) => (
           <Card key={s.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/enterprises/${s.enterprise_id}`)}>
             <CardContent className="p-4">
               <div className="flex items-center gap-2 flex-wrap">
                 <p className="text-sm font-semibold">{s.topic}</p>
                 <Badge variant="outline">{s.session_date ? format(parseISO(s.session_date), "d MMM yyyy") : "—"}</Badge>
                 <span className="text-xs text-muted-foreground">{enterprises[s.enterprise_id]?.name}</span>
               </div>
               {s.guidance && <p className="text-sm mt-2"><span className="text-muted-foreground">Guidance: </span>{s.guidance}</p>}
             </CardContent>
           </Card>
         ))}
       </div>}
    </div>
  );
}