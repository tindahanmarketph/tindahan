import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isUserVerified, saveIdentityToAccount } from "../lib/identity";

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

  // Rattrapage : déjà vérifié sur cet appareil mais pas encore sur le compte -> on l'enregistre une fois
  useEffect(() => {
    if (user?.id) saveIdentityToAccount(user);
  }, [user?.id, user?.user_metadata?.identity_status]);

  if (loadingAuth || !user) return null;
  if (ALLOWED.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`))) return null;
  if (isUserVerified(user)) return null;

  return <Navigate to="/verify-identity" replace state={{ from: location.pathname + location.search }} />;
}