-- Mettre à jour la politique de sécurité pour la table 'profiles'
-- Cette politique permet aux utilisateurs de mettre à jour LEUR PROPRE profil.

-- 1. Supprimer l'ancienne politique de mise à jour si elle existe
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 2. Créer la nouvelle politique de mise à jour
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Commentaire :
-- USING (auth.uid() = id) : S'assure que l'utilisateur qui tente de faire la mise à jour est bien le propriétaire de la ligne.
-- WITH CHECK (auth.uid() = id) : S'assure que l'utilisateur ne peut pas changer l'ID de la ligne pour l'attribuer à quelqu'un d'autre.

-- 3. Activer la RLS (Row Level Security) sur la table 'profiles' si ce n'est pas déjà fait
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Message pour l'administrateur :
-- Exécutez ce script dans l'éditeur SQL de votre tableau de bord Supabase pour appliquer les changements.
-- Cela devrait résoudre le problème de mise à jour de l'âge qui reste bloqué.

SELECT 'La politique de sécurité pour la mise à jour des profils a été correctement configurée.'; 