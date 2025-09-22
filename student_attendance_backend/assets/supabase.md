# Supabase Integration Plan (Backend)

This backend does not require Supabase at runtime yet, but is prepared for future integration. When integrating:
- Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_KEY in the .env file.
- Add `@supabase/supabase-js` to dependencies.
- Create a service wrapper at `src/services/supabase.js`:
  - Export a singleton supabase client using `createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)`.
  - Use service key only on the server, never expose in frontend.
- Potential use cases:
  - Offloading auth to Supabase Auth (replace local JWT).
  - Storing files (e.g., CSV exports) in storage buckets.
  - Using Postgres via Supabase managed DB (replace knex configuration with Supabase connection string).

Security Notes:
- Do not commit secrets.
- Use SITE_URL when integrating magic link login flows to set `emailRedirectTo` for signup/login.
