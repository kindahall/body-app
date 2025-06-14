# Configuration du Bonus Quotidien Automatique

## Vue d'ensemble

Le système de bonus quotidien donne automatiquement +1 crédit par jour à tous les utilisateurs. Voici comment le configurer dans Supabase.

## 🛠️ Étapes de configuration

### 1. Exécuter le script de correction

D'abord, exécutez le fichier `fix-credits-system.sql` dans votre éditeur SQL Supabase pour :
- Créer la table `profiles`
- Donner 10 crédits de départ à tous les utilisateurs existants
- Configurer les fonctions de gestion des crédits

### 2. Déployer la fonction Edge

La fonction `supabase/functions/daily_bonus/index.ts` est déjà créée. Déployez-la :

```bash
supabase functions deploy daily_bonus
```

### 3. Configurer le Cron Job

Dans votre tableau de bord Supabase, allez dans **Database** > **Cron** et créez un nouveau job :

```sql
SELECT cron.schedule(
  'daily-credit-bonus',
  '0 0 * * *',  -- Tous les jours à minuit UTC
  $$
  SELECT net.http_post(
    url := 'https://[VOTRE-PROJECT-ID].supabase.co/functions/v1/daily_bonus',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [VOTRE-SERVICE-ROLE-KEY]"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

⚠️ **Remplacez** :
- `[VOTRE-PROJECT-ID]` par votre ID de projet Supabase
- `[VOTRE-SERVICE-ROLE-KEY]` par votre clé service role

### 4. Tester manuellement

Vous pouvez tester le bonus en appelant manuellement la fonction :

```bash
curl -X POST 'https://[VOTRE-PROJECT-ID].supabase.co/functions/v1/daily_bonus' \
  -H 'Authorization: Bearer [VOTRE-SERVICE-ROLE-KEY]' \
  -H 'Content-Type: application/json'
```

### 5. Donner des crédits manuellement (optionnel)

Si vous voulez donner des crédits immédiatement à un utilisateur :

```sql
SELECT add_credits_to_user('[USER-ID]', 50);
```

## 🔍 Vérification

### Vérifier les crédits d'un utilisateur :

```sql
SELECT credits FROM profiles WHERE id = '[USER-ID]';
```

### Vérifier le job cron :

```sql
SELECT * FROM cron.job WHERE jobname = 'daily-credit-bonus';
```

### Logs de la fonction Edge :

Allez dans **Edge Functions** > **daily_bonus** > **Logs** pour voir les exécutions.

## 🎯 Fonctionnalités du système

✅ **Création automatique de profil** : Chaque nouvel utilisateur reçoit automatiquement 10 crédits  
✅ **Bonus quotidien** : +1 crédit par jour pour tous les utilisateurs  
✅ **Achat de crédits** : Packs de 50, 150, 500 crédits via Stripe  
✅ **Consommation** : 10 crédits par analyse IA  
✅ **Pas d'expiration** : Les crédits ne expirent jamais  

## 🔧 Dépannage

### Si les crédits n'apparaissent pas :

1. Vérifiez que la table `profiles` existe
2. Vérifiez que l'utilisateur a un profil dans `profiles`
3. Exécutez manuellement : `SELECT get_user_credits('[USER-ID]');`

### Si le bonus quotidien ne fonctionne pas :

1. Vérifiez que le cron job est actif
2. Vérifiez les logs de la fonction Edge
3. Testez manuellement la fonction

### Accorder des crédits de test :

```sql
-- Donner 100 crédits à un utilisateur
SELECT add_credits_to_user('[USER-ID]', 100);

-- Donner 1 crédit à tous les utilisateurs (bonus manuel)
SELECT increment_all_credits();
``` 