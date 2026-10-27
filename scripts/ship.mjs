/*
 * npm run ship -- "Message du commit"
 *
 * 1. compile le projet (vite build) : si ça échoue, rien n'est envoyé
 * 2. enregistre les changements (git add + git commit)
 * 3. envoie sur GitHub (git push) -> Netlify se met à jour tout seul
 *
 * Sur la branche "main", Netlify publie en PRODUCTION.
 * Sur une autre branche, Netlify peut créer un aperçu (si activé dans Netlify).
 */
import { execSync, execFileSync } from "node:child_process";

const message = process.argv.slice(2).join(" ").trim() || "Update TindaHan";

function step(title) {
  console.log(`\n\x1b[1m\x1b[33m▶ ${title}\x1b[0m`);
}

function fail(text) {
  console.error(`\n\x1b[31m✖ ${text}\x1b[0m`);
  process.exit(1);
}

try {
  const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();

  step(`1/3  Compilation (branche : ${branch})`);
  execSync("npm run build", { stdio: "inherit" });

  step("2/3  Enregistrement des changements");
  const changes = execSync("git status --porcelain").toString().trim();

  if (changes) {
    execFileSync("git", ["add", "-A"], { stdio: "inherit" });
    execFileSync("git", ["commit", "-m", message], { stdio: "inherit" });
  } else {
    console.log("Aucun nouveau changement à enregistrer.");
  }

  step("3/3  Envoi sur GitHub");
  execFileSync("git", ["push", "-u", "origin", branch], { stdio: "inherit" });

  console.log(
    branch === "main"
      ? "\n\x1b[32m✔ Envoyé sur main : Netlify publie la nouvelle version en production (1 à 2 minutes).\x1b[0m"
      : `\n\x1b[32m✔ Envoyé sur « ${branch} » : ouvrez Netlify > Deploys pour voir l'aperçu, ou fusionnez dans main pour publier.\x1b[0m`
  );
} catch (error) {
  fail(`Arrêté : ${error.message.split("\n")[0]}`);
}
