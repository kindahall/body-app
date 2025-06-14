-- Script complet pour recréer la table relationships avec toutes les colonnes nécessaires

-- Sauvegarder les données existantes si elles existent
CREATE TABLE IF NOT EXISTS relationships_backup AS 
SELECT * FROM relationships;

-- Supprimer la table existante
DROP TABLE IF EXISTS relationships CASCADE;

-- Recréer la table avec toutes les bonnes colonnes
CREATE TABLE relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('Romantique', 'Sexuelle', 'Amitié', 'Friendzone', 'Autre')),
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    location TEXT,
    feelings TEXT,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 10),
    private_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Créer un index sur user_id pour les performances
CREATE INDEX idx_relationships_user_id ON relationships(user_id);

-- Créer un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_relationships_updated_at 
    BEFORE UPDATE ON relationships 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS (Row Level Security)
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour que les utilisateurs ne voient que leurs données
CREATE POLICY "Users can view their own relationships" ON relationships
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own relationships" ON relationships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own relationships" ON relationships
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own relationships" ON relationships
    FOR DELETE USING (auth.uid() = user_id);

-- Vérifier la structure finale
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'relationships' 
ORDER BY ordinal_position; 