import { createClient } from '@supabase/Bolt Database-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const Bolt Database = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
};

export type StudySession = {
  id: string;
  user_id: string;
  persona_id: string;
  topic: string;
  study_notes: string;
  duration_seconds: number;
  summary: string;
  message_count: number;
  started_at: string;
  ended_at: string | null;
};

export type SessionMessage = {
  id: string;
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  position: number;
  created_at: string;
};
