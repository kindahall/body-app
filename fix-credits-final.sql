-- Script FINAL pour corriger le système de crédits
-- File: fix-credits-final.sql
-- Gère les triggers existants et les conflits

-- =====================================================
-- 1. CRÉER LA TABLE PROFILES (version simple)
-- =====================================================

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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own profile credits" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile credits" ON profiles;
    DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
END $$;

CREATE POLICY "Users can view own profile credits" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile credits" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage profiles" ON profiles
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 3. DONNER 30 CRÉDITS À TOUS LES UTILISATEURS
-- =====================================================

INSERT INTO profiles (id, credits)
SELECT id, 30
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles WHERE id IS NOT NULL)
ON CONFLICT (id) DO NOTHING;

UPDATE profiles 
SET credits = 30
WHERE credits = 0 OR credits IS NULL;

-- =====================================================
-- 4. FONCTIONS ESSENTIELLES
-- =====================================================

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
-- 5. SUPPRIMER LES ANCIENS TRIGGERS ET FONCTIONS
-- =====================================================

-- Supprimer TOUS les triggers existants qui pourraient utiliser la fonction
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Maintenant on peut supprimer la fonction sans erreur
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;

-- =====================================================
-- 6. CRÉER LE NOUVEAU TRIGGER POUR NOUVEAUX UTILISATEURS
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, credits)
  VALUES (NEW.id, 30)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger avec un nom unique
CREATE TRIGGER create_profile_trigger_new
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();

-- =====================================================
-- 7. FONCTION BONUS QUOTIDIEN
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
-- 8. RAPPORT FINAL
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
  RAISE NOTICE '✅ SYSTÈME DE CRÉDITS CONFIGURÉ !';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Utilisateurs total: %', total_users;
  RAISE NOTICE 'Utilisateurs avec profil: %', users_with_profiles;
  RAISE NOTICE 'Total crédits distribués: %', COALESCE(total_credits, 0);
  RAISE NOTICE '========================================';
  RAISE NOTICE '💰 Configuration:';
  RAISE NOTICE '• Crédits de départ: 30 (3 analyses IA)';
  RAISE NOTICE '• Bonus quotidien: +1 crédit/jour';
  RAISE NOTICE '• Coût par analyse: 10 crédits';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎯 Prêt à utiliser ! Rechargez votre app.';
  RAISE NOTICE '========================================';
END $$; 