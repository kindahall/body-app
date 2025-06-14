-- Script final pour corriger la fonctionnalité d'âge
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier si la table profiles existe, sinon la créer
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    credits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ajouter la colonne age si elle n'existe pas
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age >= 18 AND age <= 99);

-- 3. Activer RLS si ce n'est pas déjà fait
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Supprimer les anciennes politiques et en créer de nouvelles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 5. Créer les politiques correctes
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Vérification finale
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('id', 'age', 'credits', 'email')
ORDER BY column_name;

-- Message de confirmation
SELECT 'Configuration de la table profiles terminée avec succès!' as status; 