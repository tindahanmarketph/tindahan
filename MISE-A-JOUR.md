# Mise à jour TindaHan : design Kanto, mode sombre, pages d'information

## 1. Installer les fichiers
1. Dézippez `tindahan-kanto-complet.zip` dans un dossier temporaire.
2. Copiez TOUT son contenu dans votre dossier de projet (celui qui contient `.git`), en remplaçant les fichiers.
   Ne supprimez pas votre `.env` ni le dossier `.git` : ils ne sont pas dans l'archive.
3. Aucune nouvelle dépendance n'est ajoutée. `npm install` est quand même conseillé.

## 2. Tester en local (VS Code > Terminal)
```
npm install
npm run dev
```
Ouvrez l'adresse affichée (souvent http://localhost:5173). Essayez le mode sombre avec la lune dans la barre du haut, ou Profil > Appearance.

## 3. Mettre en ligne sur Netlify
Option conseillée (branche de test) :
```
git checkout -b design-kanto
npm run ship -- "Design Kanto, dark mode, legal pages"
```
Le script compile, enregistre (commit) et envoie sur GitHub. Dans Netlify > Deploys, ouvrez l'aperçu de la branche `design-kanto` (si les « Branch deploys » sont activés), ou créez une Pull Request sur GitHub pour avoir un « Deploy Preview ».
Quand tout vous convient :
```
git checkout main
git merge design-kanto
git push
```
Netlify publie alors en production.

Option directe (publie tout de suite si vous êtes sur `main`) :
```
npm run ship -- "Design Kanto, dark mode, legal pages"
```

## 4. Variables Netlify
Votre `.env` est suivi par Git, donc Netlify le reçoit au build. Si un jour vous le retirez de Git, ajoutez dans Netlify > Site configuration > Environment variables : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.

## 5. Revenir en arrière
Netlify > Deploys > choisissez l'ancien déploiement > « Publish deploy ». Ou `git revert <commit>` puis `npm run ship`.

## 6. À valider avant le lancement
- Faites relire les textes juridiques (Terms, Privacy Center, Cookie Policy, Community Guidelines, Buyer Protection) par un juriste philippin.
- Règles commerciales écrites dans les textes : signalement d'un problème sous 2 jours après livraison, remboursement vers le wallet, frais Buyer Protection de 8 %.
- Mise à jour des dates : `LEGAL_UPDATED` dans `src/content/site.js`.
- Thème par défaut : clair. Pour suivre l'appareil : `DEFAULT_THEME_PREFERENCE = "system"` dans `src/lib/theme.js` et la valeur "light" dans le script de `index.html`.
