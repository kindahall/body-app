# Configuration Supabase pour BodyCount

## ⚠️ Erreur "relation does not exist" 
Si vous voyez l'erreur `relation "public.self_reflection" does not exist` ou similaire, c'est que les tables de la base de données n'ont pas été créées.

### Solution rapide :
1. Allez dans votre projet Supabase
2. Cliquez sur **SQL Editor** dans le menu de gauche
3. Copiez TOUT le contenu du fichier `supabase_schema.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **RUN** pour exécuter le script
6. Attendez que toutes les requêtes se terminent
7. Rafraîchissez votre application

Si l'erreur persiste, vérifiez que :
- Toutes les requêtes SQL se sont exécutées sans erreur
- Vos variables d'environnement sont correctes
- Vous êtes connecté au bon projet Supabase

## Problème actuel
L'application affiche "Failed to send magic link" car les clés Supabase ne sont pas correctement configurées.

## Solution : Configurer votre projet Supabase

### 1. Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Choisissez votre organisation
5. Donnez un nom à votre projet (ex: "bodycount")
6. Choisissez un mot de passe pour la base de données
7. Sélectionnez une région proche de vous
8. Cliquez sur "Create new project"

### 2. Obtenir vos clés API
1. Dans votre projet Supabase, allez dans **Settings** > **API**
2. Copiez les valeurs suivantes :
   - **Project URL** (commence par `https://`)
   - **anon public** key (commence par `eyJ`)
   - **service_role** key (commence par `eyJ`)

### 3. Configurer la base de données
1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Copiez le contenu du fichier `supabase_schema.sql` de ce projet
3. Collez-le dans l'éditeur SQL et exécutez-le
4. Cela créera toutes les tables nécessaires avec les bonnes permissions

### 4. Configurer l'authentification
1. Allez dans **Authentication** > **Settings**
2. Dans **Site URL**, ajoutez : `http://localhost:3000`
3. Dans **Redirect URLs**, ajoutez : `http://localhost:3000/auth/callback`
4. Activez **Enable email confirmations** si vous voulez

### 5. Mettre à jour vos variables d'environnement
1. Ouvrez le fichier `.env.local`
2. Remplacez les valeurs par vos vraies clés :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_vraie_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_vraie_cle_service_role
```

### 6. Redémarrer l'application
```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez
npm run dev
```

## Test
Après configuration :
1. Allez sur `http://localhost:3000`
2. Entrez votre email
3. Cliquez sur "Send Magic Link"
4. Vous devriez recevoir un email avec un lien de connexion

## Dépannage
- **Toujours "Failed to send magic link"** : Vérifiez que vos clés sont correctes
- **Pas d'email reçu** : Vérifiez vos spams, ou activez un provider SMTP dans Supabase
- **Erreur de redirection** : Vérifiez que `http://localhost:3000/auth/callback` est dans les Redirect URLs

## Support
Si vous avez des problèmes, vérifiez :
1. Les logs de la console du navigateur (F12)
2. Les logs du serveur Next.js
3. Les logs dans votre dashboard Supabase > Logs