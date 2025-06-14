-- Script de test pour vérifier et donner des crédits
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Vérifier si la table profiles existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') 
    THEN '✅ Table profiles existe'
    ELSE '❌ Table profiles manquante' 
  END as table_status;

-- 2. Vérifier combien d'utilisateurs ont des profils
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as users_with_profiles;

-- 3. Voir tous les profils avec crédits
SELECT id, credits, created_at, updated_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. DONNER DES CRÉDITS SUPPLÉMENTAIRES À TOUS LES UTILISATEURS (exécutez si besoin)
-- Décommentez une ligne suivante si vous voulez donner des crédits :
-- UPDATE profiles SET credits = credits + 50;  -- +50 crédits (5 analyses)
-- UPDATE profiles SET credits = credits + 100; -- +100 crédits (10 analyses)

-- 5. Créer un profil avec crédits pour un utilisateur spécifique
-- Remplacez 'YOUR-USER-ID' par votre vrai ID utilisateur
-- INSERT INTO profiles (id, credits) VALUES ('YOUR-USER-ID', 100) ON CONFLICT (id) DO UPDATE SET credits = profiles.credits + 100;

-- 6. Vérifier les fonctions de crédits
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('increment_all_credits', 'add_credits_to_user', 'consume_credits', 'get_user_credits')
ORDER BY routine_name;

-- 7. Test des fonctions (décommentez pour tester)
-- SELECT increment_all_credits(); -- Donne +1 crédit à tous

-- 8. Voir les dernières activités sur les crédits
SELECT 
  id,
  credits,
  updated_at,
  extract(epoch from (now() - updated_at))/3600 as hours_since_update
FROM profiles 
WHERE updated_at > now() - interval '24 hours'
ORDER BY updated_at DESC; 