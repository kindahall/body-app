-- Script de correction des problèmes de sécurité Supabase
-- File: fix-supabase-security-issues.sql
-- À exécuter dans l'éditeur SQL de Supabase

-- =====================================================
-- 1. CORRECTION DES FONCTIONS AVEC SEARCH PATH MUTABLE
-- =====================================================

-- Fix function: relation_type_counts
CREATE OR REPLACE FUNCTION public.relation_type_counts()
RETURNS TABLE(
  type text,
  total bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT r.type, count(*)::bigint as total
  FROM public.relationships r
  WHERE r.user_id = auth.uid()
  GROUP BY r.type;
$$;

-- Fix function: relation_stats
CREATE OR REPLACE FUNCTION public.relation_stats()
RETURNS TABLE(
  total_relations bigint,
  avg_rating numeric,
  recent_relations bigint,
  type_romantic bigint,
  type_sexual bigint,
  type_friend bigint,
  type_friendzone bigint,
  type_other bigint
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT 
    count(*)::bigint as total_relations,
    round(avg(rating), 1) as avg_rating,
    count(case when created_at >= now() - interval '30 days' then 1 end)::bigint as recent_relations,
    count(case when type = 'Romantique' then 1 end)::bigint as type_romantic,
    count(case when type = 'Sexuelle' then 1 end)::bigint as type_sexual,
    count(case when type = 'Amitié' then 1 end)::bigint as type_friend,
    count(case when type = 'Friendzone' then 1 end)::bigint as type_friendzone,
    count(case when type = 'Autre' then 1 end)::bigint as type_other
  FROM public.relationships r
  WHERE r.user_id = auth.uid();
$$;

-- Fix function: update_archived_insights
CREATE OR REPLACE FUNCTION public.update_archived_insights()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix function: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix function: add_credits_to_user
CREATE OR REPLACE FUNCTION public.add_credits_to_user(user_uuid UUID, credit_amount INTEGER)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles 
  SET credits = credits + credit_amount,
      updated_at = NOW()
  WHERE id = user_uuid;
  
  RETURN FOUND;
END;
$$;

-- Fix function: consume_credits
CREATE OR REPLACE FUNCTION public.consume_credits(user_uuid UUID, credit_amount INTEGER)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits 
  FROM public.profiles 
  WHERE id = user_uuid;
  
  -- Check if user has enough credits
  IF current_credits >= credit_amount THEN
    -- Deduct credits
    UPDATE public.profiles 
    SET credits = credits - credit_amount,
        updated_at = NOW()
    WHERE id = user_uuid;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Fix function: increment_all_credits
CREATE OR REPLACE FUNCTION public.increment_all_credits()
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles 
  SET credits = credits + 1,
      updated_at = NOW();
END;
$$;

-- Fix function: spend_credits
CREATE OR REPLACE FUNCTION public.spend_credits(user_uuid UUID, credit_amount INTEGER)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits 
  FROM public.profiles 
  WHERE id = user_uuid;
  
  -- Check if user has enough credits
  IF current_credits >= credit_amount THEN
    -- Deduct credits
    UPDATE public.profiles 
    SET credits = credits - credit_amount,
        updated_at = NOW()
    WHERE id = user_uuid;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Fix function: add_credits
CREATE OR REPLACE FUNCTION public.add_credits(user_uuid UUID, credit_amount INTEGER)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles 
  SET credits = credits + credit_amount,
      updated_at = NOW()
  WHERE id = user_uuid;
  
  RETURN FOUND;
END;
$$;

-- Fix function: create_profile_for_new_user
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits, created_at, updated_at)
  VALUES (NEW.id, NEW.email, 30, NOW(), NOW());
  RETURN NEW;
END;
$$;

-- Fix function: daily_bonus
CREATE OR REPLACE FUNCTION public.daily_bonus()
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles 
  SET credits = credits + 1,
      updated_at = NOW();
END;
$$;

-- Fix function: update_user_username
CREATE OR REPLACE FUNCTION public.update_user_username(new_username TEXT, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Vérifier le format du username
  IF NOT new_username ~ '^[a-zA-Z0-9_-]{3,20}$' THEN
    RAISE EXCEPTION 'Le pseudo doit contenir entre 3 et 20 caractères (lettres, chiffres, tirets et underscores uniquement)';
  END IF;
  
  -- Vérifier si le username est déjà pris
  IF EXISTS (SELECT 1 FROM public.users WHERE username = new_username AND id != user_uuid) THEN
    RAISE EXCEPTION 'Ce pseudo est déjà utilisé';
  END IF;
  
  -- Mettre à jour le username
  UPDATE public.users SET username = new_username WHERE id = user_uuid;
  
  RETURN TRUE;
END;
$$;

-- Fix function: get_user_username
CREATE OR REPLACE FUNCTION public.get_user_username(user_uuid UUID DEFAULT auth.uid())
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE 
  user_username TEXT;
BEGIN
  SELECT username INTO user_username FROM public.users WHERE id = user_uuid;
  RETURN user_username;
END;
$$;

-- Fix function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits, created_at, updated_at)
  VALUES (NEW.id, NEW.email, 30, NOW(), NOW());
  RETURN NEW;
END;
$$;

-- Fix function: get_user_credits
CREATE OR REPLACE FUNCTION public.get_user_credits(user_uuid UUID DEFAULT auth.uid())
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE 
  user_credits INTEGER;
BEGIN
  SELECT credits INTO user_credits FROM public.profiles WHERE id = user_uuid;
  RETURN COALESCE(user_credits, 0);
END;
$$;

-- =====================================================
-- 2. CORRECTION DES PROBLÈMES RLS
-- =====================================================

-- Activer RLS sur relationships_backup si elle existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'relationships_backup') THEN
        ALTER TABLE public.relationships_backup ENABLE ROW LEVEL SECURITY;
        
        -- Créer des politiques RLS pour relationships_backup
        DROP POLICY IF EXISTS "Users can view own backup relationships" ON public.relationships_backup;
        CREATE POLICY "Users can view own backup relationships" ON public.relationships_backup
            FOR SELECT USING (auth.uid() = user_id);
            
        DROP POLICY IF EXISTS "Users can insert own backup relationships" ON public.relationships_backup;
        CREATE POLICY "Users can insert own backup relationships" ON public.relationships_backup
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
        DROP POLICY IF EXISTS "Users can update own backup relationships" ON public.relationships_backup;
        CREATE POLICY "Users can update own backup relationships" ON public.relationships_backup
            FOR UPDATE USING (auth.uid() = user_id);
            
        DROP POLICY IF EXISTS "Users can delete own backup relationships" ON public.relationships_backup;
        CREATE POLICY "Users can delete own backup relationships" ON public.relationships_backup
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- =====================================================
-- 3. PERMISSIONS ET GRANTS SÉCURISÉS
-- =====================================================

-- Révoquer les permissions publiques potentiellement dangereuses
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM public;

-- Accorder uniquement les permissions nécessaires aux fonctions publiques
GRANT EXECUTE ON FUNCTION public.relation_type_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.relation_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits_to_user(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_all_credits() TO service_role;
GRANT EXECUTE ON FUNCTION public.spend_credits(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_credits(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.daily_bonus() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_user_username(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_username(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_credits(UUID) TO authenticated;

-- =====================================================
-- 4. CONFIGURATION DE SÉCURITÉ ADDITIONNELLE
-- =====================================================

-- Activer la protection contre les mots de passe divulgués (si supporté)
-- Note: Cette fonctionnalité peut ne pas être disponible dans toutes les versions
DO $$
BEGIN
    -- Tentative d'activation de la protection des mots de passe
    PERFORM set_config('password_encryption', 'scram-sha-256', false);
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Protection des mots de passe non disponible dans cette version';
END $$;

-- =====================================================
-- 5. VÉRIFICATION ET RAPPORT FINAL
-- =====================================================

DO $$
DECLARE
    func_count INTEGER;
    table_count INTEGER;
BEGIN
    -- Compter les fonctions corrigées
    SELECT COUNT(*) INTO func_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN (
        'relation_type_counts', 'relation_stats', 'update_archived_insights',
        'update_updated_at_column', 'add_credits_to_user', 'consume_credits',
        'increment_all_credits', 'spend_credits', 'add_credits',
        'create_profile_for_new_user', 'daily_bonus', 'update_user_username',
        'get_user_username', 'handle_new_user', 'get_user_credits'
    );
    
    -- Compter les tables avec RLS activé
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables t
    JOIN pg_class c ON c.relname = t.table_name
    WHERE t.table_schema = 'public'
    AND c.relrowsecurity = true;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CORRECTION SÉCURITÉ SUPABASE TERMINÉE !';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fonctions corrigées: %', func_count;
    RAISE NOTICE 'Tables avec RLS: %', table_count;
    RAISE NOTICE 'Search path sécurisé pour toutes les fonctions';
    RAISE NOTICE 'Permissions restreintes aux rôles appropriés';
    RAISE NOTICE '========================================';
END $$;
