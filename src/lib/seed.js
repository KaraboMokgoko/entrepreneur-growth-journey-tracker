// Demo data seeder for the Entrepreneur Growth Journey Tracker.
// Creates a cohort of enterprises with diagnostics, actions, milestones,
// interventions, mentorship sessions and readiness assessments using
// relative dates so charts look populated regardless of today's date.
import { base44 } from "@/api/base44Client";
import {
  CATEGORIES, computeOverall, getStrengths, getGaps, generateRecommendedActions,
  FUNDING_ITEMS, PROCUREMENT_ITEMS, readinessScore,
} from "@/lib/scoring";

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
const daysAhead = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

const ENTERPRISES = [
  { name: "Limpopo Harvest Co-op", sector: "Agriculture", stage: "Growth", employee_count: 12, revenue_band: "R100k-R500k", province: "Limpopo", founder_name: "Thabo Molepo", founder_email: "thabo@limpopoharvest.co.za", founder_phone: "071 234 5678", registration_status: "Registered", compliance_status: "Partially compliant", market_information: "Supplies fresh produce to local supermarkets and restaurants.", contact_email: "info@limpopoharvest.co.za", contact_phone: "071 234 5678" },
  { name: "Cape Floral Skincare", sector: "Agriculture", stage: "Startup", employee_count: 3, revenue_band: "R0-R100k", province: "Western Cape", founder_name: "Aisha Patel", founder_email: "aisha@capefloral.co.za", founder_phone: "082 345 6789", registration_status: "Pending", compliance_status: "Non-compliant", market_information: "Handmade botanical skincare selling online and at markets.", contact_email: "hello@capefloral.co.za", contact_phone: "082 345 6789" },
  { name: "KZN Spice Traders", sector: "Retail", stage: "Established", employee_count: 24, revenue_band: "R1M-R5M", province: "KwaZulu-Natal", founder_name: "Sipho Dlamini", founder_email: "sipho@kznspice.co.za", founder_phone: "083 456 7890", registration_status: "Registered", compliance_status: "Compliant", market_information: "Wholesale spice distribution to hospitality and retail.", contact_email: "sales@kznspice.co.za", contact_phone: "083 456 7890" },
  { name: "Gauteng Grocers", sector: "Retail", stage: "Growth", employee_count: 18, revenue_band: "R500k-R1M", province: "Gauteng", founder_name: "Naledi Khumalo", founder_email: "naledi@gautenggrocers.co.za", founder_phone: "084 567 8901", registration_status: "Registered", compliance_status: "Partially compliant", market_information: "Neighbourhood grocery with delivery service.", contact_email: "info@gautenggrocers.co.za", contact_phone: "084 567 8901" },
  { name: "Mzansi App Studio", sector: "Technology", stage: "Startup", employee_count: 5, revenue_band: "R0-R100k", province: "Gauteng", founder_name: "Kwanele Nkosi", founder_email: "kwanele@mzansiapp.co.za", founder_phone: "085 678 9012", registration_status: "Registered", compliance_status: "Non-compliant", market_information: "Custom mobile app development for SMEs.", contact_email: "hello@mzansiapp.co.za", contact_phone: "085 678 9012" },
  { name: "Eastern Cloud Services", sector: "Technology", stage: "Growth", employee_count: 9, revenue_band: "R100k-R500k", province: "Eastern Cape", founder_name: "Zintle Mthembu", founder_email: "zintle@easterncloud.co.za", founder_phone: "086 789 0123", registration_status: "Registered", compliance_status: "Partially compliant", market_information: "Cloud migration and IT support for small businesses.", contact_email: "support@easterncloud.co.za", contact_phone: "086 789 0123" },
];

// Score profiles per enterprise: [baseline, reassessment?]
const SCORE_PROFILES = [
  { baseline: { strategy_business_model: 3, finance: 2, operations: 3, compliance: 2, sales_marketing: 3, people: 2, digital_readiness: 2, procurement_readiness: 1, funding_readiness: 2, market_access: 3 }, reassessment: { strategy_business_model: 4, finance: 4, operations: 4, compliance: 3, sales_marketing: 4, people: 3, digital_readiness: 3, procurement_readiness: 3, funding_readiness: 3, market_access: 4 } },
  { baseline: { strategy_business_model: 3, finance: 2, operations: 3, compliance: 1, sales_marketing: 4, people: 2, digital_readiness: 2, procurement_readiness: 1, funding_readiness: 1, market_access: 3 } },
  { baseline: { strategy_business_model: 4, finance: 4, operations: 4, compliance: 4, sales_marketing: 3, people: 4, digital_readiness: 3, procurement_readiness: 4, funding_readiness: 4, market_access: 3 } },
  { baseline: { strategy_business_model: 4, finance: 3, operations: 3, compliance: 3, sales_marketing: 4, people: 3, digital_readiness: 3, procurement_readiness: 2, funding_readiness: 3, market_access: 4 } },
  { baseline: { strategy_business_model: 4, finance: 2, operations: 3, compliance: 2, sales_marketing: 3, people: 3, digital_readiness: 4, procurement_readiness: 1, funding_readiness: 2, market_access: 3 } },
  { baseline: { strategy_business_model: 3, finance: 3, operations: 4, compliance: 3, sales_marketing: 3, people: 3, digital_readiness: 4, procurement_readiness: 2, funding_readiness: 3, market_access: 3 } },
];

const INTERVENTIONS = [
  { provider: "SCA", type: "Training", purpose: "Financial literacy workshop", outcome: "Owner now keeps monthly accounts" },
  { provider: "SEDA", type: "Mentorship", purpose: "Business model refinement", outcome: "Clearer value proposition documented" },
  { provider: "NYDA", type: "Funding", purpose: "Seed funding grant", outcome: "R50 000 grant secured" },
  { provider: "Absa", type: "Funding", purpose: "Business loan application support", outcome: "Loan approved" },
  { provider: "Department of Trade", type: "Market access", purpose: "Trade expo participation", outcome: "3 new retail buyers signed" },
  { provider: "SCA", type: "Compliance", purpose: "CIPC annual return filing", outcome: "Annual return filed" },
];

const MILESTONES = [
  { title: "Register with CIPC", status: "Completed", target: -120, category: "compliance" },
  { title: "Open business bank account", status: "Completed", target: -90, category: "finance" },
  { title: "Complete tax clearance", status: "Completed", target: -60, category: "compliance" },
  { title: "Launch e-commerce store", status: "In progress", target: 14, category: "digital_readiness" },
  { title: "Hire first employee", status: "Completed", target: -45, category: "people" },
  { title: "Secure first corporate contract", status: "Pending", target: 30, category: "market_access" },
  { title: "Obtain B-BBEE certificate", status: "Pending", target: 21, category: "compliance" },
  { title: "Submit annual financials", status: "Overdue", target: -10, category: "finance" },
];

const SESSIONS = [
  { topic: "Pricing strategy", challenge: "Margins too thin", guidance: "Cost-plus with competitor benchmark", actions: "Revise price list", follow_up: "Review new pricing", follow_up_days: 14 },
  { topic: "Cash flow management", challenge: "Seasonal dips", guidance: "Build 3-month reserve", actions: "Open reserve account", follow_up: "Check reserve progress", follow_up_days: 30 },
  { topic: "Export readiness", challenge: "No export docs", guidance: "Start with SADC neighbours", actions: "Register with Export Council", follow_up: "Docs review", follow_up_days: 21 },
];

const COMPLIANCE = [
  { item: "CIPC Annual Return", status: "Valid", expiry: 180 },
  { item: "Tax Clearance Certificate", status: "Valid", expiry: 90 },
  { item: "B-BBEE Certificate", status: "Pending", expiry: null },
  { item: "UIF Registration", status: "Valid", expiry: 300 },
  { item: "COIDA Letter of Good Standing", status: "Expired", expiry: -20 },
];

function buildFunding(done) {
  const c = {};
  FUNDING_ITEMS.forEach((it, i) => { c[it.key] = i < done; });
  return c;
}
function buildProcurement(done) {
  const c = {};
  PROCUREMENT_ITEMS.forEach((it, i) => { c[it.key] = i < done; });
  return c;
}

export async function seedCohort() {
  const created = [];
  for (let i = 0; i < ENTERPRISES.length; i++) {
    const spec = ENTERPRISES[i];
    const ent = await base44.entities.Enterprise.create({ ...spec, trading_name: spec.name });
    created.push(ent);
    const profile = SCORE_PROFILES[i];
    const baselineScores = profile.baseline;
    const baseline = await base44.entities.Diagnostic.create({
      enterprise_id: ent.id, assessment_type: "baseline", assessment_date: daysAgo(180),
      scores: baselineScores, overall_score: computeOverall(baselineScores),
      strengths: getStrengths(baselineScores), priority_gaps: getGaps(baselineScores),
      recommended_actions: generateRecommendedActions(baselineScores),
      notes: "Baseline assessment",
    });
    if (profile.reassessment) {
      const reScores = profile.reassessment;
      const reassessment = await base44.entities.Diagnostic.create({
        enterprise_id: ent.id, assessment_type: "reassessment", assessment_date: daysAgo(20),
        scores: reScores, overall_score: computeOverall(reScores),
        strengths: getStrengths(reScores), priority_gaps: getGaps(reScores),
        recommended_actions: generateRecommendedActions(reScores),
        notes: "Reassessment after interventions",
      });
      await base44.entities.Reassessment.create({
        enterprise_id: ent.id, baseline_diagnostic_id: baseline.id, reassessment_diagnostic_id: reassessment.id,
        reassessment_date: daysAgo(20), revenue_band_before: "R0-R100k", revenue_band_after: spec.revenue_band,
        employees_before: Math.max(1, spec.employee_count - 2), employees_after: spec.employee_count,
        overall_score_before: computeOverall(baselineScores), overall_score_after: computeOverall(reScores),
        notes: "Growth recorded",
      });
    }
    // actions
    const recs = generateRecommendedActions(baselineScores).slice(0, 4);
    await base44.entities.DevelopmentAction.bulkCreate(
      recs.map((r, idx) => ({
        enterprise_id: ent.id, diagnostic_id: baseline.id, description: r,
        category: CATEGORIES[idx % CATEGORIES.length].key, owner: spec.founder_name,
        target_date: idx < 2 ? daysAhead(idx * 10) : daysAgo(idx * 5),
        status: idx === 0 ? "Completed" : idx === 1 ? "In progress" : "Not started",
        priority: idx === 0 ? "High" : "Medium",
      }))
    );
    // milestones
    await base44.entities.Milestone.bulkCreate(
      MILESTONES.map((m) => ({
        enterprise_id: ent.id, title: m.title, status: m.status,
        target_date: m.target >= 0 ? daysAhead(m.target) : daysAgo(-m.target),
        completed_date: m.status === "Completed" ? daysAgo(-m.target - 5) : null,
        category: m.category, description: "",
      }))
    );
    // interventions
    await base44.entities.Intervention.bulkCreate(
      INTERVENTIONS.map((it, idx) => ({
        enterprise_id: ent.id, provider: it.provider, intervention_type: it.type,
        intervention_date: daysAgo(150 - idx * 20), purpose: it.purpose, outcome: it.outcome,
      }))
    );
    // mentorship (first 3 enterprises)
    if (i < 3) {
      await base44.entities.MentorshipSession.bulkCreate(
        SESSIONS.map((s, idx) => ({
          enterprise_id: ent.id, session_date: daysAgo(120 - idx * 30), topic: s.topic,
          challenge: s.challenge, guidance: s.guidance, actions: s.actions,
          follow_up: s.follow_up, follow_up_date: daysAhead(s.follow_up_days),
        }))
      );
    }
    // compliance + readiness
    await base44.entities.ComplianceRecord.bulkCreate(
      COMPLIANCE.map((c) => ({
        enterprise_id: ent.id, item: c.item, status: c.status,
        expiry_date: c.expiry == null ? null : (c.expiry >= 0 ? daysAhead(c.expiry) : daysAgo(-c.expiry)),
        evidence: "", notes: "",
      }))
    );
    const fundingChecklist = buildFunding(i === 0 ? 6 : 4);
    await base44.entities.FundingReadiness.create({
      enterprise_id: ent.id, assessment_date: daysAgo(30), checklist: fundingChecklist,
      score: readinessScore(fundingChecklist, FUNDING_ITEMS), notes: "",
    });
    const procChecklist = buildProcurement(i === 0 ? 5 : 3);
    await base44.entities.ProcurementReadiness.create({
      enterprise_id: ent.id, assessment_date: daysAgo(30), checklist: procChecklist,
      score: readinessScore(procChecklist, PROCUREMENT_ITEMS), notes: "",
    });
  }
  return { enterprises: created.length };
}