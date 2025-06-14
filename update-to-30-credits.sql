-- Script pour mettre à jour les crédits à 30
-- File: update-to-30-credits.sql

-- 1. Mettre à jour TOUS les utilisateurs à 30 crédits
UPDATE profiles 
SET credits = 30;

-- 2. Vérifier le résultat
SELECT 
  id,
  credits,
  'Utilisateur avec 30 crédits' as status
FROM profiles
ORDER BY credits DESC;

-- 3. Résumé final
DO $$
DECLARE
  total_users INTEGER;
  total_credits INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM profiles;
  SELECT SUM(credits) INTO total_credits FROM profiles;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ MISE À JOUR TERMINÉE !';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Utilisateurs mis à jour: %', total_users;
  RAISE NOTICE 'Total crédits distribués: %', total_credits;
  RAISE NOTICE 'Crédits par utilisateur: 30';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎯 Rechargez votre application !';
  RAISE NOTICE '========================================';
END $$; 