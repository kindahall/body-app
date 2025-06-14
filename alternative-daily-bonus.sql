-- Alternative au Cron Job : Système de bonus quotidien automatique
-- File: alternative-daily-bonus.sql  
-- À exécuter dans l'éditeur SQL de Supabase

-- =====================================================
-- SOLUTION ALTERNATIVE SANS PG_CRON
-- =====================================================

-- Créer une table pour suivre les bonus quotidiens
CREATE TABLE IF NOT EXISTS daily_bonus_log (
  id SERIAL PRIMARY KEY,
  bonus_date DATE DEFAULT CURRENT_DATE,
  users_count INTEGER DEFAULT 0,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_daily_bonus_log_date ON daily_bonus_log(bonus_date);

-- =====================================================
-- FONCTION DE BONUS INTELLIGENT
-- =====================================================

-- Fonction améliorée qui vérifie si le bonus d'aujourd'hui a déjà été donné
CREATE OR REPLACE FUNCTION public.smart_daily_bonus()
RETURNS TEXT AS $$
DECLARE 
  affected_users INTEGER;
  today_date DATE := CURRENT_DATE;
  bonus_already_given BOOLEAN;
BEGIN
  -- Vérifier si le bonus d'aujourd'hui a déjà été donné
  SELECT EXISTS(
    SELECT 1 FROM daily_bonus_log 
    WHERE bonus_date = today_date
  ) INTO bonus_already_given;
  
  -- Si le bonus a déjà été donné aujourd'hui, ne rien faire
  IF bonus_already_given THEN
    RETURN 'Bonus quotidien déjà accordé aujourd''hui (' || today_date || ')';
  END IF;
  
  -- Donner le bonus quotidien
  UPDATE profiles 
  SET credits = credits + 1;
  
  GET DIAGNOSTICS affected_users = ROW_COUNT;
  
  -- Enregistrer dans le log
  INSERT INTO daily_bonus_log (bonus_date, users_count)
  VALUES (today_date, affected_users);
  
  RETURN format('Bonus quotidien accordé à %s utilisateurs le %s', affected_users, today_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION DÉCLENCHÉE PAR CONNEXION UTILISATEUR
-- =====================================================

-- Fonction qui sera appelée à chaque connexion d'utilisateur
CREATE OR REPLACE FUNCTION public.check_and_give_daily_bonus()
RETURNS VOID AS $$
BEGIN
  -- Exécuter le bonus intelligent (qui vérifie automatiquement)
  PERFORM smart_daily_bonus();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TEST ET VÉRIFICATION
-- =====================================================

-- Tester le système immédiatement
SELECT smart_daily_bonus() as "Test du bonus intelligent";

-- Voir l'historique des bonus
SELECT 
  bonus_date as "Date",
  users_count as "Utilisateurs",
  executed_at as "Exécuté à"
FROM daily_bonus_log 
ORDER BY bonus_date DESC 
LIMIT 10;

-- Vérifier les crédits actuels
SELECT 
  COUNT(*) as "Total utilisateurs",
  SUM(credits) as "Total crédits",
  AVG(credits) as "Moyenne crédits"
FROM profiles;

-- =====================================================
-- INSTRUCTIONS D'UTILISATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SYSTÈME DE BONUS ALTERNATIF ACTIVÉ !';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔄 Fonctionnement: Vérifie automatiquement le bonus quotidien';
  RAISE NOTICE '📅 Fréquence: Une fois par jour maximum';
  RAISE NOTICE '🎁 Action: +1 crédit pour tous les utilisateurs';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📝 Comment l''utiliser:';
  RAISE NOTICE '1. Appelez SELECT smart_daily_bonus(); dans votre application';
  RAISE NOTICE '2. Ou intégrez check_and_give_daily_bonus() à vos API';
  RAISE NOTICE '3. Le système empêche les doublons automatiquement';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 Commandes utiles:';
  RAISE NOTICE '• Test: SELECT smart_daily_bonus();';
  RAISE NOTICE '• Historique: SELECT * FROM daily_bonus_log;';
  RAISE NOTICE '• Stats: SELECT * FROM profiles ORDER BY updated_at DESC LIMIT 5;';
  RAISE NOTICE '========================================';
END $$; 