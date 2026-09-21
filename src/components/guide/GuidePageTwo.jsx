const WORKFLOW = [
  {
    title: "Baseline diagnostic",
    body: "Score the ten capability areas (strategy, finance, operations, compliance, sales & marketing, people, digital, procurement, funding and market access). The overall health score is calculated automatically, and priority gaps are flagged.",
  },
  {
    title: "Development plan",
    body: "The gaps from the diagnostic become development actions with an owner, target date and priority. Track each action from Not started through In progress to Completed, and attach evidence.",
  },
  {
    title: "Support delivery",
    body: "Record interventions (training, funding, compliance, market access), set milestones with target dates, and log mentorship sessions with challenges, guidance and follow-ups. Everything is timestamped on the enterprise timeline.",
  },
  {
    title: "Readiness checklists",
    body: "Work through the compliance items, the procurement readiness checklist (CIPC, tax, B-BBEE, CSD and more) and the funding readiness checklist (business plan, financials, pitch deck and more). Each checklist produces a 0–100% readiness score.",
  },
  {
    title: "Reassessment and growth",
    body: "After the support period, run a reassessment diagnostic. The Growth tab compares scores before and after, and the enterprise dashboard shows the radar, health gauge and score trend.",
  },
];

const TIPS = [
  "Score honestly at baseline — improvement only shows if the starting point is real.",
  "Review development actions weekly and update their status; a plan nobody updates is invisible.",
  "Keep compliance items current — funders check expiry dates.",
  "Use the Cohort Dashboard to spot enterprises that are stalling before they drop off.",
];

export default function GuidePageTwo() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">The growth journey workflow</h2>
        <ol className="space-y-3">
          {WORKFLOW.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">The Cohort Dashboard</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The Cohort Dashboard aggregates every enterprise into programme-level views:
          average health score, sector and stage mix, how many enterprises are funding
          ready, and anonymised trend lines. Funders see this view so individual
          enterprises stay private while the programme's impact stays visible.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Best practices</h2>
        <ul className="space-y-2">
          {TIPS.map((t) => (
            <li key={t} className="flex gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
              {t}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}