# MCP `lyriks-calendar`

Serveur MCP (stdio) pour piloter la **Grille éditoriale** du Brand Hub depuis un LLM.
Il lit/écrit le **même document** que le calendrier web (via l'endpoint `/api/doc`),
donc les changements sont **partagés** : ce que le LLM ajoute apparaît dans le
calendrier au rechargement, et inversement.

## Modèle
- **Segment** = preneur de parole (Page LYRIKS, David Mabboux, Adrien Charles, Adrien Basso, Newsletter…)
- **Thématique** = sous-segment d'un segment
- **Publication** = un post sur une thématique, à une date, avec un statut
- **Statuts** : `DRAFT` · `VALIDATED` · `PUBLISHED`

## Outils
| Outil | Rôle |
|---|---|
| `get_calendar` | structure (segments, thématiques) + compteurs par statut |
| `list_publications` | lister avec filtres (segment, thématique, statut, dates) |
| `add_publication` | créer une publication (segment/thématique résolus par nom, créés si absents) |
| `update_publication` | modifier (titre, date, statut, type, déplacer) par `id` |
| `delete_publication` | supprimer par `id` |
| `list_segments` | segments & thématiques avec leurs `id` |
| `add_segment` | créer un segment |
| `add_thematique` | ajouter une thématique à un segment |

## Configuration (variables d'env)
- `BRANDHUB_URL` — défaut `https://lyriks-brand-hub.vercel.app`
- `BRANDHUB_USER` / `BRANDHUB_PASS` — auth Basic du hub (user par défaut `lyriks` ; le mot de passe est fourni via la variable d'env `BRANDHUB_PASS`, jamais en clair dans le repo)
- `BRANDHUB_DOC` — défaut `grille-editoriale`

La clé Supabase n'est **pas** requise : le MCP passe par `/api/doc` (auth Basic).

## Enregistrement
Déjà déclaré dans `.mcp.json` (racine du projet) sous le nom `lyriks-calendar`.
Pour l'utiliser ailleurs (autre poste / claude.ai), pointer un client MCP sur :

```json
{
  "command": "node",
  "args": ["<chemin>/lyriks-brand-hub/mcp/index.mjs"],
  "env": { "BRANDHUB_USER": "lyriks", "BRANDHUB_PASS": "<mot de passe du hub>" }
}
```

## Test
`node test.mjs` — cycle add → list → update → delete contre la prod.

## Note
Store partagé simple (read-modify-write sur un doc JSON). Pour de l'édition
concurrente intensive, préférer une base transactionnelle. La lecture est
anti-cache (cohérence read-after-write assurée côté `/api/doc`).
