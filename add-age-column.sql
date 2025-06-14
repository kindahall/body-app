-- Script pour ajouter la colonne 'age' à la table profiles existante
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Ajouter la colonne age si elle n'existe pas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age >= 18 AND age <= 99);

-- 2. Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'age';

-- Message de confirmation
SELECT 'Colonne age ajoutée avec succès à la table profiles!' as message; 