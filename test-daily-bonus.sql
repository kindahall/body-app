-- Test du système de bonus quotidien
-- File: test-daily-bonus.sql
-- À exécuter dans l'éditeur SQL de Supabase

-- =====================================================
-- TEST DU BONUS QUOTIDIEN
-- =====================================================

-- Vérifier l'état actuel des crédits
SELECT 
  COUNT(*) as "Total utilisateurs",
  SUM(credits) as "Total crédits",
  AVG(credits) as "Moyenne crédits"
FROM profiles;

-- Exécuter le bonus quotidien manuellement
SELECT daily_bonus() as "Résultat du bonus";

-- Vérifier l'état après le bonus
SELECT 
  COUNT(*) as "Total utilisateurs",
  SUM(credits) as "Total crédits",
  AVG(credits) as "Moyenne crédits"
FROM profiles;

-- Afficher les utilisateurs et leurs crédits
SELECT 
  p.id,
  p.credits,
  p.updated_at,
  u.email
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.updated_at DESC
LIMIT 10; 