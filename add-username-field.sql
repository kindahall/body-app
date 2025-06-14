-- Script pour ajouter le champ username à la table users
-- File: add-username-field.sql

-- =====================================================
-- AJOUT DU CHAMP USERNAME À LA TABLE USERS
-- =====================================================

-- Ajouter la colonne username si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'username'
    ) THEN
        ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
        RAISE NOTICE 'Colonne username ajoutée avec succès';
    ELSE
        RAISE NOTICE 'Colonne username existe déjà';
    END IF;
END $$;

-- Ajouter une contrainte pour valider le username
DO $$
BEGIN
    -- Supprimer la contrainte si elle existe déjà
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_username_format_check' AND table_name = 'users'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_username_format_check;
    END IF;
    
    -- Ajouter la nouvelle contrainte
    ALTER TABLE users ADD CONSTRAINT users_username_format_check 
        CHECK (username ~ '^[a-zA-Z0-9_-]{3,20}$');
    RAISE NOTICE 'Contrainte de format username ajoutée (3-20 caractères, lettres, chiffres, tirets et underscores)';
END $$;

-- Créer un index unique pour améliorer les performances des recherches
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- =====================================================
-- FONCTION POUR METTRE À JOUR LE USERNAME
-- =====================================================

-- Fonction pour mettre à jour le username utilisateur
CREATE OR REPLACE FUNCTION public.update_user_username(new_username TEXT, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier le format du username
  IF NOT new_username ~ '^[a-zA-Z0-9_-]{3,20}$' THEN
    RAISE EXCEPTION 'Le pseudo doit contenir entre 3 et 20 caractères (lettres, chiffres, tirets et underscores uniquement)';
  END IF;
  
  -- Vérifier si le username est déjà pris
  IF EXISTS (SELECT 1 FROM users WHERE username = new_username AND id != user_uuid) THEN
    RAISE EXCEPTION 'Ce pseudo est déjà utilisé';
  END IF;
  
  -- Mettre à jour le username
  UPDATE users SET username = new_username WHERE id = user_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION POUR OBTENIR LE USERNAME
-- =====================================================

-- Fonction pour obtenir le username utilisateur
CREATE OR REPLACE FUNCTION public.get_user_username(user_uuid UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE user_username TEXT;
BEGIN
  SELECT username INTO user_username FROM users WHERE id = user_uuid;
  RETURN user_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RAPPORT FINAL
-- =====================================================

DO $$
DECLARE
  users_with_username INTEGER;
  total_users INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_with_username FROM users WHERE username IS NOT NULL;
  SELECT COUNT(*) INTO total_users FROM users;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CHAMP USERNAME CONFIGURÉ AVEC SUCCÈS !';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Utilisateurs avec username défini: % / %', users_with_username, total_users;
  RAISE NOTICE 'Contrainte: 3-20 caractères, lettres, chiffres, tirets et underscores';
  RAISE NOTICE '========================================';
END $$; 