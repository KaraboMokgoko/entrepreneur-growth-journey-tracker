import { Badge } from "@/components/ui/badge";

const ROLE_INFO = [
  { role: "Admin", badge: "bg-violet-100 text-violet-700", can: "Full access: manages users, roles, enterprises, settings and every record." },
  { role: "Practitioner", badge: "bg-teal-100 text-teal-700", can: "Runs diagnostics, builds development plans and records interventions." },
  { role: "Mentor", badge: "bg-blue-100 text-blue-700", can: "Views enterprise progress and records mentorship sessions." },
  { role: "Entrepreneur", badge: "bg-amber-100 text-amber-700", can: "Owns an enterprise profile, sees their dashboard and updates progress." },
  { role: "Funder", badge: "bg-rose-100 text-rose-700", can: "Views anonymised cohort dashboards to inform funding decisions." },
];

const STEPS = [
  {
    title: "Create the enterprise",
    body: "Go to Enterprises → Add enterprise and capture the founder, sector, stage, revenue band and province. The enterprise record becomes the home for all of its growth data.",
  },
  {
    title: "Invite and assign users",
    body: "Under Users, invite people with the role that matches their job (see the roles table above). New users can also choose their own role when they register. Then open the enterprise and assign the practitioner and mentor so they can work on it.",
  },
  {
    title: "Run the baseline diagnostic",
    body: "Open the enterprise → Diagnostics → New diagnostic and score all ten capability areas from 1 to 5. This produces the baseline health score that the whole journey is measured against.",
  },
];

export default function GuidePageOne() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">What this platform does</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The Growth Journey Tracker helps programme staff take an enterprise from first
          assessment to funding readiness. Each enterprise gets a baseline diagnostic, a
          development plan, and a growing record of support — interventions, mentorship,
          milestones and compliance — so that progress is measurable and funders can see
          the impact at cohort level.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Roles and access</h2>
        <div className="space-y-2">
          {ROLE_INFO.map((r) => (
            <div key={r.role} className="flex items-start gap-3 rounded-lg border p-3">
              <Badge className={`${r.badge} border-transparent`}>{r.role}</Badge>
              <p className="pt-0.5 text-sm text-muted-foreground">{r.can}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Getting started</h2>
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
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
    </div>
  );
}