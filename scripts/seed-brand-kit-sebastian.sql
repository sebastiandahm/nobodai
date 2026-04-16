-- ============================================
-- Seed script: Sebastian Dahm demo brand kit
-- Project: awmastpeybhlaiqqvace
-- User ID: 7412b397-6d5c-487f-9485-63fa94f8d1cc
--
-- Prerequisite: run supabase/migrations/20260416_add_brand_kit.sql first.
-- Run manually in Supabase SQL Editor. Do NOT execute as part of CI.
-- OPCORE editorial palette — amber accent on dark editorial.
-- ============================================

update public.profiles
set
  brand_logo_url        = null,              -- upload via Account > Brand Kit when ready
  brand_primary_color   = '#F59E0B',         -- amber
  brand_secondary_color = '#0D1117',         -- editorial near-black
  brand_font_heading    = 'Georgia',
  brand_font_body       = 'Inter',
  brand_style_preset    = 'editorial'
where id = '7412b397-6d5c-487f-9485-63fa94f8d1cc';

-- Verify
select id, brand_primary_color, brand_secondary_color, brand_font_heading, brand_font_body, brand_style_preset
from public.profiles
where id = '7412b397-6d5c-487f-9485-63fa94f8d1cc';
