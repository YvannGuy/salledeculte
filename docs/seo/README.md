# SEO – salledeculte.com

Documentation et plan d’action SEO.

## Fichiers

| Fichier | Contenu |
|---------|--------|
| [AUDIT_SEO.md](./AUDIT_SEO.md) | Audit technique + on-page + contenu + backlinks ; table d’actions priorisées ; checklists sans/avec accès. |
| [KEYWORD_MAP.md](./KEYWORD_MAP.md) | Mapping pages → requêtes principales/secondaires, intention, slug recommandé ; requêtes head/body. |
| [LINK_PLAN.md](./LINK_PLAN.md) | Plan netlinking 30/60/90 jours, ancres, types de spots, monitoring. |

## Script de crawl

Le script `scripts/crawl-seo.mjs` récupère les URLs depuis le sitemap, puis pour chaque URL : status, title, meta description, H1, canonical, wordcount. Il génère `crawl-seo.csv` à la racine du projet et affiche les pages &lt; 300 mots, meta manquantes, titles dupliqués.

**Prérequis** : Node 18+ (fetch natif). Aucune dépendance.

```bash
# Depuis la racine du projet
npm run seo:crawl

# Ou avec une URL de sitemap personnalisée
node scripts/crawl-seo.mjs https://salledeculte.com/sitemap.xml
```

Le CSV est écrit dans `crawl-seo.csv` (à la racine). À lancer régulièrement (ex. mensuel) pour suivre titles/meta/wordcount.
