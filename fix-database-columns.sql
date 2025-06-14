-- Script pour corriger la table relationships
-- Supprimer l'ancienne colonne duration et ajouter la nouvelle colonne end_date

-- D'abord, sauvegarder les données existantes si nécessaire
-- et modifier la structure de la table

ALTER TABLE relationships 
DROP COLUMN IF EXISTS duration CASCADE;

ALTER TABLE relationships 
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Vérifier la structure finale
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'relationships' 
ORDER BY ordinal_position; 