# Audit SEO technique – salledeculte.com

## 1. Architecture Next.js

| Élément | Constat |
|--------|---------|
| **Router** | **App Router uniquement** (`/app`) – pas de Pages Router |
| **Layout global** | `app/layout.tsx` – définit `metadata` via `defaultMetadata` de `lib/seo.ts` |
| **Héritage meta** | Les pages héritent des meta du layout ; les pages enfants peuvent surcharger via `export const metadata` ou `generateMetadata` |

---

## 2. Audit Layout & Head (P0)

### ✅ Déjà en place
- `metadataBase` (via `lib/seo.ts`)
- `title` par défaut + template `%s | salledeculte.com`
- `description` par défaut
- `keywords`, `authors`, `creator`
- OpenGraph (type, locale, siteName, url, title, description, images)
- Twitter card `summary_large_image`
- `robots` (index, follow) par défaut
- `theme-color` dans viewport
- `lang="fr"` sur `<html>`
- `robots.ts` dynamique
- `sitemap.ts` dynamique avec exclusions

### ❌ Problèmes identifiés

| Problème | Impact | Priorité |
|----------|--------|----------|
| **Canonical global = homepage** | `alternates.canonical` dans `defaultMetadata` pointe vers `baseUrl` pour toutes les pages → risque de contenu dupliqué | **P0** |
| **Favicons manquants** | Référence à `/favicon/favicon.ico`, `/favicon/icon1.png`, `/favicon/apple-icon.png` – seuls `icon0.svg` et `manifest.json` existent | **P0** |
| **og-image.png absent** | Image OG par défaut `/og-image.png` non présente dans `/public` | **P0** |
| **Manifest incorrect** | Nom "MyWebSite"/"MySite", chemins vers icônes inexistantes, theme/background blanc | **P0** |
| **Pages privées indexables** | `/auth`, `/login`, `/signup`, `/dashboard`, `/proprietaire`, `/admin` sans `robots: noindex` | **P0** |
| **Pas de generateMetadata sur money pages** | `/salles/[slug]` et `/blog/[slug]` sans meta dynamiques → titles/descriptions génériques | **P1** |
| **Pages sans metadata** | `/rechercher`, `/blog`, `/centre-aide`, `/centre-aide/*` sans title/description dédiés | **P1** |
| **Pricing sans description** | `metadata` incomplet | **P1** |

### Structure HTML
- ✅ `<main>`, `<header>` (SiteHeader), `<footer>` présents sur les pages publiques
- ✅ Un seul H1 par page
- ✅ Hiérarchie H2/H3 respectée
- ✅ Contenu SSR utile (pas de SPA vide)

---

## 3. Implémentation recommandée

Voir les diffs et fichiers modifiés ci-dessous.

---

## 4. Assets à ajouter dans `/public`

### Checklist

| Fichier | Statut | Action |
|---------|--------|--------|
| `/public/favicon/favicon.ico` | ❌ | Créer 48×48 |
| `/public/favicon/apple-icon.png` | ❌ | Créer 180×180 |
| `/public/favicon/icon-192.png` | ❌ | Créer 192×192 (pour manifest) |
| `/public/favicon/icon-512.png` | ❌ | Créer 512×512 (pour manifest) |
| `/public/og-image.png` | ❌ | Créer 1200×630 (image de marque) |
| `/public/favicon/manifest.json` | ✅ | Corrigé (nom, theme_color, icônes) |
| `/public/favicon/icon0.svg` | ✅ | Existe (utilisé en fallback) |

**Référencement App Router :**  
Les chemins dans `metadata.icons` et `metadata.manifest` sont relatifs à `/public`. Ex. `/favicon/favicon.ico` → `public/favicon/favicon.ico`.

**Génération des icônes :**  
Utiliser un outil comme [realfavicongenerator.net](https://realfavicongenerator.net/) ou [favicon.io](https://favicon.io/) avec votre logo pour générer l’ensemble des formats.

---

## 5. Robots & Sitemap

### robots.txt
- ✅ `app/robots.ts` existe et génère un robots correct
- ✅ Exclusion de `/admin`, `/dashboard`, `/proprietaire`, `/auth`, etc.
- ✅ Référence au sitemap

### Sitemap
- ✅ `app/sitemap.ts` dynamique
- ✅ Exclusions via `SITEMAP_EXCLUDE_PREFIXES`
- ✅ Routes statiques + blog + salles
- ⚠️ Vérifier que `NEXT_PUBLIC_SITE_URL` est défini en prod (sinon localhost dans les URLs)

---

## 6. Audit pages & metadata

### Routes publiques (money pages)

| Route | Title | Description | Canonical | OG |
|-------|-------|-------------|-----------|-----|
| `/` | ✅ | ✅ | ❌ (global) | ✅ |
| `/rechercher` | ❌ (default) | ❌ | ❌ | ❌ |
| `/salles/[slug]` | ❌ | ❌ | ❌ | ❌ |
| `/salles/[slug]/disponibilite` | ❌ | ❌ | ❌ | ❌ |
| `/blog` | ❌ | ❌ | ❌ | ❌ |
| `/blog/[slug]` | ❌ | ❌ | ❌ | ❌ |
| `/pricing` | ✅ | ❌ | ❌ | ❌ |
| `/centre-aide` | ❌ | ❌ | ❌ | ❌ |
| `/centre-aide/organisateur` | ❌ | ❌ | ❌ | ❌ |
| `/centre-aide/proprietaire` | ❌ | ❌ | ❌ | ❌ |
| `/centre-aide/general` | ❌ | ❌ | ❌ | ❌ |

### Routes privées (à noindex)

| Route | noindex |
|-------|---------|
| `/auth` | ❌ |
| `/login` | ❌ |
| `/signup` | ❌ |
| `/dashboard/*` | ❌ |
| `/proprietaire/*` | ❌ |
| `/admin/*` | ❌ |
| `/onboarding/*` | ❌ |

---

## 7. Plan par priorités

### P0 (bloquant indexation / meta)
1. Retirer le canonical global et le gérer par page
2. Créer/corriger les favicons et og-image
3. Corriger le manifest
4. Ajouter `robots: { index: false, follow: false }` sur les layouts privés

### P1 (qualité + CTR)
1. `generateMetadata` sur `/salles/[slug]` et `/blog/[slug]`
2. Metadata sur `/rechercher`, `/blog`, `/centre-aide`, `/pricing`
3. Canonical par page sur les money pages

### P2 (schema, perf, maillage)
1. JSON-LD (Organization, LocalBusiness pour les salles)
2. Optimisation Core Web Vitals
3. Liens internes stratégiques

---

## 8. Fichiers modifiés (correctifs appliqués)

| Fichier | Modifications |
|---------|---------------|
| `lib/seo.ts` | Suppression canonical global, ajout `buildCanonical()`, correction chemins favicons |
| `app/layout.tsx` | Inchangé (déjà correct) |
| `app/page.tsx` | Ajout `metadata` avec canonical `/` |
| `app/salles/[slug]/page.tsx` | Ajout `generateMetadata` (title, description, canonical, OG, Twitter) |
| `app/salles/[slug]/disponibilite/page.tsx` | Ajout `generateMetadata` |
| `app/blog/[slug]/page.tsx` | Ajout `generateMetadata` (type article) |
| `app/blog/page.tsx` | Ajout `metadata` |
| `app/rechercher/layout.tsx` | Ajout `metadata` |
| `app/centre-aide/page.tsx` | Ajout `metadata` |
| `app/centre-aide/organisateur/page.tsx` | Ajout `metadata` |
| `app/centre-aide/proprietaire/page.tsx` | Ajout `metadata` |
| `app/centre-aide/general/page.tsx` | Ajout `metadata` |
| `app/pricing/page.tsx` | Ajout description + canonical |
| `app/auth/layout.tsx` | Ajout `robots: { index: false, follow: false }` |
| `app/dashboard/layout.tsx` | Ajout `metadata` + noindex |
| `app/proprietaire/layout.tsx` | Ajout `metadata` + noindex |
| `app/admin/layout.tsx` | Ajout `metadata` + noindex |
| `app/login/page.tsx` | Ajout noindex |
| `app/signup/page.tsx` | Ajout noindex |
| `public/favicon/manifest.json` | Nom, description, theme_color, background_color, chemins icônes |
| `app/sitemap.ts` | Correction `getSallesSlugs` → `getSalles()` |
