-- Script SIMPLE pour corriger le système de crédits
-- File: fix-credits-simple.sql
-- Version minimaliste sans colonnes optionnelles

-- =====================================================
-- 1. CRÉER LA TABLE PROFILES (version simple)
-- =====================================================

-- Créer la table profiles avec seulement les colonnes essentielles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    credits INTEGER DEFAULT 30
);

-- Ajouter la colonne credits si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'credits'
    ) THEN
        ALTER TABLE profiles ADD COLUMN credits INTEGER DEFAULT 30;
    END IF;
END $$;

-- =====================================================
-- 2. PERMISSIONS (RLS) 
-- =====================================================

-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own profile credits" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile credits" ON profiles;
    DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
END $$;

-- Créer les nouvelles politiques
CREATE POLICY "Users can view own profile credits" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile credits" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage profiles" ON profiles
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 3. DONNER 30 CRÉDITS À TOUS LES UTILISATEURS
-- =====================================================

-- Créer des profils pour tous les utilisateurs existants
INSERT INTO profiles (id, credits)
SELECT id, 30
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles WHERE id IS NOT NULL)
ON CONFLICT (id) DO NOTHING;

-- Mettre à jour les utilisateurs avec 0 crédits pour leur donner 30
UPDATE profiles 
SET credits = 30
WHERE credits = 0 OR credits IS NULL;

-- =====================================================
-- 4. FONCTIONS ESSENTIELLES
-- =====================================================

-- Fonction pour obtenir les crédits
CREATE OR REPLACE FUNCTION public.get_user_credits(user_uuid UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
DECLARE user_credits INTEGER;
BEGIN
  SELECT credits INTO user_credits FROM profiles WHERE id = user_uuid;
  
  IF user_credits IS NULL THEN
    INSERT INTO profiles (id, credits) VALUES (user_uuid, 30)
    ON CONFLICT (id) DO UPDATE SET credits = 30;
    RETURN 30;
  END IF;
  
  RETURN user_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour dépenser des crédits
CREATE OR REPLACE FUNCTION public.spend_credits(amount INTEGER, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE 
  current_credits INTEGER;
BEGIN
  SELECT get_user_credits(user_uuid) INTO current_credits;
  
  IF current_credits < amount THEN
    RETURN FALSE;
  END IF;
  
  UPDATE profiles 
  SET credits = credits - amount
  WHERE id = user_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter des crédits
CREATE OR REPLACE FUNCTION public.add_credits(amount INTEGER, user_uuid UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
DECLARE new_total INTEGER;
BEGIN
  PERFORM get_user_credits(user_uuid);
  
  UPDATE profiles 
  SET credits = credits + amount
  WHERE id = user_uuid
  RETURNING credits INTO new_total;
  
  RETURN new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. TRIGGER POUR NOUVEAUX UTILISATEURS
-- =====================================================

DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user();

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, credits)
  VALUES (NEW.id, 30)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();

-- =====================================================
-- 6. FONCTION BONUS QUOTIDIEN
-- =====================================================

CREATE OR REPLACE FUNCTION public.daily_bonus()
RETURNS TEXT AS $$
DECLARE 
  affected_users INTEGER;
BEGIN
  UPDATE profiles 
  SET credits = credits + 1;
  
  GET DIAGNOSTICS affected_users = ROW_COUNT;
  
  RETURN format('Bonus quotidien accordé à %s utilisateurs', affected_users);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. RAPPORT FINAL
-- =====================================================

DO $$
DECLARE
  total_users INTEGER;
  users_with_profiles INTEGER;
  total_credits INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM auth.users;
  SELECT COUNT(*) INTO users_with_profiles FROM profiles;
  SELECT SUM(credits) INTO total_credits FROM profiles;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SYSTÈME DE CRÉDITS CONFIGURÉ ! ✅';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Utilisateurs total: %', total_users;
  RAISE NOTICE 'Utilisateurs avec profil: %', users_with_profiles;
  RAISE NOTICE 'Total crédits distribués: %', COALESCE(total_credits, 0);
  RAISE NOTICE 'Crédits par défaut: 30 (3 analyses IA)';
  RAISE NOTICE 'Bonus quotidien: +1 crédit/jour';
  RAISE NOTICE '========================================';
END $$; 