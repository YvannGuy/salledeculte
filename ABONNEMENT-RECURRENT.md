# Abonnement récurrent

L'abonnement est maintenant un **abonnement Stripe récurrent** (facturation mensuelle).

## 1. Créer le prix dans Stripe

1. **Stripe Dashboard** → Products → Add product
2. Nom : « Abonnement »
3. Prix : **Recurring** (récurrent), mensuel
4. Montant : 19,99 €/mois (ou le montant de `pass.price_abonnement` dans les paramètres plateforme)
5. Sauvegarder → copier le **Price ID** (ex. `price_xxxxxxxxxxxxx`)

## 2. Variables d'environnement

Ajoute sur Vercel et dans `.env.local` :

```
STRIPE_PRICE_ABONNEMENT=price_xxxxxxxxxxxxx
```

## 3. Migration SQL

Exécute dans **Supabase** → SQL Editor :

```sql
-- config/supabase-abonnement-recurrent.sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_id TEXT;
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
```

## 4. Webhooks Stripe

Ajoute ces événements à ton webhook (`https://ton-domaine.com/api/stripe/webhook`) :

| Événement | Utilité |
|-----------|---------|
| `checkout.session.completed` | Paiement initial (pass 24h, 48h, abonnement) |
| `customer.subscription.deleted` | Fin d'abonnement |
| `customer.subscription.updated` | Annulation, impayé |
| `invoice.paid` | Renouvellements mensuels (enregistrement dans `payments`) |

## 5. Gestion utilisateur

Les abonnés peuvent **annuler** ou **modifier** leur abonnement via le bouton « Ouvrir l'espace gestion Stripe » (Stripe Customer Portal).
