-- Script pour corriger le système de crédits
-- File: fix-credits-system.sql
-- À exécuter dans Supabase SQL Editor

-- 1. Créer la table profiles si elle n'existe pas (distincte de users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    credits INTEGER DEFAULT 30, -- 30 crédits de départ (3 analyses IA)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer RLS sur profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Politiques RLS pour profiles
CREATE POLICY "Users can view own profile credits" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile credits" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile credits" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Créer des profils pour tous les utilisateurs existants dans auth.users
INSERT INTO profiles (id, credits)
SELECT id, 30
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- 5. Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, credits)
  VALUES (NEW.id, 30);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger pour créer automatiquement un profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();

-- 7. Fonction pour le bonus quotidien (mise à jour pour table profiles)
CREATE OR REPLACE FUNCTION increment_all_credits()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles SET 
    credits = credits + 1,
    updated_at = NOW();
END; $$;

-- 8. Fonction pour ajouter des crédits à un utilisateur spécifique
CREATE OR REPLACE FUNCTION add_credits_to_user(user_uuid uuid, credit_amount integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, credits)
  VALUES (user_uuid, credit_amount)
  ON CONFLICT (id) 
  DO UPDATE SET 
    credits = profiles.credits + credit_amount,
    updated_at = NOW();
END; $$;

-- 9. Fonction pour consommer des crédits
CREATE OR REPLACE FUNCTION consume_credits(user_uuid uuid, credit_amount integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  current_credits integer;
BEGIN
  -- Récupérer les crédits actuels
  SELECT credits INTO current_credits 
  FROM profiles 
  WHERE id = user_uuid;
  
  -- Si pas de profil, créer avec 0 crédits
  IF current_credits IS NULL THEN
    INSERT INTO profiles (id, credits) VALUES (user_uuid, 0);
    RETURN false;
  END IF;
  
  -- Vérifier si assez de crédits
  IF current_credits >= credit_amount THEN
    -- Déduire les crédits
    UPDATE profiles 
    SET 
      credits = credits - credit_amount,
      updated_at = NOW()
    WHERE id = user_uuid;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END; $$;

-- 10. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_credits ON profiles(credits);

-- 11. Fonction pour vérifier les crédits d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_credits(user_uuid uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  user_credits integer;
BEGIN
  SELECT credits INTO user_credits 
  FROM profiles 
  WHERE id = user_uuid;
  
  -- Si pas de profil, en créer un avec 30 crédits
  IF user_credits IS NULL THEN
    INSERT INTO profiles (id, credits) VALUES (user_uuid, 30);
    RETURN 30;
  END IF;
  
  RETURN user_credits;
END; $$;

-- 12. Accorder les permissions aux utilisateurs authentifiés
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT EXECUTE ON FUNCTION add_credits_to_user(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION consume_credits(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_credits(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_all_credits() TO service_role;

-- 13. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Système de crédits configuré avec succès !';
  RAISE NOTICE 'Tous les utilisateurs existants ont reçu 30 crédits de départ.';
  RAISE NOTICE 'Les nouveaux utilisateurs recevront automatiquement 30 crédits.';
  RAISE NOTICE 'Bonus quotidien: +1 crédit par jour pour tous les utilisateurs.';
END $$; 