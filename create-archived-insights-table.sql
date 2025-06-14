-- Table pour stocker les analyses IA archivées
CREATE TABLE IF NOT EXISTS archived_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    analysis TEXT NOT NULL,
    data_snapshot JSONB NOT NULL,
    tags TEXT[] DEFAULT '{}',
    folder_name TEXT DEFAULT 'Non classé',
    generated_at TIMESTAMPTZ NOT NULL,
    archived_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_archived_insights_user_id ON archived_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_archived_insights_folder ON archived_insights(user_id, folder_name);
CREATE INDEX IF NOT EXISTS idx_archived_insights_tags ON archived_insights USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_archived_insights_generated_at ON archived_insights(generated_at DESC);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_archived_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_archived_insights_updated_at 
    BEFORE UPDATE ON archived_insights 
    FOR EACH ROW 
    EXECUTE FUNCTION update_archived_insights_updated_at();

-- Activer RLS
ALTER TABLE archived_insights ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view their own archived insights" ON archived_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own archived insights" ON archived_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own archived insights" ON archived_insights
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own archived insights" ON archived_insights
    FOR DELETE USING (auth.uid() = user_id);

-- Vérifier la structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'archived_insights' 
ORDER BY ordinal_position; 