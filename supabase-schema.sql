-- ============================================
-- nobod.ai Database Schema
-- Run this in Supabase SQL Editor (left menu → SQL Editor → New Query)
-- ============================================

-- 1. User Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  company text,
  linkedin_url text,
  website_url text,
  plan text default 'free' check (plan in ('free', 'starter', 'pro', 'enterprise')),
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Voice Profiles (AI personality per user)
create table public.voice_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  bio text,
  expertise_topics jsonb default '[]'::jsonb,
  tone_formality float default 0.5,
  tone_humor float default 0.3,
  tone_provocation float default 0.5,
  example_posts jsonb default '[]'::jsonb,
  target_audience text,
  goals jsonb default '[]'::jsonb,
  language text default 'de',
  custom_instructions text,
  system_prompt text, -- generated Claude prompt
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Content Drafts
create table public.drafts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  source_topic text,
  source_url text,
  draft_text text not null,
  image_prompt text,
  image_url text,
  status text default 'generated' check (status in ('generated', 'sent', 'approved', 'rejected', 'edited', 'published')),
  user_feedback text,
  revised_text text,
  published_at timestamptz,
  linkedin_post_id text,
  impressions integer default 0,
  reactions integer default 0,
  comments integer default 0,
  scheduled_for timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Topics Feed (daily trend monitoring)
create table public.topics (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  summary text,
  source_url text,
  relevance_tags jsonb default '[]'::jsonb,
  relevance_score float default 0,
  used_for_drafts boolean default false,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.voice_profiles enable row level security;
alter table public.drafts enable row level security;
alter table public.topics enable row level security;

-- RLS Policies: Users can only see/edit their own data
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can view own voice profile"
  on public.voice_profiles for select
  using (auth.uid() = user_id);

create policy "Users can manage own voice profile"
  on public.voice_profiles for all
  using (auth.uid() = user_id);

create policy "Users can view own drafts"
  on public.drafts for select
  using (auth.uid() = user_id);

create policy "Users can manage own drafts"
  on public.drafts for all
  using (auth.uid() = user_id);

create policy "Anyone can view topics"
  on public.topics for select
  to authenticated
  using (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger voice_profiles_updated_at before update on public.voice_profiles
  for each row execute procedure public.update_updated_at();

create trigger drafts_updated_at before update on public.drafts
  for each row execute procedure public.update_updated_at();
