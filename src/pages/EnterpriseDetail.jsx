import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useEnterpriseData, latestScore } from "@/lib/useEnterpriseData";
import { canManageEnterprise, canAssess, canRecordIntervention, canRecordMentorship } from "@/lib/roles";
import { healthColor } from "@/lib/scoring";
import { LoadingSkeleton, ErrorState } from "@/components/shared/PageState";
import OverviewTab from "@/components/enterprises/OverviewTab";
import DiagnosticsTab from "@/components/enterprises/DiagnosticsTab";
import DevelopmentPlanTab from "@/components/enterprises/DevelopmentPlanTab";
import InterventionsTab from "@/components/enterprises/InterventionsTab";
import MilestonesTab from "@/components/enterprises/MilestonesTab";
import MentorshipTab from "@/components/enterprises/MentorshipTab";
import ReadinessTab from "@/components/enterprises/ReadinessTab";
import GrowthTab from "@/components/enterprises/GrowthTab";

export default function EnterpriseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const role = user?.role || "user";
  const [enterprise, setEnterprise] = useState(null);
  const [enterprises, setEnterprises] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loadingEnt, setLoadingEnt] = useState(true);
  const [entError, setEntError] = useState(null);

  const linked = useEnterpriseData(id);

  useEffect(() => {
    let active = true;
    setLoadingEnt(true);
    base44.entities.Enterprise.get(id)
      .then((e) => active && setEnterprise(e))
      .catch((e) => active && setEntError(e.message || "Enterprise not found"))
      .finally(() => active && setLoadingEnt(false));
    base44.entities.Enterprise.list().then(setEnterprises).catch(() => {});
    return () => { active = false; };
  }, [id]);

  const reloadEnterprise = async () => {
    try { const e = await base44.entities.Enterprise.get(id); setEnterprise(e); } catch {}
    linked.reload();
  };

  if (loadingEnt) return <div className="p-6"><LoadingSkeleton rows={4} /></div>;
  if (entError) return <div className="p-6"><ErrorState message={entError} onRetry={() => window.location.reload()} /></div>;
  if (!enterprise) return <div className="p-6"><ErrorState message="Enterprise not found" /></div>;

  const score = latestScore(linked.diagnostics);
  const canManage = canManageEnterprise(role);
  const assess = canAssess(role);
  const canRecInt = canRecordIntervention(role);
  const canRecMentor = canRecordMentorship(role);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/enterprises"><ArrowLeft className="w-4 h-4 mr-1" /> Enterprises</Link>
        </Button>
      </div>
      <Card className="mb-6">
        <CardContent className="p-5 flex flex-wrap items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-teal-700 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{enterprise.name}</h1>
            <p className="text-sm text-muted-foreground">{enterprise.sector} · {enterprise.stage} · {enterprise.province}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-3xl font-bold" style={{ color: healthColor(score) }}>{Math.round(score)}%</p>
            <p className="text-xs text-muted-foreground">health score</p>
          </div>
        </CardContent>
      </Card>

      {linked.error ? (
        <ErrorState message={linked.error} onRetry={linked.reload} />
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <div className="overflow-x-auto">
            <TabsList className="mb-4 flex w-max">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
              <TabsTrigger value="plan">Development Plan</TabsTrigger>
              <TabsTrigger value="interventions">Interventions</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
              <TabsTrigger value="readiness">Readiness</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview"><OverviewTab enterprise={enterprise} diagnostics={linked.diagnostics} canManage={canManage} onSaved={reloadEnterprise} /></TabsContent>
          <TabsContent value="diagnostics"><DiagnosticsTab enterprise={enterprise} enterprises={enterprises} diagnostics={linked.diagnostics} canAssess={assess} onChanged={linked.reload} /></TabsContent>
          <TabsContent value="plan"><DevelopmentPlanTab enterprise={enterprise} diagnostics={linked.diagnostics} actions={linked.actions} canManage={canManage} onChanged={linked.reload} /></TabsContent>
          <TabsContent value="interventions"><InterventionsTab enterprise={enterprise} interventions={linked.interventions} canManage={canRecInt} onChanged={linked.reload} /></TabsContent>
          <TabsContent value="milestones"><MilestoneTabWrapper linked={linked} enterprise={enterprise} canManage={canManage} /></TabsContent>
          <TabsContent value="mentorship"><MentorshipTab enterprise={enterprise} sessions={linked.sessions} canRecord={canRecMentor} onChanged={linked.reload} /></TabsContent>
          <TabsContent value="readiness"><ReadinessTab enterprise={enterprise} compliance={linked.compliance} funding={linked.funding} procurement={linked.procurement} canManage={canManage} onChanged={linked.reload} /></TabsContent>
          <TabsContent value="growth"><GrowthTab enterprise={enterprise} diagnostics={linked.diagnostics} reassessments={linked.reassessments} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function MilestoneTabWrapper({ linked, enterprise, canManage }) {
  if (linked.loading) return <LoadingSkeleton />;
  return <MilestonesTab enterprise={enterprise} milestones={linked.milestones} canManage={canManage} onChanged={linked.reload} />;
}