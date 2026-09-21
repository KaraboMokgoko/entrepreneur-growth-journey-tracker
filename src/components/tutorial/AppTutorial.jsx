import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Building2,
  ClipboardList,
  CheckSquare,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to Growth Journey Tracker",
    body: "This quick tour shows you how to take an enterprise from first diagnostic to funding readiness. It takes under a minute — and you can reopen it anytime from the help icon in the top bar.",
  },
  {
    icon: LayoutGrid,
    title: "Your menu, your role",
    body: "The menu on the left shows only the modules your role can use. Admins and practitioners see everything, entrepreneurs see their own enterprise, and funders see the anonymized cohort dashboard.",
  },
  {
    icon: Building2,
    title: "Start with enterprises",
    body: "Every growth journey starts here. Open an enterprise to see its profile, live health score and everything recorded about its progress in one place.",
  },
  {
    icon: ClipboardList,
    title: "Run a diagnostic",
    body: "Score the business across 10 dimensions — from strategy and finance to procurement readiness. The tracker turns those scores into strengths, priority gaps and recommended actions automatically.",
  },
  {
    icon: CheckSquare,
    title: "Plan and track growth",
    body: "Turn the gaps into a development plan with owners and target dates, then track milestones, interventions and mentorship sessions as they happen.",
  },
  {
    icon: ShieldCheck,
    title: "Get funding-ready",
    body: "Work through the funding and procurement checklists to become investor- and buyer-ready. The dashboards show how health scores improve over time.",
  },
];

export default function AppTutorial({ open, onClose }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-label="App tutorial"
        className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-teal-700 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 className="text-lg font-semibold leading-snug mt-0.5">{current.title}</h2>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mt-4">{current.body}</p>

        <div className="flex items-center gap-1.5 mt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-6 bg-teal-700" : "w-1.5 bg-slate-300"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 mt-5">
          <Button
            variant="ghost"
            size="sm"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={onClose}>
            Skip for now
          </Button>
          {isLast ? (
            <Button size="sm" onClick={onClose}>
              Get started
            </Button>
          ) : (
            <Button size="sm" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}