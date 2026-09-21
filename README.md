# Entrepreneur Growth Journey Tracker

A growth-tracking platform for small businesses, built for Simply Complex Africa's ICT Hackathon 2026 (Challenge 05). It diagnoses an enterprise, creates a development plan, records interventions and milestones, measures funding/procurement readiness, and shows progress over time.

> **Platform note:** This app is built on the **Base44** platform. The original brief specified Supabase + TypeScript + custom Supabase Auth. Because Base44 provides its own backend (entities), its own authentication, and uses JavaScript/JSX, the architecture was adapted:
>
> - **Database** → Base44 entities (JSON schemas) with per-entity Row-Level Security replacing SQL RLS policies.
> - **Auth** → platform-managed auth (email/password + Google). The builder is the admin. Additional roles are created by inviting users from the **Users** page and assigning a role.
> - **TypeScript** → JavaScript/JSX (Vite + React).
> - Everything else (Recharts, Lucide, react-hook-form, date-fns, sonner, shadcn/ui) is used as specified.
>
> The full product concept, data model, role-based access, 10-dimension scoring engine, modules and dashboards are intact.

## Features

- **Role-based access** (admin, practitioner, mentor, entrepreneur, funder) enforced via route guards, sidebar visibility and per-entity RLS.
- **Hamburger menu** layout: overlay drawer on mobile, collapsible icon rail on desktop.
- **Enterprises** with full profile, health gauge and 8 tabs (Overview, Diagnostics, Development Plan, Interventions, Milestones, Mentorship, Readiness, Growth).
- **Diagnostics**: 10-dimension 1–5 scoring with auto-generated strengths, priority gaps and recommended actions; baseline + reassessment with growth deltas.
- **Development Plan**: action table with filters, inline status, and "Generate actions from diagnostic".
- **Milestones**: list and Kanban views with status moves that persist.
- **Interventions**: timeline grouped by month.
- **Mentorship**: session cards with follow-ups (mentor/admin can record).
- **Readiness**: compliance table, funding and procurement checklists with progress bars and plain-language score explanations.
- **Dashboards**: per-enterprise hero dashboard (radar, trend, KPIs, gaps) and a cohort dashboard (sector/stage/revenue charts, readiness heatmap, anonymized for funders).
- **Users** (admin): invite users and assign roles.
- **Settings** (admin): edit profile, reset demo data.

## Tech stack

React + Vite, Tailwind CSS, shadcn/ui, React Router v6, Recharts, Lucide, date-fns, sonner, Base44 entities + auth.

## Roles & access matrix

| Capability | Admin | Practitioner | Mentor | Entrepreneur | Funder |
|---|---|---|---|---|---|
| See all enterprises | Yes | Assigned | Assigned | Own only | No (anonymized) |
| Create/edit enterprises | Yes | Yes | No | Profile only | No |
| Diagnostics, actions, interventions, milestones, readiness | All | Assigned | View | Own (status updates) | No |
| Mentorship sessions | All | View | Create/edit (assigned) | View own | No |
| Users management | Yes | No | No | No | No |
| Cohort dashboard | Real names | Real names | — | — | Anonymized |

> On Base44, the signed-in builder is the admin. To exercise other roles, invite users from **Users** (e.g. `practitioner@...`, `mentor@...`) and set their role; they will see the role-appropriate sidebar and landing page.

## Resetting demo data

Admin → **Settings → Reset demo data** re-seeds a cohort of 6 enterprises with diagnostics, reassessments, actions, milestones, interventions, mentorship sessions, compliance records and readiness assessments (all dated relative to today, so charts stay populated).