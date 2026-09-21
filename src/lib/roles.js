// Role configuration for the Entrepreneur Growth Journey Tracker.
// Roles are stored on the platform User entity's `role` field.

export const ROLES = ["admin", "practitioner", "mentor", "entrepreneur", "funder"];

export const ROLE_LABELS = {
  admin: "Admin",
  practitioner: "Practitioner",
  mentor: "Mentor",
  entrepreneur: "Entrepreneur",
  funder: "Funder",
};

export const ROLE_COLORS = {
  admin: "bg-violet-100 text-violet-700",
  practitioner: "bg-teal-100 text-teal-700",
  mentor: "bg-blue-100 text-blue-700",
  entrepreneur: "bg-amber-100 text-amber-700",
  funder: "bg-rose-100 text-rose-700",
};

// Sidebar nav per role. `to` is a route path.
export const NAV_BY_ROLE = {
  admin: [
    { to: "/cohort", label: "Cohort Dashboard", icon: "BarChart3" },
    { to: "/enterprises", label: "Enterprises", icon: "Building2" },
    { to: "/diagnostics", label: "Diagnostics", icon: "ClipboardList" },
    { to: "/actions", label: "Development Plan", icon: "ListChecks" },
    { to: "/interventions", label: "Interventions", icon: "Handshake" },
    { to: "/milestones", label: "Milestones", icon: "Flag" },
    { to: "/mentorship", label: "Mentorship", icon: "Users" },
    { to: "/readiness", label: "Readiness", icon: "ShieldCheck" },
    { to: "/users", label: "Users", icon: "UserCog" },
    { to: "/settings", label: "Settings", icon: "Settings" },
  ],
  practitioner: [
    { to: "/cohort", label: "Dashboard", icon: "BarChart3" },
    { to: "/enterprises", label: "My Enterprises", icon: "Building2" },
    { to: "/diagnostics", label: "Diagnostics", icon: "ClipboardList" },
    { to: "/actions", label: "Development Plan", icon: "ListChecks" },
    { to: "/interventions", label: "Interventions", icon: "Handshake" },
    { to: "/milestones", label: "Milestones", icon: "Flag" },
    { to: "/mentorship", label: "Mentorship", icon: "Users" },
    { to: "/readiness", label: "Readiness", icon: "ShieldCheck" },
  ],
  mentor: [
    { to: "/cohort", label: "Dashboard", icon: "BarChart3" },
    { to: "/enterprises", label: "My Enterprises", icon: "Building2" },
    { to: "/mentorship", label: "Mentorship Sessions", icon: "Users" },
  ],
  entrepreneur: [
    { to: "/", label: "My Dashboard", icon: "LayoutDashboard" },
    { to: "/enterprises", label: "My Profile", icon: "Building2" },
    { to: "/actions", label: "My Development Plan", icon: "ListChecks" },
    { to: "/milestones", label: "My Milestones", icon: "Flag" },
    { to: "/interventions", label: "My Interventions", icon: "Handshake" },
    { to: "/mentorship", label: "My Mentorship", icon: "Users" },
  ],
  funder: [
    { to: "/cohort", label: "Cohort Dashboard", icon: "BarChart3" },
  ],
};

export function homeForRole(role) {
  if (role === "entrepreneur") return "/";
  return "/cohort";
}

export function canManageEnterprise(role) {
  return role === "admin" || role === "practitioner";
}

export function canAssess(role) {
  return role === "admin" || role === "practitioner";
}

export function canRecordIntervention(role) {
  return role === "admin" || role === "practitioner";
}

export function canRecordMentorship(role) {
  return role === "admin" || role === "mentor" || role === "practitioner";
}

export function canManageUsers(role) {
  return role === "admin";
}