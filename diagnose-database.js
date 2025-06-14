#!/usr/bin/env node

/**
 * Script de diagnostic de la base de données
 * Vérifie l'état de la table profiles et des permissions
 */

console.log('🔍 Diagnostic de la base de données BodyCount...\n')

console.log('📋 Étapes de diagnostic recommandées:')
console.log('')

console.log('1️⃣ Vérifiez que la table profiles existe:')
console.log('   Allez dans Supabase > Table Editor')
console.log('   Cherchez la table "profiles"')
console.log('')

console.log('2️⃣ Si la table n\'existe pas, exécutez ce SQL:')
console.log(`
-- Créer la table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    age INTEGER CHECK (age >= 18 AND age <= 99),
    credits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
`)

console.log('3️⃣ Vérifiez les politiques RLS:')
console.log('   Allez dans Supabase > Authentication > Policies')
console.log('   Cherchez les politiques pour la table "profiles"')
console.log('')

console.log('4️⃣ Si les politiques sont incorrectes, exécutez:')
console.log(`
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Créer les nouvelles politiques
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Accorder les permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
`)

console.log('5️⃣ Testez les permissions avec cette requête:')
console.log(`
-- Tester la lecture (remplacez YOUR_USER_ID par votre ID utilisateur)
SELECT * FROM public.profiles WHERE id = auth.uid();

-- Tester la mise à jour
UPDATE public.profiles 
SET age = 25, updated_at = now() 
WHERE id = auth.uid();
`)

console.log('')
console.log('📍 Informations supplémentaires:')
console.log('   - Votre ID utilisateur doit correspondre à l\'ID dans auth.users')
console.log('   - Les politiques RLS doivent permettre auth.uid() = id')
console.log('   - La table doit avoir toutes les colonnes nécessaires')
console.log('')

console.log('🚀 Après avoir appliqué ces corrections:')
console.log('   1. Redémarrez l\'application: npm run dev')
console.log('   2. Testez la mise à jour de l\'âge')
console.log('   3. Vérifiez les logs de la console pour plus de détails')
console.log('')

console.log('✅ Diagnostic terminé!')
console.log('   Consultez fix-age-update-rls.sql pour le script complet.') 