# Guide de Configuration Supabase - Résolution de l'erreur "Failed to send magic link"

## Problème Identifié

L'erreur "Failed to send magic link. Please try again." est causée par des **clés API Supabase invalides** dans votre fichier `.env.local`. Les clés actuelles sont des clés de test factices qui ne fonctionnent pas.

## Solution : Obtenir vos vraies clés Supabase

### Étape 1 : Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "Start your project" ou "Sign in" si vous avez déjà un compte
3. Créez un nouveau projet :
   - Nom du projet : `bodycount` (ou le nom de votre choix)
   - Mot de passe de la base de données : choisissez un mot de passe fort
   - Région : choisissez la plus proche de vous

### Étape 2 : Obtenir vos clés API

1. Une fois votre projet créé, allez dans votre dashboard Supabase
2. Dans le menu de gauche, cliquez sur **"Settings"** (Paramètres)
3. Cliquez sur **"API"**
4. Vous verrez :
   - **Project URL** : votre URL de projet (ex: `https://abcdefgh.supabase.co`)
   - **anon public** : votre clé publique anonyme
   - **service_role** : votre clé de service (gardez-la secrète !)

### Étape 3 : Mettre à jour votre fichier .env.local

1. Ouvrez le fichier `.env.local` dans votre projet
2. Remplacez les valeurs placeholders par vos vraies clés :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_vraie_cle_anon_ici
SUPABASE_SERVICE_ROLE_KEY=votre_vraie_cle_service_role_ici
```

### Étape 4 : Configurer l'authentification

1. Dans votre dashboard Supabase, allez dans **"Authentication"** > **"Settings"**
2. Dans **"Site URL"**, ajoutez : `http://localhost:3000`
3. Dans **"Redirect URLs"**, ajoutez :
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000`

### Étape 5 : Configurer la base de données (optionnel)

Si vous voulez créer les tables nécessaires :

1. Allez dans **"SQL Editor"**
2. Exécutez ce script pour créer la table users :

```sql
-- Créer la table users
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  lang text default 'en',
  subscription_status text default 'free' check (subscription_status in ('free', 'standard', 'premium')),
  stripe_customer_id text,
  stripe_price_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activer RLS (Row Level Security)
alter table public.users enable row level security;

-- Créer une politique pour que les utilisateurs puissent voir leurs propres données
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

-- Créer une politique pour que les utilisateurs puissent mettre à jour leurs propres données
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);
```

### Étape 6 : Redémarrer votre application

1. Arrêtez votre serveur de développement (Ctrl+C)
2. Redémarrez avec : `npm run dev`
3. Testez l'authentification sur `http://localhost:3000/auth`

## Vérification

Pour vérifier que vos clés fonctionnent, vous pouvez tester avec curl :

```bash
curl -H "apikey: VOTRE_CLE_ANON" https://VOTRE_URL_SUPABASE/rest/v1/
```

Si les clés sont valides, vous devriez recevoir une réponse JSON au lieu d'une erreur "Invalid API key".

## Sécurité

⚠️ **Important** :
- Ne partagez JAMAIS votre `service_role` key publiquement
- Ajoutez `.env.local` à votre `.gitignore`
- La clé `anon` peut être exposée côté client, c'est normal

## Support

Si vous avez encore des problèmes :
1. Vérifiez que vos clés sont correctement copiées (sans espaces)
2. Assurez-vous que votre projet Supabase est actif
3. Consultez les logs de votre console de développement pour plus de détails