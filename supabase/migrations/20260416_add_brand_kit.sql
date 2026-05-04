-- ============================================
-- Phase 1: Brand Kit columns on profiles
-- Run manually in Supabase SQL Editor on project awmastpeybhlaiqqvace
-- ============================================

alter table public.profiles
  add column if not exists brand_logo_url text,
  add column if not exists brand_primary_color text,
  add column if not exists brand_secondary_color text,
  add column if not exists brand_font_heading text,
  add column if not exists brand_font_body text,
  add column if not exists brand_style_preset text default 'editorial';

-- Optional: keep existing rows consistent
update public.profiles
  set brand_style_preset = coalesce(brand_style_preset, 'editorial');

-- ============================================
-- Storage bucket 'brand-assets' must be created manually:
--   Supabase Dashboard -> Storage -> New Bucket -> name 'brand-assets', public = true
-- ============================================
