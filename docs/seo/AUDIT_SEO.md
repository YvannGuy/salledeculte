# Audit SEO – salledeculte.com

## Executive summary

1. Le site repose sur **Next.js** avec SSR, ce qui est **favorable au SEO** si le rendu et l’indexation sont correctement gérés.
2. La base technique est plutôt saine (HTTPS, sitemap XML, robots, pages d’app privées en noindex), mais des **optimisations de structure et de contenus** sont nécessaires pour viser le top 1 sur les requêtes cœur.
3. Les pages stratégiques (home, `/rechercher`, fiches salles, pages propriétaires/avantages, blog) peuvent être **mieux alignées sur l’intention de recherche** et enrichies en contenu éditorial.
4. L’architecture actuelle permet une bonne expansion long tail (par ville / type d’événement), mais le **maillage interne thématique** reste à structurer (hubs “ville”, “type d’événement”, “guide pratique”).
5. Le site utilise déjà des données structurées de type `Organization` / `WebSite` ; des **schemas supplémentaires** (LocalBusiness, Product/Offer, FAQ) sont à déployer sur les fiches et les guides.
6. Les Core Web Vitals sont probablement corrects sur desktop mais **fragiles sur mobile** (images hero, fonts, JS de recherche) et doivent être pilotés via des mesures concrètes.
7. Le **contenu blog** est encore limité comparé aux concurrents qui occupent l’espace des requêtes informationnelles.
8. Le profil de liens semble relativement jeune ; un **plan netlinking white-hat structuré sur 90 jours** est indispensable.
9. À court terme, les gains les plus rapides viendront de : (1) optimiser titles/H1 et contenus des pages money, (2) renforcer le maillage interne, (3) corriger les éventuels problèmes d’indexation.
10. À moyen terme, un **plan éditorial + link building** permettra d’augmenter l’autorité du domaine et de se positionner durablement en top 3 sur les requêtes stratégiques.

---

## 1. SEO technique

### 1.1 Crawlability & indexation

#### Robots.txt & sitemap

- **Constat** : `robots.txt` autorise `/`, bloque `/admin`, `/dashboard`, `/proprietaire`, `/api`. Sitemap généré via `app/sitemap.ts`.
- **Risques** : Pages importantes absentes du sitemap ; incohérences robots vs URLs.
- **Vérifier** : `curl https://salledeculte.com/robots.txt`, `curl https://salledeculte.com/sitemap.xml`, crawl (Screaming Frog / script `crawl-seo.mjs`).
- **Corriger** : Inclure toutes les pages indexables dans le sitemap ; ne jamais mettre une URL dans le sitemap si bloquée par robots.

#### Canonical, hreflang, duplicate

- **Constat** : Site FR uniquement. Canonicals gérés via `buildCanonical` ; risque `/` vs `/accueil`, variantes `/rechercher?...`
- **Vérifier** : Crawl (URL, canonical, status) ; recherche Google `site:salledeculte.com` pour duplicats.
- **Corriger** : Un seul canonical pour home (`/`) ; canonical sur `/rechercher` sans params pour les variantes non indexables ; noindex sur combinaisons de facettes inutiles.

#### Status codes, redirections, soft 404

- **Vérifier** : Aucune 404 pour URLs du menu/footer/sitemap ; 301 cohérentes (http→https, www) ; pas de chaînes > 2 hops.
- **Outils** : Site Audit (Ahrefs/Semrush), `curl -I` sur URLs clés.

### 1.2 Paramètres, facettes, pagination

- **Contexte** : `/rechercher` avec query (ville, date, type d’événement).
- **Recommandations** : Décider des URLs indexables (ex. `/rechercher?ville=paris`) ; canonical + noindex sur combinaisons ultra spécifiques ; éventuellement bloquer patterns de params inutiles dans robots.txt.

### 1.3 JS rendering / SSR

- **Vérifications** : `curl` + “View source” pour vérifier que le HTML contient titres et texte clés sans JS ; GSC “Pages” pour “Crawled - currently not indexed”.
- **Actions** : S’assurer que les pages money sont server-side rendered ; limiter le JS non essentiel sur home et /rechercher.

### 1.4 Core Web Vitals & performance

- **KPI** : LCP (hero), INP (recherche/filtres), CLS (header/hero). TTFB (Vercel + Supabase).
- **Actions** : Images hero (Next `Image`, webp, `priority` ciblé) ; preload fonts ; scripts tiers en `afterInteractive` ; pagination côté serveur sur /rechercher.

### 1.5 Données structurées (schema.org)

- **Actuel** : `Organization` + `WebSite` + `SearchAction` dans le layout.
- **Opportunités** : Fiches salles → `LocalBusiness`/`Place` + `Offer` + `AggregateRating` si avis ; Blog → `Article`/`BlogPosting` ; FAQ → `FAQPage`. Tester avec l’outil Rich Results.

### 1.6 Sécurité, mobile, accessibilité

- HTTPS forcé, pas de mixed content. Headers : HSTS, X-Content-Type-Options, X-Frame-Options. Mobile-first vérifié dans GSC ; CTA visibles above the fold. Alt sur images, contraste, H1 unique.

---

## 2. SEO On-page

### 2.1 Titres, metas, headings

- Chaque page money : 1 requête principale + 2–3 secondaires. Home : title déjà optimisé ; H1 orienté bénéfice. /rechercher : title “Rechercher une salle pour cultes et événements religieux en Île-de-France”. Éviter cannibalisation (plusieurs pages sur “location salle culte Paris”).

### 2.2 Structure & intention

- Home : branding + offres + fonctionnement + preuves. /rechercher : texte intro 200–300 mots (types d’événements, zones, particularités). Fiche salle : description, capacités, équipements, conditions culte, FAQ. Guides : requêtes info (“comment choisir une salle de culte”).

### 2.3 Maillage interne

- Hubs “ville” (ex. `/salles/ile-de-france/paris/`) et “type d’événement”. Blog → liens vers /rechercher préfiltré + fiches. Fiches → “autres salles pour culte dans [ville]”.

### 2.4 Images, FAQ, rich snippets

- FAQ sur home, /rechercher, fiches ; balisage `FAQPage` pour rich snippets.

---

## 3. SEO Contenu / Stratégie

### 3.1 Gap analysis

- **Avec outil** : Content Gap (Ahrefs/Semrush) vs 3–5 concurrents ; filtrer requêtes “culte”, “église”, “évangélique”, “prière” ; KD ≤ 40, Volume ≥ 50.
- **Sans outil** : Analyser manuellement blogs/concurrents ; sujets récurrents (coût, organisation, statut juridique).

### 3.2 Clusters thématiques

- **Cluster 1** – “Trouver une salle de culte” : pilier “Comment trouver une salle adaptée pour vos cultes en Île-de-France ?” + articles checklist, erreurs à éviter, différence salle culte vs polyvalente.
- **Cluster 2** – “Ville / Région” : piliers Paris, 93, etc. + guides par ville.
- **Cluster 3** – “Culte & organisation” : pilier “Organiser un culte dans une salle louée” + assurances, bruit, voisinage.

### 3.3 Plan éditorial 4–8 semaines

| Semaine | Titre | Intention | Hn |
|--------|------|-----------|-----|
| S1 | Comment trouver une salle adaptée pour vos cultes en Île-de-France ? | Info/Transac | H1 + H2 critères, budget, check-list |
| S1 | Checklist pour louer une salle de culte le dimanche | Info | H2 Avant/Pendant/Jour J |
| S2 | Location de salles pour cultes à Paris : le guide complet | Info locale | H2 quartiers, budget, lieux, réserver |
| S2 | Organiser un culte dans une salle louée : aspects pratiques et légaux | Info | H2 statut, baux, sécurité |
| S3 | Quelles assurances pour un culte dans une salle louée ? | Info | H2 risques, contrats, choix |
| S3 | Comment préparer l’acoustique d’une salle pour un culte ? | Info | H2 sonorisation, musique, tests |
| S4 | Location de salles pour événements religieux en Seine-Saint-Denis | Info locale | H2 contexte 93, prix, lieux |
| S4 | Modèles de messages pour inviter vos fidèles dans une nouvelle salle | Inspiration | H2 e-mail, SMS, réseaux |

---

## 4. Backlinks / Autorité

### 4.1 Données à extraire

- **Ahrefs/Semrush** : Domaines référents (DR/AS ≥ 20), backlinks dofollow FR, rapport Anchors (brand / URL / money).
- **GSC** : Liens externes, pages les plus liées.
- **Filtres** : Exclure spam score élevé, TLD exotiques ; privilégier liens contextuels.

### 4.2 Sur-optimisation d’ancres

- Cible : **50–70 %** brand, **10–20 %** URL, **≤10–15 %** money. Signaux de risque : nombreux liens faible DR avec ancres money exact match ; pics de liens depuis sites douteux.

### 4.3 20 opportunités prioritaires

- **Link Intersect** (Ahrefs/Semrush) : 3–5 concurrents → domaines qui linkent ≥2 concurrents mais 0 vers toi. Classer par DR/AS et trafic ; prioriser FR/EU, thématiques proches (événementiel, associatif, religieux).

---

## 5. Table d’actions priorisées

| Action | Pourquoi | Priorité | Effort | Owner | ETA |
|--------|----------|----------|--------|-------|-----|
| Normaliser canonical `/` vs `/accueil` et /rechercher | Éviter duplicate et dilution | P0 | S | Dev | 1–2 j |
| Vérifier robots.txt & sitemap (exclure privé, inclure money) | Indexation optimale | P0 | S | Dev | 1–2 j |
| Ajouter schemas LocalBusiness/Place + Offer sur fiches | Rich results, CTR | P1 | M | Dev | 1–2 sem |
| Enrichir /rechercher de 200–300 mots ciblés | Intention, pertinence | P0 | S | Content | 1 sem |
| Structurer H1/H2 sur home, /rechercher, /avantages, /blog | Thématique, cannibalisation | P0 | S | Content | 1 sem |
| Créer pages hub “ville” (Paris, 92, 93, 94…) | Long tail géo, maillage | P1 | M | Dev+Content | 2–4 sem |
| FAQ balisées (home, /rechercher, fiches) | FAQ rich snippets | P1 | M | Dev+Content | 2–3 sem |
| Optimiser images hero & fonts, auditer CWV (4 pages) | LCP/CLS/INP, mobile | P0 | M | Dev | 1–2 sem |
| Cluster contenus “trouver une salle” (8 articles) | Trafic info + maillage | P1 | M | Content | 4–8 sem |
| Cluster “ville/région” (3+ guides) | Géolocalisation, long tail | P1 | M | Content | 4–8 sem |
| Suivi CWV via GSC + monitoring Vercel | Pilotage perfs | P1 | S | Dev | 1 sem |
| Audit backlinks + désaveu liens toxiques | Sécuriser profil | P1 | M | SEO | 2–3 sem |
| Plan netlinking 30/60/90 j (LINK_PLAN.md) | Autorité domaine | P0 | M/L | SEO/PR | 3 mois |
| Events GA4 sur CTA (demande, contact) | Conversion par page | P1 | M | Dev/Analytics | 1–2 sem |
| Script crawl-seo.mjs mensuel | Titles/meta/wordcount | P2 | S | Dev | 1–2 j |

**Légende** : P0 = critique, P1 = important, P2 = opportunité. Effort : S = simple, M = moyen, L = lourd.

---

## 6. Checklists & outils

### Audit “sans accès”

- [ ] Crawl (Screaming Frog ou `node scripts/crawl-seo.mjs`) de l’URL du sitemap.
- [ ] Exporter : URLs, status, title, meta, H1, canonical, wordcount.
- [ ] Tester `robots.txt` et `sitemap.xml`.
- [ ] PageSpeed Insights (mobile + desktop) sur 4 pages clés.
- [ ] Tester données structurées (home, fiche, article) avec Rich Results Test.
- [ ] 10–15 recherches manuelles Google, noter SERP.

### Audit “avec accès”

- [ ] Exports GSC : Performances, Pages (exclusions), Liens.
- [ ] GA4 : pages vues, taux conversion sur CTA.
- [ ] Ahrefs/Semrush : backlinks, domaines référents, ancres.
- [ ] Link Intersect avec 3+ concurrents.
- [ ] Logs Googlebot (top 1000 URLs) si disponible.
