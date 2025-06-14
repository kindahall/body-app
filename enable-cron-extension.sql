-- Activation de l'extension pg_cron pour Supabase
-- File: enable-cron-extension.sql
-- À exécuter dans l'éditeur SQL de Supabase

-- =====================================================
-- ACTIVATION DE L'EXTENSION PG_CRON
-- =====================================================

-- Activer l'extension pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Vérifier que l'extension est bien installée
SELECT 
  extname as "Extension",
  extversion as "Version",
  nspname as "Schema"
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE extname = 'pg_cron';

-- =====================================================
-- CONFIGURATION DU CRON JOB
-- =====================================================

-- Supprimer l'ancien job s'il existe
SELECT cron.unschedule('daily-credit-bonus');

-- Créer le nouveau job cron pour le bonus quotidien
-- Exécute tous les jours à 00h00 UTC
SELECT cron.schedule(
  'daily-credit-bonus',
  '0 0 * * *',  -- Cron expression: tous les jours à minuit UTC
  $$SELECT daily_bonus();$$
);

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Vérifier que le job a été créé
SELECT 
  jobid as "ID Job",
  jobname as "Nom du Job",
  schedule as "Planning Cron",
  active as "Actif",
  database as "Base de données"
FROM cron.job 
WHERE jobname = 'daily-credit-bonus';

-- =====================================================
-- TEST IMMÉDIAT
-- =====================================================

-- Exécuter le bonus quotidien immédiatement pour tester
SELECT daily_bonus() as "Test du bonus quotidien";

-- =====================================================
-- INFORMATIONS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SYSTÈME DE BONUS QUOTIDIEN ACTIVÉ !';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🕐 Planning: Tous les jours à 00h00 UTC';
  RAISE NOTICE '🎁 Action: +1 crédit pour tous les utilisateurs';
  RAISE NOTICE '🔄 Fonction: daily_bonus()';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📝 Commandes utiles:';
  RAISE NOTICE '• Voir les jobs: SELECT * FROM cron.job;';
  RAISE NOTICE '• Logs du job: SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;';
  RAISE NOTICE '• Test manuel: SELECT daily_bonus();';
  RAISE NOTICE '========================================';
END $$; 