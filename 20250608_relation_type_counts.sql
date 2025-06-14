-- Migration: Fix Repartition par type counts
-- File: 20250608_relation_type_counts.sql
-- Run this in your Supabase SQL editor

-- Create RPC function to count relations by type for authenticated user
create or replace function public.relation_type_counts()
returns table(
  type text,
  total bigint
)
security definer
language sql
stable
as $$
  select r.type, count(*)::bigint as total
  from relationships r
  where r.user_id = auth.uid()
  group by r.type;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.relation_type_counts() to authenticated;

-- Optional: Create a more comprehensive stats function
create or replace function public.relation_stats()
returns table(
  total_relations bigint,
  avg_rating numeric,
  recent_relations bigint,
  type_romantic bigint,
  type_sexual bigint,
  type_friend bigint,
  type_friendzone bigint,
  type_other bigint
)
security definer
language sql
stable
as $$
  select 
    count(*)::bigint as total_relations,
    round(avg(rating), 1) as avg_rating,
    count(case when created_at >= now() - interval '30 days' then 1 end)::bigint as recent_relations,
    count(case when type = 'romantic' then 1 end)::bigint as type_romantic,
    count(case when type = 'sexual' then 1 end)::bigint as type_sexual,
    count(case when type = 'friend' then 1 end)::bigint as type_friend,
    count(case when type = 'friendzone' then 1 end)::bigint as type_friendzone,
    count(case when type = 'other' then 1 end)::bigint as type_other
  from relationships r
  where r.user_id = auth.uid();
$$;

-- Grant execute permission for the stats function too
grant execute on function public.relation_stats() to authenticated;

-- Verify the functions work (optional test)
-- select * from relation_type_counts();
-- select * from relation_stats(); 