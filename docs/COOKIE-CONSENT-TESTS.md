# Plan de test manuel - Consentement cookies CNIL/GDPR

## 1. Première visite / bannière
- Ouvrir le site en navigation privée (ou supprimer le cookie `site_consent`)
- **Attendu** : bannière en bas de page avec « Tout accepter », « Tout refuser », « Personnaliser »

## 2. Tout accepter
- Cliquer sur « Tout accepter »
- **Vérifier** : bannière disparaît
- **DevTools** : Application → Cookies → `localhost` → voir `site_consent` avec `analytics:true`, `marketing:true`

## 3. Tout refuser
- Supprimer `site_consent`, recharger
- Cliquer sur « Tout refuser »
- **DevTools** : `site_consent` avec `analytics:false`, `marketing:false`

## 4. Personnaliser + Gérer mes cookies
- Supprimer `site_consent`, recharger
- Cliquer « Personnaliser » → panneau s’ouvre
- Ou : après avoir un choix enregistré, cliquer « Gérer mes cookies » dans le footer
- **Attendu** : modal avec toggles Statistiques / Marketing, boutons « Tout accepter », « Tout refuser », « Enregistrer »

## 5. Vérifier les cookies essentiels
- Se connecter (Supabase)
- **DevTools** : cookies `sb-*-auth-token` présents (auth)
- Aller sur une page de paiement Stripe
- **DevTools** : cookies Stripe peuvent apparaître (domaine Stripe)
- Les cookies essentiels restent actifs quelle que soit la préférence

---

## Vérification DevTools

1. F12 → **Application** (ou Stockage)
2. **Cookies** → `http://localhost:3000`
3. Chercher :
   - `site_consent` : `{"v":1,"ts":...,"necessary":true,"analytics":bool,"marketing":bool}`
   - `sb-*-auth-token` : après connexion
   - Durée `site_consent` : ~180 jours (max-age)
