import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const projectRef = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : '';

export const portalId = import.meta.env.VITE_PORTAL_ID || 'cybersphere-blog';
export const authStorageKey = 'cybersphere-auth';
export const publicAuthStorageKey = 'cybersphere-public-readonly';
export const legacyAuthStorageKey = projectRef ? `sb-${projectRef}-auth-token` : '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please configure in Figma Make settings.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: authStorageKey,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const publicSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: publicAuthStorageKey,
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
