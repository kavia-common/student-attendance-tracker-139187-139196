'use strict';
/**
 * Supabase server client helper.
 * Uses service role key on the server-side only. Do not expose SERVICE key to frontend.
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_KEY;

let supabase = null;

/**
 * getSupabase: returns a singleton instance of Supabase client
 * - Prefers SUPABASE_SERVICE_KEY for admin operations (RLS bypass).
 * - Falls back to anon key if provided, but many admin ops will fail under RLS.
 */
function getSupabase() {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      // Not throwing to avoid crashing the app if Supabase isn't configured yet.
      console.warn('[supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_KEY. Supabase integration is disabled.');
      return null;
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });
  }
  return supabase;
}

module.exports = { getSupabase };
