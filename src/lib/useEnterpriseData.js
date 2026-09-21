import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Fetches all linked records for one enterprise and exposes a reload().
export function useEnterpriseData(enterpriseId) {
  const [data, setData] = useState({
    diagnostics: [], actions: [], interventions: [], milestones: [],
    sessions: [], compliance: [], funding: [], procurement: [], reassessments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!enterpriseId) return;
    setLoading(true);
    setError(null);
    try {
      const [diagnostics, actions, interventions, milestones, sessions, compliance, funding, procurement, reassessments] =
        await Promise.all([
          base44.entities.Diagnostic.filter({ enterprise_id: enterpriseId }, "-assessment_date", 100),
          base44.entities.DevelopmentAction.filter({ enterprise_id: enterpriseId }, "-created_date", 200),
          base44.entities.Intervention.filter({ enterprise_id: enterpriseId }, "-intervention_date", 200),
          base44.entities.Milestone.filter({ enterprise_id: enterpriseId }, "-target_date", 200),
          base44.entities.MentorshipSession.filter({ enterprise_id: enterpriseId }, "-session_date", 200),
          base44.entities.ComplianceRecord.filter({ enterprise_id: enterpriseId }, "-created_date", 100),
          base44.entities.FundingReadiness.filter({ enterprise_id: enterpriseId }, "-assessment_date", 10),
          base44.entities.ProcurementReadiness.filter({ enterprise_id: enterpriseId }, "-assessment_date", 10),
          base44.entities.Reassessment.filter({ enterprise_id: enterpriseId }, "-reassessment_date", 20),
        ]);
      setData({ diagnostics, actions, interventions, milestones, sessions, compliance, funding, procurement, reassessments });
    } catch (err) {
      setError(err.message || "Failed to load enterprise data");
    } finally {
      setLoading(false);
    }
  }, [enterpriseId]);

  useEffect(() => { load(); }, [load]);

  return { ...data, loading, error, reload: load };
}

export function latestDiagnostic(diagnostics, type) {
  return (diagnostics || []).find((d) => d.assessment_type === type);
}

export function latestScore(diagnostics) {
  const all = [...(diagnostics || [])].sort((a, b) => (b.assessment_date || "").localeCompare(a.assessment_date || ""));
  return all[0]?.overall_score || 0;
}