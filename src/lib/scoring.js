// Diagnostic scoring + readiness calculations + canned actions for the
// Entrepreneur Growth Journey Tracker.

export const CATEGORIES = [
  { key: "strategy_business_model", label: "Strategy & Business Model", description: "Clarity of value proposition, model viability and competitive positioning." },
  { key: "finance", label: "Finance", description: "Record-keeping, cash flow management and financial controls." },
  { key: "operations", label: "Operations", description: "Production, supply chain, quality and day-to-day delivery." },
  { key: "compliance", label: "Compliance", description: "Statutory registrations, filings and regulatory standing." },
  { key: "sales_marketing", label: "Sales & Marketing", description: "Customer acquisition, channels, branding and pipeline." },
  { key: "people", label: "People", description: "Staffing, skills, HR practices and team capability." },
  { key: "digital_readiness", label: "Digital Readiness", description: "Use of digital tools, online presence and automation." },
  { key: "procurement_readiness", label: "Procurement Readiness", description: "Documents and certifications to supply buyers." },
  { key: "funding_readiness", label: "Funding Readiness", description: "Preparedness to raise finance or credit." },
  { key: "market_access", label: "Market Access", description: "Ability to reach and serve new markets and customers." },
];

export const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));

// Canned development actions per category — used to auto-generate a plan from gaps.
export const CANNED_ACTIONS = {
  strategy_business_model: ["Refine the business model canvas with a clear value proposition", "Document a 1-page strategy on a page", "Run a competitor pricing review"],
  finance: ["Prepare monthly management accounts", "Open a dedicated business bank account", "Create a 12-month cash flow forecast"],
  operations: ["Map the core operational process and identify bottlenecks", "Introduce a simple quality checklist", "Set weekly operational KPIs"],
  compliance: ["Confirm CIPC annual return is filed", "Obtain a Tax Clearance Certificate", "Register for UIF and COIDA"],
  sales_marketing: ["Build a simple sales pipeline tracker", "Define 2 primary marketing channels", "Set a monthly sales target"],
  people: ["Write role descriptions for each staff member", "Introduce a basic onboarding checklist", "Schedule monthly 1:1 check-ins"],
  digital_readiness: ["Set up a business email and Google Workspace", "Create or refresh the company website", "Adopt a cloud accounting tool"],
  procurement_readiness: ["Register on the Central Supplier Database (CSD)", "Prepare a capability statement", "Obtain a B-BBEE certificate"],
  funding_readiness: ["Compile a 1-page business plan", "Gather 6 months of bank statements", "Build a pitch deck"],
  market_access: ["Identify 3 target buyers and their requirements", "Attend one trade event this quarter", "List the business on one online marketplace"],
};

export const FUNDING_ITEMS = [
  { key: "business_plan", label: "Business plan" },
  { key: "financial_statements", label: "Financial statements" },
  { key: "bank_statements", label: "Bank statements (6 months)" },
  { key: "tax_clearance", label: "Tax clearance certificate" },
  { key: "cipc_documents", label: "CIPC registration documents" },
  { key: "id_documents", label: "Founder ID documents" },
  { key: "pitch_deck", label: "Pitch deck" },
  { key: "collateral", label: "Collateral schedule" },
  { key: "credit_record", label: "Credit record" },
];

export const PROCUREMENT_ITEMS = [
  { key: "cipc_registration", label: "CIPC registration" },
  { key: "tax_compliance", label: "Tax compliance certificate" },
  { key: "bbbee_certificate", label: "B-BBEE certificate" },
  { key: "bank_confirmation", label: "Bank confirmation letter" },
  { key: "insurance", label: "Business insurance" },
  { key: "capability_statement", label: "Capability statement" },
  { key: "references", label: "Client references" },
  { key: "pricing_schedule", label: "Pricing schedule" },
  { key: "csd_registration", label: "CSD registration" },
];

export function emptyScores() {
  const s = {};
  CATEGORIES.forEach((c) => (s[c.key] = 3));
  return s;
}

export function computeOverall(scores) {
  const vals = CATEGORIES.map((c) => Number(scores?.[c.key] ?? 0)).filter((v) => v > 0);
  if (!vals.length) return 0;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round((avg / 5) * 100);
}

export function getStrengths(scores) {
  return CATEGORIES.filter((c) => Number(scores?.[c.key]) >= 4).map((c) => c.label);
}

export function getGaps(scores) {
  return CATEGORIES.filter((c) => Number(scores?.[c.key]) <= 2).map((c) => c.label);
}

export function generateRecommendedActions(scores) {
  const actions = [];
  CATEGORIES.forEach((c) => {
    if (Number(scores?.[c.key]) <= 2) {
      (CANNED_ACTIONS[c.key] || []).forEach((a) => actions.push(a));
    }
  });
  return actions;
}

export function readinessScore(checklist, items) {
  const total = items.length;
  const done = items.filter((i) => checklist?.[i.key]).length;
  return total ? Math.round((done / total) * 100) : 0;
}

export function readinessExplanation(score, checklist, items) {
  const total = items.length;
  const done = items.filter((i) => checklist?.[i.key]).length;
  const missing = items.filter((i) => !checklist?.[i.key]).map((i) => i.label);
  const missingText = missing.length ? ` Missing: ${missing.join(", ")}.` : "";
  return `You scored ${score}% because you have ${done} of ${total} items complete.${missingText}`;
}

export function healthColor(score) {
  if (score >= 70) return "#16a34a"; // green
  if (score >= 40) return "#f59e0b"; // amber
  return "#dc2626"; // red
}

export function healthLabel(score) {
  if (score >= 70) return "Healthy";
  if (score >= 40) return "At risk";
  return "Critical";
}

export function scoreToRadarData(scores) {
  return CATEGORIES.map((c) => ({ dimension: c.label, score: Number(scores?.[c.key] ?? 0) * 20 }));
}