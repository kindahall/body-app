-- Add credits column to profiles table
alter table profiles
  add column if not exists credits integer default 0;

-- Create credit purchases table
create table if not exists credit_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  stripe_session_id text unique,
  pack_type text not null, -- pack_50, pack_150, pack_500
  credits integer not null,
  amount_cents integer not null,
  created_at timestamptz default now()
);

-- Enable RLS on credit_purchases
alter table credit_purchases enable row level security;

-- RLS policies for credit_purchases
create policy "Users can view own credit purchases"
on credit_purchases for select using ( user_id = auth.uid() );

-- Function to increment all users' credits (daily bonus)
create or replace function increment_all_credits()
returns void language plpgsql security definer as $$
begin
  update profiles set credits = credits + 1;
end; $$;

-- Function to add credits to a specific user
create or replace function add_credits_to_user(user_uuid uuid, credit_amount integer)
returns void language plpgsql security definer as $$
begin
  update profiles 
  set credits = credits + credit_amount 
  where id = user_uuid;
end; $$;

-- Function to consume credits for AI analysis
create or replace function consume_credits(user_uuid uuid, credit_amount integer)
returns boolean language plpgsql security definer as $$
declare
  current_credits integer;
begin
  -- Get current credits
  select credits into current_credits 
  from profiles 
  where id = user_uuid;
  
  -- Check if user has enough credits
  if current_credits >= credit_amount then
    -- Deduct credits
    update profiles 
    set credits = credits - credit_amount 
    where id = user_uuid;
    return true;
  else
    return false;
  end if;
end; $$;

-- Add indexes for performance
create index if not exists idx_credit_purchases_user_id on credit_purchases(user_id);
create index if not exists idx_credit_purchases_stripe_session on credit_purchases(stripe_session_id);
create index if not exists idx_profiles_credits on profiles(credits); 