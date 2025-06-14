-- Script pour ajouter le champ âge aux profils utilisateur
-- File: add-age-field.sql

-- =====================================================
-- AJOUT DU CHAMP ÂGE À LA TABLE PROFILES
-- =====================================================

-- Ajouter la colonne age si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'age'
    ) THEN
        ALTER TABLE profiles ADD COLUMN age INTEGER;
        RAISE NOTICE 'Colonne age ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne age existe déjà';
    END IF;
END $$;

-- Ajouter une contrainte pour valider l'âge (18-99 ans)
DO $$
BEGIN
    -- Supprimer la contrainte si elle existe déjà
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_age_check' AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_age_check;
    END IF;
    
    -- Ajouter la nouvelle contrainte
    ALTER TABLE profiles ADD CONSTRAINT profiles_age_check CHECK (age >= 18 AND age <= 99);
    RAISE NOTICE 'Contrainte d''âge ajoutée (18-99 ans)';
END $$;

-- =====================================================
-- FONCTION POUR METTRE À JOUR L'ÂGE
-- =====================================================

-- Fonction pour mettre à jour l'âge utilisateur
CREATE OR REPLACE FUNCTION public.update_user_age(user_age INTEGER, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier la validité de l'âge
  IF user_age < 18 OR user_age > 99 THEN
    RAISE EXCEPTION 'L''âge doit être compris entre 18 et 99 ans';
  END IF;
  
  -- S'assurer que le profil existe
  INSERT INTO profiles (id, credits, age) 
  VALUES (user_uuid, 30, user_age)
  ON CONFLICT (id) DO UPDATE SET 
    age = user_age, 
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION POUR OBTENIR L'ÂGE
-- =====================================================

-- Fonction pour obtenir l'âge utilisateur
CREATE OR REPLACE FUNCTION public.get_user_age(user_uuid UUID DEFAULT auth.uid())
RETURNS INTEGER AS $$
DECLARE user_age INTEGER;
BEGIN
  SELECT age INTO user_age FROM profiles WHERE id = user_uuid;
  RETURN user_age;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RAPPORT FINAL
-- =====================================================

DO $$
DECLARE
  users_with_age INTEGER;
  total_users INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_with_age FROM profiles WHERE age IS NOT NULL;
  SELECT COUNT(*) INTO total_users FROM profiles;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CHAMP ÂGE CONFIGURÉ AVEC SUCCÈS !';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Utilisateurs avec âge défini: % / %', users_with_age, total_users;
  RAISE NOTICE 'Contrainte: 18-99 ans';
  RAISE NOTICE '========================================';
END $$;