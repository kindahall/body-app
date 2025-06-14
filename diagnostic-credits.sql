-- Script de diagnostic du système de crédits
-- File: diagnostic-credits.sql
-- Exécutez ce script AVANT le script de correction pour voir l'état actuel

SELECT '========================================' as "DIAGNOSTIC DU SYSTÈME DE CRÉDITS";

-- 1. Vérifier si la table profiles existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') 
    THEN '✅ Table profiles existe'
    ELSE '❌ Table profiles manquante' 
  END as "Statut table profiles";

-- 2. Vérifier si la colonne credits existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'credits'
    ) 
    THEN '✅ Colonne credits existe'
    ELSE '❌ Colonne credits manquante' 
  END as "Statut colonne credits";

-- 3. Compter les utilisateurs et profils
SELECT 
  (SELECT COUNT(*) FROM auth.users) as "Total utilisateurs auth.users",
  (SELECT COUNT(*) FROM profiles) as "Total profils avec crédits",
  (SELECT COUNT(*) FROM profiles WHERE credits > 0) as "Profils avec crédits > 0";

-- 4. Voir les crédits de tous les utilisateurs
SELECT 
  p.id,
  p.credits,
  p.created_at,
  u.email
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- 5. Statistiques des crédits
SELECT 
  MIN(credits) as "Crédits minimum",
  MAX(credits) as "Crédits maximum", 
  AVG(credits) as "Crédits moyenne",
  SUM(credits) as "Total crédits distribués"
FROM profiles;

-- 6. Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 7. Vérifier les fonctions créées
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN ('get_user_credits', 'spend_credits', 'add_credits', 'daily_bonus')
ORDER BY routine_name;

SELECT '========================================' as "FIN DU DIAGNOSTIC"; 