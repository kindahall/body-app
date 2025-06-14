-- Correction de la table profiles et fonction de bonus quotidien
-- File: fix-profiles-table.sql
-- À exécuter dans l'éditeur SQL de Supabase

-- =====================================================
-- AJOUT DE LA COLONNE UPDATED_AT SI MANQUANTE
-- =====================================================

-- Ajouter la colonne updated_at si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Colonne updated_at ajoutée à la table profiles';
    ELSE
        RAISE NOTICE 'Colonne updated_at existe déjà dans la table profiles';
    END IF;
END $$;

-- =====================================================
-- FONCTION DE BONUS CORRIGÉE
-- =====================================================

-- Créer une table pour suivre les bonus quotidiens si elle n'existe pas
CREATE TABLE IF NOT EXISTS daily_bonus_log (
  id SERIAL PRIMARY KEY,
  bonus_date DATE DEFAULT CURRENT_DATE,
  users_count INTEGER DEFAULT 0,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_daily_bonus_log_date ON daily_bonus_log(bonus_date);

-- Fonction améliorée qui vérifie si le bonus d'aujourd'hui a déjà été donné
CREATE OR REPLACE FUNCTION public.smart_daily_bonus()
RETURNS TEXT AS $$
DECLARE 
  affected_users INTEGER;
  today_date DATE := CURRENT_DATE;
  bonus_already_given BOOLEAN;
  has_updated_at BOOLEAN;
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
  
  -- Vérifier si la colonne updated_at existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) INTO has_updated_at;
  
  -- Donner le bonus quotidien avec ou sans updated_at
  IF has_updated_at THEN
    UPDATE profiles 
    SET credits = credits + 1, updated_at = NOW();
  ELSE
    UPDATE profiles 
    SET credits = credits + 1;
  END IF;
  
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
  COALESCE(SUM(credits), 0) as "Total crédits",
  COALESCE(AVG(credits), 0) as "Moyenne crédits"
FROM profiles;

-- =====================================================
-- RAPPORT FINAL
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SYSTÈME DE BONUS QUOTIDIEN CORRIGÉ !';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔧 Table profiles vérifiée/corrigée';
  RAISE NOTICE '🎁 Fonction de bonus mise à jour';
  RAISE NOTICE '📅 Protection contre les doublons active';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📝 Utilisation:';
  RAISE NOTICE '• Test: SELECT smart_daily_bonus();';
  RAISE NOTICE '• Historique: SELECT * FROM daily_bonus_log;';
  RAISE NOTICE '• Crédits: SELECT id, credits FROM profiles LIMIT 5;';
  RAISE NOTICE '========================================';
END $$; 