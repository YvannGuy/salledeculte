# Boilerplate Next.js + Stripe + Supabase

Projet Next.js 14 (App Router) en TypeScript avec :

- Tailwind CSS
- Composants shadcn/ui (Button, Card, Accordion, Input, Select)
- Stripe (Checkout + Webhook)
- Supabase (Auth + DB)

## Lancer le projet

1. Copier `.env.example` vers `.env.local`
2. Renseigner les variables Supabase et Stripe
3. Installer et lancer :

```bash
npm install
npm run dev
```

## SQL Supabase

Exécutez le script `config/supabase.sql` dans l'éditeur SQL Supabase pour :

- créer la table `profiles`
- activer les policies RLS
- créer un trigger qui crée automatiquement le profil à l'inscription

## Déploiement Vercel

**Important** : configurez les variables d'environnement dans Vercel (Settings → Environment Variables) :

- `NEXT_PUBLIC_SUPABASE_URL` – URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Clé anonyme Supabase
- Optionnel : `NEXT_PUBLIC_SITE_URL` (ex: `https://votredomaine.com`)

Sans ces variables, le site renvoie une erreur 500 (le proxy Supabase ne peut pas s'initialiser).

## Routes principales

- `/` landing page
- `/pricing`
- `/login`
- `/signup`
- `/dashboard` (protégé via middleware)
- `/api/stripe/checkout`
- `/api/stripe/webhook`
