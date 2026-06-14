# Lyriks · Brand Hub

Portail unique du système de marque Lyriks : chartes, bibliothèque de supports,
calendrier éditorial, studio de création, palette de commandes ⌘K.

Recréé en **React + TypeScript + Vite** à partir du design handoff
(`design_handoff_lyriks_hub`). Le système de marque (`brand.css`) est repris
verbatim comme source de vérité visuelle (couleurs, dégradés, typo, logo).

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3300
```

## Architecture

- `src/styles/brand.css` , tokens de marque (source de vérité), importé tel quel.
- `src/styles/app.css` , chrome de l'app (header, rail, dashboard, ⌘K), porté du `site.html`.
- `src/data/pages.ts` , modèle de navigation (`PAGES`).
- `src/App.tsx` , shell : header pleine largeur + rail + zone contenu, routing réel.
- `src/components/` , `Logo`, `Rail`, `CommandPalette`, `Dashboard`.
- `public/reference/` , pages de marque d'origine (charte, templates, studio,
  calendrier) servies en statique et embarquées en iframe. **Ne pas reconstruire
  le branding** : ces pages sont la référence figée.

### Routing

- `/` , Tableau de bord (dashboard).
- `/p/:pageId` , une page de marque (iframe vers `/reference/<fichier>`), ou un
  stub « bientôt » pour les pages pas encore branchées.

## Reste à faire (Phase 2)

- **Lyriks Unplugged** : plateforme de pilotage interne (login + 2FA, sélecteur
  d'environnement Lyriks / Unspaghettit / Partagé, 7 domaines, board cycle de vie).
- Pages encore en stub : Formats & exports, Moodboards.
