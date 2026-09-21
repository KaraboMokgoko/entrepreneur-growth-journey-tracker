import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { homeForRole } from "@/lib/roles";

// Wraps a page element. If the current user's role is not allowed, redirect
// to their home page and show a toast.
export default function RequireRole({ allowedRoles, children }) {
  const { user } = useAuth();
  const role = user?.role || "user";
  if (!allowedRoles.includes(role)) {
    toast.error("You do not have access to that page");
    return <Navigate to={homeForRole(role)} replace />;
  }
  return children;
}