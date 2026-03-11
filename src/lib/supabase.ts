import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  company: string;
  linkedin_url: string;
  website_url: string;
  plan: string;
  onboarding_completed: boolean;
}

export interface VoiceProfile {
  id: string;
  user_id: string;
  bio: string;
  expertise_topics: string[];
  tone_formality: number;
  tone_humor: number;
  tone_provocation: number;
  example_posts: string[];
  target_audience: string;
  goals: string[];
  language: string;
  custom_instructions: string;
  system_prompt: string;
}

export interface Draft {
  id: string;
  user_id: string;
  source_topic: string;
  source_url: string;
  draft_text: string;
  image_prompt: string;
  image_url: string;
  status: "generated" | "sent" | "approved" | "rejected" | "edited" | "published";
  user_feedback: string;
  revised_text: string;
  scheduled_for: string;
  created_at: string;
}
