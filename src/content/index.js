import * as legal from "./legal";
import * as company from "./company";

/* route -> contenu. La clé sert aussi aux liens « related » des pages. */
export const INFO_PAGES = {
  terms: { path: "/terms", ...legal.terms },
  privacy: { path: "/privacy", ...legal.privacy },
  cookies: { path: "/cookies", ...legal.cookies },
  "community-guidelines": { path: "/community-guidelines", ...legal.communityGuidelines },
  "buyer-protection": { path: "/buyer-protection", ...legal.buyerProtection },
  about: { path: "/about", ...company.about },
  platform: { path: "/platform", ...company.platform },
  sustainability: { path: "/sustainability", ...company.sustainability },
  press: { path: "/press", ...company.press },
  advertising: { path: "/advertising", ...company.advertising },
  accessibility: { path: "/accessibility", ...company.accessibility },
  "mobile-apps": { path: "/mobile-apps", ...company.mobileApps },
  buy: { path: "/buy", ...company.buy },
  "trust-and-safety": { path: "/trust-and-safety", ...company.trustSafety },
  "item-verification": { path: "/item-verification", ...company.itemVerification },
  "help-center": { path: "/help-center", title: "Help Center" }
};

export const LEGAL_KEYS = ["terms", "privacy", "cookies", "community-guidelines", "buyer-protection"];
