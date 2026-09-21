import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import EnterpriseForm from "@/components/enterprises/EnterpriseForm";
import HealthGauge from "@/components/dashboard/HealthGauge";
import { latestScore } from "@/lib/useEnterpriseData";

export default function OverviewTab({ enterprise, diagnostics, canManage, onSaved }) {
  const [editing, setEditing] = useState(false);
  const score = latestScore(diagnostics);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Enterprise profile</CardTitle>
          {canManage && !editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="w-4 h-4 mr-1.5" /> Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <EnterpriseForm enterprise={enterprise} onSaved={() => { setEditing(false); onSaved?.(); }} onCancel={() => setEditing(false)} />
          ) : (
            <ProfileGrid enterprise={enterprise} />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Health</CardTitle></CardHeader>
        <CardContent className="flex justify-center py-6">
          <HealthGauge score={score} />
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileGrid({ enterprise }) {
  const rows = [
    ["Trading name", enterprise?.trading_name],
    ["Founder", enterprise?.founder_name],
    ["Founder email", enterprise?.founder_email],
    ["Founder phone", enterprise?.founder_phone],
    ["Sector", enterprise?.sector],
    ["Stage", enterprise?.stage],
    ["Employees", enterprise?.employee_count],
    ["Revenue band", enterprise?.revenue_band],
    ["Registration no.", enterprise?.registration_number],
    ["Registration status", enterprise?.registration_status],
    ["Compliance status", enterprise?.compliance_status],
    ["Province", enterprise?.province],
    ["Contact email", enterprise?.contact_email],
    ["Contact phone", enterprise?.contact_phone],
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
      {rows.map(([k, v]) => (
        <div key={k}>
          <p className="text-xs text-muted-foreground">{k}</p>
          <p className="text-sm font-medium">{v || "—"}</p>
        </div>
      ))}
      <div className="col-span-2 sm:col-span-3">
        <p className="text-xs text-muted-foreground">Market information</p>
        <p className="text-sm font-medium">{enterprise?.market_information || "—"}</p>
      </div>
    </div>
  );
}