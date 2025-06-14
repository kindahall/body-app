-- Configuration du Cron Job pour le Bonus Quotidien
-- File: setup-daily-cron.sql
-- À exécuter dans l'éditeur SQL de Supabase

-- =====================================================
-- CONFIGURATION DU CRON JOB AUTOMATIQUE
-- =====================================================

-- Supprimer l'ancien job s'il existe
SELECT cron.unschedule('daily-credit-bonus');

-- Créer le nouveau job cron pour le bonus quotidien
-- Exécute tous les jours à 00h00 UTC (01h00 en France en hiver, 02h00 en été)
SELECT cron.schedule(
  'daily-credit-bonus',
  '0 0 * * *',  -- Cron expression: tous les jours à minuit UTC
  $$
  SELECT net.http_post(
    url := 'https://xrvafxvowvoxpxcefktx.supabase.co/functions/v1/daily_bonus',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- =====================================================
-- VÉRIFICATION ET DIAGNOSTIC
-- =====================================================

-- Vérifier que le job a été créé
SELECT 
  jobname as "Nom du Job",
  schedule as "Planning Cron",
  active as "Actif",
  database as "Base de données"
FROM cron.job 
WHERE jobname = 'daily-credit-bonus';

-- =====================================================
-- TEST MANUEL (OPTIONNEL)
-- =====================================================

-- Pour tester immédiatement le bonus quotidien (décommenter si besoin)
-- SELECT daily_bonus();

-- =====================================================
-- INFORMATIONS UTILES
-- =====================================================

-- Afficher les informations sur la configuration
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CRON JOB CONFIGURÉ AVEC SUCCÈS !';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🕐 Planning: Tous les jours à 00h00 UTC';
  RAISE NOTICE '🎁 Action: +1 crédit pour tous les utilisateurs';
  RAISE NOTICE '🔗 Fonction: daily_bonus Edge Function';
  RAISE NOTICE '📊 URL: https://xrvafxvowvoxpxcefktx.supabase.co/functions/v1/daily_bonus';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📝 Commandes utiles:';
  RAISE NOTICE '• Voir les jobs: SELECT * FROM cron.job;';
  RAISE NOTICE '• Logs du job: SELECT * FROM cron.job_run_details WHERE jobname = ''daily-credit-bonus'';';
  RAISE NOTICE '• Test manuel: SELECT daily_bonus();';
  RAISE NOTICE '========================================';
END $$; 