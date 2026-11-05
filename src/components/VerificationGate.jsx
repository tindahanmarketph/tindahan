import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isIdentityVerified } from "../lib/identity";

/*
 * Tant que l'identité (18+ et pièce d'identité) n'est pas vérifiée,
 * une personne connectée est renvoyée vers /verify-identity.
 * Les visiteurs non connectés et les pages légales/aide restent accessibles.
 */
const ALLOWED = [
  "/verify-identity",
  "/login",
  "/register",
  "/terms",
  "/privacy",
  "/cookies",
  "/cookie-settings",
  "/legal",
  "/community-guidelines",
  "/help-center",
  "/about",
  "/trust-and-safety",
  "/buyer-protection",
  "/platform"
];

export default function VerificationGate() {
  const { user, loadingAuth } = useAuth();
  const location = useLocation();

  if (loadingAuth || !user) return null;
  if (ALLOWED.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`))) return null;
  if (isIdentityVerified(user.id)) return null;

  return <Navigate to="/verify-identity" replace state={{ from: location.pathname + location.search }} />;
}
